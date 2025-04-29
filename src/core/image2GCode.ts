const newLine = "\r\n";

export type Image2GCodeOptions = {
    trimLines: boolean,
    sensitivity: number,
    feedRate: number
}

export async function image2GCode(blob: Blob, ops?: Image2GCodeOptions): Promise<string> {
    const image = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    ops = { trimLines: true, sensitivity: 230, feedRate: 100, ...ops };
    
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, image.width, image.height);
    const scale = 0.1;

    let result = `G0 X0 Y0${newLine}G1 F${ops.feedRate}${newLine}`;

    for (let y = 0; y <= data.height; y ++) {
        let currCmd = 'G0';
        let currX = 0;
        result += `G0 Y${(y * scale).toFixed(2)}`;

        for (let x = 0; x < data.width; x ++) {

            const index = (x + (data.height - y) * data.width) * 4;
            const r = data.data[index];
            const g = data.data[index + 1];
            const b = data.data[index + 2];
            const a = data.data[index + 3];
            const l = (r + b + g) / 3;
            const cmd = l > ops.sensitivity ? "G0" : "G1";

            if (currCmd != cmd) {
                result += `${currCmd} X${currX.toFixed(2)} ${newLine}`;
            }

            currCmd = cmd;
            currX = x * scale;
        }

        if (!ops.trimLines || currCmd != "G0")
            result += `${currCmd} X${currX.toFixed(2)} ${newLine}`;
    }

    return result;
}