const newLine = "\n";

export type Command = {
    number?: number;
    type?: string;
} & Record<string, number>;

export function trimGCodeComment(line: string) {
    return line.split(";")[0].trim();
}

export function splitGCodeByLines(gcode: string) {
    return gcode.split(newLine);
}

export function pureGCodeLines(gcode: string) {
    return splitGCodeByLines(gcode).map(trimGCodeComment).filter(x => x);
}

export function parseGCodeLine(line: string) {
    const result: Command = {};

    for (let [part] of line.matchAll(/[gmnxyzfjiksp][.\-0-9]+/gi)) {
        const lpart = part.toLowerCase();

        if (lpart.startsWith("g") || lpart.startsWith("m")) {
            result.type = lpart;
        } else if(lpart.startsWith("n")) {
            result.number = parseInt(lpart.substring(1));
        } else {
            result[lpart[0]] = parseFloat(lpart.substring(1));
        }
    }
    
    return result;
}