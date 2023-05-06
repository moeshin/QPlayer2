export class Lyrics {
    readonly times: number[] = [];
    readonly texts: string[] = [];
    offset = 0;

    constructor(lrc: string) {
        const linePattern = /^/mg;
        const timePattern = /\t*\[([0-6]?\d):([0-6]?\d)(?:\.(\d{1,3}))?]/g;
        const textPattern = /.*/mg;
        const offsetPattern = /^\[offset:\t*([+-]?\d+)]/mg;
        while (linePattern.exec(lrc) != null) {
            let result: RegExpExecArray;
            const lineIndex = linePattern.lastIndex;

            offsetPattern.lastIndex = lineIndex;
            if ((result = offsetPattern.exec(lrc)) != null) {
                linePattern.lastIndex = offsetPattern.lastIndex;
                this.offset = parseFloat(result[1]);
                continue;
            }

            let timeIndex = timePattern.lastIndex = lineIndex;
            const isTime = () => (result = timePattern.exec(lrc)) != null && result.index === timeIndex;
            if (isTime()) {
                ++linePattern.lastIndex;
                continue;
            }

            const times = [];
            do {
                linePattern.lastIndex = textPattern.lastIndex = timePattern.lastIndex;
                let time = parseFloat(result[1]) * 6e4 + parseInt(result[2], 10) * 1e3;
                const ms = result[3];
                if (ms) {
                    const {length} = ms;
                    let t = parseInt(ms, 10);
                    if (length < 3) {
                        t *= 10 ** (3 - length);
                    }
                    time += t;
                }
                times.push(time);
                timeIndex = timePattern.lastIndex;
            } while (isTime());

            if (times.length === 0) {
                continue;
            }

            const text = textPattern.exec(lrc)[0].trim();
            for (let time of times) {
                this.add(time, text);
            }
        }
    }

    add(time: number, text: string) {
        const {length} = this.times;
        const last = length - 1;
        for (let i = 0; i < length; ++i) {
            const t = this.times[i];
            if (t < time) {
                continue;
            }
            if (t === time) {
                this.texts[i] += '<br>' + text;
                return;
            }
            if (i < last) {
                this.times.splice(i, 0, time);
                this.texts.splice(i, 0, text);
                return;
            }
        }
        this.times.push(time);
        this.texts.push(text);
    }

    find(time: number) {
        const {length} = this.times;
        for (let i = 0; i < length; ++i) {
            const t = this.times[i] + this.offset;
            if (t < time) {
                continue;
            }
            if (t === time) {
                return i;
            }
            return i - 1;
        }
        return length - 1;
    }

    get empty() {
        return this.times.length < 1;
    }
}