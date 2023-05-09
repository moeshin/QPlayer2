import {LinkedList, LinkedNode} from "./list";

function random(max: number) {
    // [0, max)
    return Math.floor(Math.random() * max);
}

export class Shuffle {

    private _max = 0;
    set = new Set<number>();
    list = new LinkedList<number>();
    node: LinkedNode<number> = null;

    constructor(max: number, index?: number) {
        this.max = max;
        if (index !== undefined) {
            this.append(index);
        }
    }

    append(index: number) {
        this.set.add(index);
        this.node = this.list.append(index);
    }

    prepend(index: number) {
        this.set.add(index);
        this.node = this.list.prepend(index);
    }

    random() {
        if (this.length < 1) {
            return random(this._max);
        }

        const index = random(this._max - this.length);
        for (let i = 0, j = -1; i < this._max; ++i) {
            if (!this.set.has(i) && ++j >= index) {
                return i;
            }
        }
        return -1;
    }

    next() {
        if (this.node === this.list.tail) {
            if (this.length < this._max) {
                this.append(this.random());
            } else {
                this.node = this.list.head;
            }
        } else {
            this.node = this.node.next;
        }
        return this.node.value;
    }

    prev() {
        if (this.node === this.list.head) {
            if (this.length < this._max) {
                this.prepend(this.random());
            } else {
                this.node = this.list.tail;
            }
        } else {
            this.node = this.node.prev;
        }
        return this.node.value;
    }

    // noinspection JSUnusedGlobalSymbols
    get max(): number {
        return this._max;
    }

    set max(value: number) {
        if (value < 1) {
            throw new RangeError('max < 1');
        }
        this._max = value;
    }

    get length() {
        return this.list.length;
    }
}