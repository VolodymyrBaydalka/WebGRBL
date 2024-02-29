import { Group } from "three";
import { Command, parseGCodeLine, pureGCodeLines } from "./gcode";
import { Line } from "three";
import { BufferGeometry } from "three";
import { Vector3 } from "three";
import { LineBasicMaterial } from "three";

type Context = {
    currentCommand: string;
    x: number;
    y: number;
    z: number;
    relative: boolean;
    bbox: number[];
}

const codes: Record<string, (ctx: Context, cmd: Command) => any> = {
    "g0": (ctx, cmd) => lineTo(ctx, cmd, 0x81b590),
    "g1": (ctx, cmd) => lineTo(ctx, cmd, 0xff0000),
    "g2": (ctx, cmd) => curve(ctx, cmd, 1),
    "g3": (ctx, cmd) => curve(ctx, cmd, 0),
    "g90": ctx => { ctx.relative = false; },
    "g91": ctx => { ctx.relative = true; },
}

export function gcode2ThreeModel(gcode: string): [Group, number[]] {
	var ctx: Context = { currentCommand: '', x: 0, y: 0, z: 0, relative: false, bbox: [0,0,0,0] };
	
    const g = new Group();

    for (let line of pureGCodeLines(gcode)) {
        const cmd = parseGCodeLine(line);
        const type = cmd.type ? (ctx.currentCommand = cmd.type) : ctx.currentCommand;
        const geom = codes[type]?.(ctx, cmd);

        if (geom != null)
            g.add(geom);
    }

    return [g, ctx.bbox];
}

function lineTo (ctx: Context, cmd: Command, color: any = 0x0000ff) {
    const { x, y, z } = ctx;

    if ('x' in cmd) ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
    if ('y' in cmd) ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);
    if ('z' in cmd) ctx.z = cmd.z + (ctx.relative ? ctx.z : 0);

    updateBBox(ctx);

    const geom = new BufferGeometry();
    const material = new LineBasicMaterial( { color, linewidth: 2 } );
    geom.setFromPoints( [ new Vector3(x, z, y), new Vector3(ctx.x, ctx.z, ctx.y)] );
    return new Line(geom, material);
}

function curve(ctx: Context, cmd: Command, clockwise: 0 | 1) {
    const { x, y } = ctx;

    if ('x' in cmd) ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
    if ('y' in cmd) ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);
    if ('i' in cmd && 'j' in cmd ) {
        const a = Math.sqrt(Math.pow(cmd.i, 2) + Math.pow(cmd.j, 2));

        updateBBox(ctx);

        return null;

        //return `<path d="M${x},${y} A${a},${a} 1 0,${clockwise} ${ctx.x},${ctx.y}"/>`;
	}
}

function updateBBox(ctx: Context) {
    ctx.bbox[0] = Math.min(ctx.bbox[0], Math.floor(ctx.x));
    ctx.bbox[1] = Math.min(ctx.bbox[1], Math.floor(ctx.y));
    ctx.bbox[2] = Math.max(ctx.bbox[2], Math.ceil(ctx.x));
    ctx.bbox[3] = Math.max(ctx.bbox[3], Math.ceil(ctx.y));
}