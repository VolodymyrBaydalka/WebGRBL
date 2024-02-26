const serial = (navigator as any).serial;

const newLine = "\n";

export type GrblEventType = "request" | "response" | "status";
export type GrblEvent = {
    type: GrblEventType;
    message: string;
    status?: string;
    position?: [number, number, number];
}

export class GrblClient {
    #timer: any;
    #serial: any;
    #decoder = new TextDecoder();
    #encoder = new TextEncoder();
    #reader: ReadableStreamDefaultReader;
    #writer: WritableStreamDefaultWriter;
    #queue: string[] = [];
    baudRate: number = 115200;
    statusInterval: number = 1000;

    onMessage: (m: GrblEvent) => void;

    get connected() {
        return !!this.#serial;
    }

    get queueSize() {
        return this.#queue.length;
    }

    async connect() {
        this.#serial = await serial.requestPort({ filters: [] });

        if (this.#serial) {
            await this.#serial.open({ baudRate: this.baudRate });

            this.#reader = this.#serial.readable.getReader();
            this.#writer = this.#serial.writable.getWriter();
            this.#listen();

            this.#timer = setInterval(() => this.#write("?"), this.statusInterval);

            return true;
        }

        return false;
    }

    stop() {
        this.#queue = [];
    }

    async reset() {
        await this.#write("\x18");
        this.stop();
    }

    async sendLine(line: string) {
        this.#write(`${line} \r`);
        this.onMessage?.({ type: "request", message: line });
    }

    async jog(dir: "X" | "Y", dist: number, feed: number) {
        await this.sendGcode(`$J=G91 ${dir}${dist}F${feed}`);
    }

    async home() {
        await this.sendGcode(`G0 X0Y0`);
    }

    async sendGcode(code: string) {
        const lines = code.split(newLine);

        for (let line of lines) {
            const cmd = line.split(";")[0].trim();

            if (cmd == "" && cmd.startsWith(";"))
                continue;

            this.#queue.push(cmd);
        }

        await this.sendNextLine();
    }

    async sendNextLine() {
        const line = this.#queue.shift();

        if (line)
            await this.sendLine(line);
    }

    async #listen () {
        let current = "";

        while (this.#reader) {
            const { value, done } = await this.#read();
            const lines = (current + value).split(newLine);

            for (let i = 0, l = lines.length - 1; i < l; i++)
                await this.#processMessage(lines[i]);

            current = lines[lines.length - 1];

            if (done)
                break;
        }
    }

    async #processMessage(line: string) {
        const event: GrblEvent = {
            type: "response",
            message: line
        };

        if (line.startsWith("<")) {
            event.type = "status";
            event.message = line.substring(1, line.length - 1);

            const parts = event.message.split(/[,|:]/);
            event.status = parts[0];
            event.position = [parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4])];
        } else {
            await this.sendNextLine();
        }

        this.onMessage?.(event);
    }

    async #write(line: string) {
        await this.#writer.write(this.#encoder.encode(line));
    }

    async #read() {
        const res = await this.#reader.read();
        return { value: res.value && this.#decoder.decode(res.value), done: res.done };
    }

    async disconnect() {
        clearInterval(this.#timer);

        if (this.#writer) {
            await this.#writer.close();
            this.#writer.releaseLock();
            this.#writer = null as any;
        }

        if (this.#reader) {
            await this.#reader.cancel("disconencting");
            this.#reader.releaseLock();
            this.#reader = null as any;
        }

        if (this.#serial) {
            await this.#serial?.close();
            this.#serial = null;
        }

        this.#queue = [];
    }
}