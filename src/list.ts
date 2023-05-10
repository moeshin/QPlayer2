export class LinkedNode<T> {
    value: T;
    prev: LinkedNode<T> | null;
    next: LinkedNode<T> | null;
    constructor(value: T, prev: LinkedNode<T> = null, next: LinkedNode<T> = null) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}

export interface ILinkedIterator<T, TReturn = any, TNext = undefined> extends Iterator<T, TReturn, TNext> {
    prev(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    remove(): void;
    get isFirst(): boolean;
    get isLast(): boolean;
}

export class LinkedNodeIterator<T, TReturn = any, TNext = undefined>
    implements Iterable<LinkedNode<T>>, ILinkedIterator<LinkedNode<T>, TReturn, TNext> {

    readonly list: LinkedList<T>;
    node: LinkedNode<T>;
    index = -1;

    constructor(list: LinkedList<T>, node: LinkedNode<T> = list.head) {
        this.list = list;
        this.node = node;
    }

    return(value?: TReturn): IteratorResult<LinkedNode<T>> {
        return this.node ? {
            done: false,
            value: this.node,
        } : {
            done: true,
            value,
        };
    }

    next(...args: [] | [TNext]): IteratorResult<LinkedNode<T>> {
        if (this.node && this.index > -1) {
            this.node = this.node.next;
        }
        const r = this.return();
        if (!r.done) {
            ++this.index;
        }
        return r;
    }

    prev(...args: [] | [TNext]): IteratorResult<LinkedNode<T>> {
        this.node = this.node?.prev;
        const r = this.return();
        if (!r.done) {
            --this.index;
        }
        return r;
    }

    remove() {
        LinkedList.remove(this.node, this.list);
    }

    get isFirst() {
        return this.node === this.list.head;
    }

    get isLast() {
        return this.node === this.list.tail;
    }

    [Symbol.iterator](): Iterator<LinkedNode<T>> {
        return this;
    }
}

export class LinkedIterator<T, TReturn = any, TNext = undefined>
    implements ILinkedIterator<T, TReturn, TNext> {

    readonly iter: LinkedNodeIterator<T, TReturn, TNext>;

    constructor(iter: LinkedNodeIterator<T, TReturn, TNext>) {
        this.iter = iter;
    }

    return(value?: TReturn): IteratorResult<T, TReturn> {
        return LinkedIterator.convertResult(this.iter.return(value));
    }

    next(...args: [] | [TNext]): IteratorResult<T, TReturn> {
        return LinkedIterator.convertResult(this.iter.next(...args));
    }

    prev(...args: [] | [TNext]): IteratorResult<T, TReturn> {
        return LinkedIterator.convertResult(this.iter.prev(...args));
    }

    remove(): void {
        this.iter.remove();
    }

    get isFirst(): boolean {
        return this.iter.isFirst;
    }

    get isLast(): boolean {
        return this.iter.isLast;
    }

    static convertResult<T, TReturn = any>(result: IteratorResult<LinkedNode<T>, TReturn>): IteratorResult<T, TReturn> {
        if (result.done) {
            return result;
        }
        return {
            done: false,
            value: (result as IteratorYieldResult<LinkedNode<T>>).value.value,
        };
    }
}

export class LinkedList<T> implements Iterable<T> {
    head: LinkedNode<T> = null;
    tail: LinkedNode<T> = null;
    length = 0;

    [Symbol.iterator](): LinkedIterator<T> {
        return new LinkedIterator(this.iter());
    }

    iter(): LinkedNodeIterator<T> {
        return new LinkedNodeIterator<T>(this);
    }

    prepend(value: T) {
        return this.insert(null, value);
    }

    append(value: T) {
        return this.insert(null, value, false);
    }

    insert(target: LinkedNode<T> | null, value: T, isPrev = true) {
        const node = new LinkedNode(value);
        if (!target) {
            target = isPrev ? this.head : this.tail;
        }
        if (target) {
            if (isPrev) {
                node.next = target;
                if ((node.prev = target.prev)) {
                    node.prev.next = node;
                }
                target.prev = node;
                if (this.head === target) {
                    this.head = node;
                }
            } else {
                node.prev = target;
                if ((node.next = target.next)) {
                    node.next.prev = node;
                }
                target.next = node;
                if (this.tail === target) {
                    this.tail = node;
                }
            }
        } else {
            this.head = node;
            this.tail = node;
        }

        ++this.length;
        return node;
    }

    get(index: number) {
        if (index < 0 || index >= this.length) {
            return undefined;
        }
        if (index >= this.length / 2 - 1) {
            index *= -1;
        }
        let value: LinkedNode<T>;
        if (index > -1) {
            value = this.head;
            for (let i = 0; i < index; ++i) {
                value = value.next;
            }
        } else {
            value = this.tail;
            index = -1 * index - 1;
            for (let i = 0; i < index; ++i) {
                value = value.prev;
            }
        }
        return value;
    }

    // at(index: number) {
    //     if (index < 0) {
    //         index += this.length;
    //     }
    //     return this.get(index);
    // }

    static remove<T>(node: LinkedNode<T>, list?: LinkedList<T>) {
        const {prev, next} = node;
        if (prev != null) {
            prev.next = next;
        } else if (list?.head === node) {
            list.head = next;
        }
        if (next != null) {
            next.prev = prev;
        } else if (list?.tail === node) {
            list.tail = prev;
        }
    }
}
