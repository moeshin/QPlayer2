/**
 * Fisher–Yates shuffle
 *
 * @param array
 * @param start
 * @param end
 */
export function shuffle<T>(array: T[], start = 0, end = array.length - 1): T[] {
    for (let i = end; i > start; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



function random(max: number) {
    // [0, max)
    return Math.floor(Math.random() * max);
}

class Value {
    value: number;
    prev: Value;
    next: Value;

    constructor(value: number, prev: Value = null, next: Value = null) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}

export class Shuffle {
    max: number;
    current: Value = null;
    set = new Set<number>();

    constructor(max: number, index?: number) {
        this.max = max;
        if (index !== undefined) {
            this.append(index);
        }
    }

    append(index: number) {
        this.current = new Value(index, this.current);
        this.set.add(index);
    }

    prepend(index: number) {
        this.current = new Value(index, null, this.current);
        this.set.add(index);
    }

    random() {
        if (this.max > 0) {
            if (!this.set.size) {
                return random(this.max);
            }

            const index = random(this.max - this.set.size);
            for (let i = 0, j = -1; i < this.max; ++i) {
                if (!this.set.has(i) && ++j >= index) {
                    return i;
                }
            }
        }
        return -1;
    }

    next() {
    }

    // private push() {
    //     [].
    // }
    // next() {
    //     if (this.index + 1 === this.list.length) {
    //         if (this.list.length >= this.list.length) {
    //             this.index = 0;
    //             return this.list[0];
    //         }
    //         return push();
    //     }
    //     return this.list[++this.index];
    // }
}