import { pureGCodeLines } from "./gcode";

type Context = {
    x: number;
    y: number;
    relative: boolean;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

type Command = { name: string } & any;

const codes: Record<string, (ctx: Context, cmd: Command) => string | void> = {
    "G0": translateTo,
    "G1": lineTo,
    "G2": (ctx, cmd) => curve(ctx, cmd, 1),
    "G3": (ctx, cmd) => curve(ctx, cmd, 0),
    "G90": ctx => { ctx.relative = false; },
    "G91": ctx => { ctx.relative = true; },
}

export function gcode2Svg(gcode: string): string {
	var ctx: Context = { x: 0, y: 0, relative: false, minX: 0, minY: 0, maxX: 0, maxY:0 };
	
	const result = pureGCodeLines(gcode)
        .map(line => {
            const cmd = parseLine(line);
            return `<!-- ${line}-->\n${codes[cmd.name]?.(ctx, cmd) ?? ''}`
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
        viewBox="${ctx.minX} ${ctx.minY} ${ctx.maxX} ${ctx.maxY}" stroke="red" fill="none">${result}</svg>`;
}

function parseLine(line: string): Command {
    const parts = line.split(' ');
    const result = {
        name: parts[0].toUpperCase()
    };

    for (let i = 1; i < parts.length; i ++) {
        const part = parts[i];
        result[part[0].toLowerCase()] = part.length > 1 ? (parseFloat(part.substring(1)) || 0) : true
    }

    return result;
}

function translateTo (ctx: Context, cmd: Command) {
	if ('x' in cmd && 'y' in cmd) {
        ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
        ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);

        updateBBox(ctx);

		return `<!-- translate to [${ctx.x}, ${ctx.y}] -->`;
	}
}

function lineTo (ctx: Context, cmd: Command) {
	if ('x' in cmd && 'y' in cmd) {
		const x1 = ctx.x;
        const y1 = ctx.y;
        ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
        ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);

        updateBBox(ctx);

		return `<line x1="${x1}" y1="${y1}" x2="${ctx.x}" y2="${ctx.y}"/>`;
	}
}

function curve(ctx: Context, cmd: Command, clockwise: 0 | 1) {
	if ('x' in cmd && 'y' in cmd && 'i' in cmd && 'j' in cmd ) {
		const x1 = ctx.x;
        const y1 = ctx.y;
        const a = Math.sqrt(Math.pow(cmd.i, 2) + Math.pow(cmd.j, 2));
        ctx.x = cmd.x + (ctx.relative ? ctx.x : 0);
        ctx.y = cmd.y + (ctx.relative ? ctx.y : 0);

        updateBBox(ctx);

		return `<path d="M${x1},${y1} A${a},${a} 1 0,${clockwise} ${ctx.x},${ctx.y}"/>`;
	}
}

function updateBBox(ctx: Context) {
    ctx.minX = Math.min(ctx.minX, ctx.x);
    ctx.minY = Math.min(ctx.minY, ctx.y);
    ctx.maxX = Math.max(ctx.maxX, ctx.x);
    ctx.maxY = Math.max(ctx.maxY, ctx.y);
}