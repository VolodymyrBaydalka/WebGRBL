import { Command, parseGCodeLine, pureGCodeLines } from "./gcode";

type Context = {
    currentCommand: string;
    x: number;
    y: number;
    relative: boolean;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

const codes: Record<string, (ctx: Context, cmd: Command) => string | void> = {
    "g0": translateTo,
    "g1": lineTo,
    "g2": (ctx, cmd) => curve(ctx, cmd, 1),
    "g3": (ctx, cmd) => curve(ctx, cmd, 0),
    "g90": ctx => { ctx.relative = false; },
    "g91": ctx => { ctx.relative = true; },
}

export function gcode2Svg(gcode: string): string {
	var ctx: Context = { currentCommand: '', x: 0, y: 0, relative: false, minX: 0, minY: 0, maxX: 0, maxY:0 };
	
	const result = pureGCodeLines(gcode)
        .map(line => {
            const cmd = parseGCodeLine(line);
            const type = cmd.type ? (ctx.currentCommand = cmd.type) : ctx.currentCommand;
            return `<!-- ${line} = ${JSON.stringify(cmd)} -->\n${codes[type]?.(ctx, cmd) ?? ''}`
        })
        .join('\n');

    return result;

    // return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    // <svg xmlns="http://www.w3.org/2000/svg" version="1.1" preserveAspectRatio="xMidYMid meet"
    //     viewBox="${ctx.minX} ${ctx.minY} ${ctx.maxX} ${ctx.maxY}" stroke="red" fill="none">
    //     <style>line { vector-effect: non-scaling-stroke; } </style>
    //     ${result}</svg>`;
}

function translateTo (ctx: Context, cmd: Command) {
    if ('x' in cmd) ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
    if ('y' in cmd) ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);

    updateBBox(ctx);

    return `<!-- translate to [${ctx.x}, ${ctx.y}] -->`;
}

function lineTo (ctx: Context, cmd: Command) {
    const { x, y } = ctx;

    if ('x' in cmd) ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
    if ('y' in cmd) ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);

    updateBBox(ctx);

    return `<line x1="${x}" y1="${y}" x2="${ctx.x}" y2="${ctx.y}"/>`;
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
    ctx.minX = Math.min(ctx.minX, Math.floor(ctx.x));
    ctx.minY = Math.min(ctx.minY, Math.floor(ctx.y));
    ctx.maxX = Math.max(ctx.maxX, Math.ceil(ctx.x));
    ctx.maxY = Math.max(ctx.maxY, Math.ceil(ctx.y));
}