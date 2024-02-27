const newLine = "\r\n";

export function svg2GCode(svg: string) {
    const parser = new DOMParser();
    const root = parser.parseFromString(svg, "text/xml");
    return parseNode(root.documentElement);
}

function parseNode(el: Element): string {
    let result = "";

    switch (el.localName) {
        case "path":
            result += parsePathData(el.getAttribute("d") as string);
            break;
    }

    for (let c of el.childNodes) {
        if (c.nodeType == Node.ELEMENT_NODE)
            result += parseNode(c as Element);
    }

    return result;
}

function parsePathData(data: string) {
    let i = 0;
    const parts = [...data.matchAll(/[mlvhcaqsz]|[-.0-9]+/gmi)];
    const next = () => parts[i++]?.[0];
    const nextNum = () => parseFloat(next());

    let result = "";
    let command: any = null;
    let posX = 0;
    let posY = 0;
    let startX = 0;
    let startY = 0;

    while (i < parts.length) {
        const c = next();

        if (/[mlvhcaqsz]/i.test(c)) {
            command = c;
        } else {
            i--;
        }

        switch (command) {
            case "m": {
                startX = posX = posX + nextNum();
                startY = posY = posY + nextNum();
                result += `G0 X${posX} Y${posY} ${newLine}`
            } break;

            case "M": {
                startX = posX = nextNum();
                startY = posY = nextNum();
                result += `G0 X${posX} Y${posY} ${newLine}`
            } break;

            case "l": {
                posX += nextNum();
                posY += nextNum();
                result += `G1 X${posX} Y${posY} ${newLine}`
            } break;

            case "L": {
                posX = nextNum();
                posY = nextNum();
                result += `G1 X${posX} Y${posY} ${newLine}`
            } break;

            case "v": {
                posY += nextNum();
                result += `G1 Y${posY} ${newLine}`
            } break;

            case "V": {
                posY = nextNum();
                result += `G1 Y${posY} ${newLine}`
            } break;

            case "h": {
                posX += nextNum();
                result += `G1 X${posX} ${newLine}`
            } break;

            case "H": {
                posX = nextNum();
                result += `G1 X${posX} ${newLine}`
            } break;

            case "z":
            case "Z": {
                result += `G1 X${startX} Y${startY} ${newLine}`
            } break;

            default:
                next();
                break;
        }
    }

    return result;
}