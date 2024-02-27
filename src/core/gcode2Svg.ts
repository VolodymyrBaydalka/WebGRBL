import { Command, parseGCodeLine, pureGCodeLines } from "./gcode";

type Context = {
    currentCommand: string;
    x: number;
    y: number;
    relative: boolean;
    bbox: number[];
}

const codes: Record<string, (ctx: Context, cmd: Command) => string | void> = {
    "g0": translateTo,
    "g1": lineTo,
    "g2": (ctx, cmd) => curve(ctx, cmd, 1),
    "g3": (ctx, cmd) => curve(ctx, cmd, 0),
    "g90": ctx => { ctx.relative = false; },
    "g91": ctx => { ctx.relative = true; },
}

export function gcode2Svg(gcode: string): [string, number[]] {
	var ctx: Context = { currentCommand: '', x: 0, y: 0, relative: false, bbox: [0,0,0,0] };
	
    const result = pureGCodeLines(gcode).map(line => {
        const cmd = parseGCodeLine(line);
        const type = cmd.type ? (ctx.currentCommand = cmd.type) : ctx.currentCommand;
        return `<!-- ${line} = ${JSON.stringify(cmd)} -->\n${codes[type]?.(ctx, cmd) ?? ''}`
    }).join('\n');

    return [result, ctx.bbox];
}

function translateTo (ctx: Context, cmd: Command) {
    return lineTo(ctx, cmd, `class="gcode-g0"`);
}

function lineTo (ctx: Context, cmd: Command, extra = "") {
    const { x, y } = ctx;

    if ('x' in cmd) ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
    if ('y' in cmd) ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);

    updateBBox(ctx);

    return `<line x1="${x}" y1="${y}" x2="${ctx.x}" y2="${ctx.y}" ${extra}/>`;
}

function curve(ctx: Context, cmd: Command, clockwise: 0 | 1) {
    const { x, y } = ctx;

    if ('x' in cmd) ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
    if ('y' in cmd) ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);
    if ('i' in cmd && 'j' in cmd ) {
        const a = Math.sqrt(Math.pow(cmd.i, 2) + Math.pow(cmd.j, 2));

        updateBBox(ctx);

        return `<path d="M${x},${y} A${a},${a} 1 0,${clockwise} ${ctx.x},${ctx.y}"/>`;
	}
}

function updateBBox(ctx: Context) {
    ctx.bbox[0] = Math.min(ctx.bbox[0], Math.floor(ctx.x));
    ctx.bbox[1] = Math.min(ctx.bbox[1], Math.floor(ctx.y));
    ctx.bbox[2] = Math.max(ctx.bbox[2], Math.ceil(ctx.x));
    ctx.bbox[3] = Math.max(ctx.bbox[3], Math.ceil(ctx.y));
}