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
        // const index = random(this.max);
        // if (!this.set.has(index)) {
        //     return index;
        // }
        // let i = 1;
        // let b = !random(2);
        // let b1 = false;
        // let b2 = false;
        // while (true) {
        //     for (let j = 0; j < 2; ++j) {
        //         if (b1 && b2) {
        //             return -1;
        //         }
        //         b = !b;
        //         if (b) {
        //             if (b1) {
        //                 continue;
        //             }
        //         } else {
        //             if (b2) {
        //                 continue;
        //             }
        //         }
        //         const k = index + i * (b ? 1 : -1);
        //         if (b) {
        //             if (k >= this.max) {
        //                 b1 = true;
        //                 continue;
        //             }
        //         } else {
        //             if (k < 0) {
        //                 b2 = true;
        //                 continue;
        //             }
        //         }
        //         if (!this.set.has(k)) {
        //             return k;
        //         }
        //     }
        //     ++i;
        // }

        if (!this.set.size) {
            return random(this.max);
        }

        const index = random(this.max - this.set.size);
        for (let i = 0, j = -1; i < this.max; ++i) {
            if (!this.set.has(i) && ++j >= index) {
                return i;
            }
        }
        return -1;
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