import {LinkedList, LinkedNode} from "./list";

export class Lyrics {
    readonly times: number[];
    readonly texts: string[];
    offset = 0;

    constructor(lrc: string) {
        const linePattern = /^/mg;
        const timePattern = /\t*\[([0-6]?\d):([0-6]?\d)(?:\.(\d{1,3}))?]/g;
        const textPattern = /.*/mg;
        const offsetPattern = /^\[offset:\t*([+-]?\d+)]/mg;
        const timeList = new LinkedList<number>();
        const textList = new LinkedList<string>();
        const add = (time: number, text: string) => {
            const timeIter = timeList.iter();
            while (true) {
                const result = timeIter.next();
                if (result.done) {
                    break;
                }
                const {node, index} = timeIter;
                const t = node.value;
                if (t < time) {
                    continue;
                }
                if (t === time) {
                    textList.get(index).value += '<br>' + text;
                    return;
                }
                if (!timeIter.isLast) {
                    timeList.insert(node, time);
                    textList.insert(textList.get(index), text);
                    return;
                }
            }
            timeList.append(time);
            textList.append(text);
        };
        while (linePattern.exec(lrc)) {
            let result: RegExpExecArray;
            const lineIndex = linePattern.lastIndex;

            offsetPattern.lastIndex = lineIndex;
            if ((result = offsetPattern.exec(lrc))) {
                linePattern.lastIndex = offsetPattern.lastIndex;
                this.offset = parseFloat(result[1]);
                continue;
            }

            let timeIndex = timePattern.lastIndex = lineIndex;
            const isTime = () => (result = timePattern.exec(lrc)) != null && result.index === timeIndex;
            if (!isTime()) {
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
                add(time, text);
            }
        }
        this.times = Array.from(timeList);
        this.texts = Array.from(textList);
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