const newLine = "\n";

export function trimGCodeComment(line: string) {
    return line.split(";")[0].trim();
}

export function splitGCodeByLines(gcode: string) {
    return gcode.split(newLine);
}

export function pureGCodeLines(gcode: string) {
    return splitGCodeByLines(gcode).map(trimGCodeComment).filter(x => x);
}