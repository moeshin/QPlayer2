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

export class LinkedIterator<T> implements Iterator<T> {

    readonly list: LinkedList<T>;
    node: LinkedNode<T>;
    isFirstInit = true;
    
    constructor(list: LinkedList<T>, node: LinkedNode<T> = list.head) {
        this.list = list;
        this.node = node;
    }

    return(value?: any): IteratorResult<T> {
        return this.node ? {
            done: false,
            value: this.node.value,
        } : {
            done: true,
            value,
        };
    }

    next(...args: [] | [undefined]): IteratorResult<T> {
        if (this.isFirstInit) {
            this.isFirstInit = false;
        } else {
            this.node = this.node?.next;
        }
        return this.return();
    }

    prev(): IteratorResult<T> {
        if (this.isFirstInit) {
            this.isFirstInit = false;
        }
        this.node = this.node?.prev;
        return this.return();
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
}

export class LinkedList<T> implements Iterable<T> {
    head: LinkedNode<T> = null;
    tail: LinkedNode<T> = null;
    length = 0;

    [Symbol.iterator](): LinkedIterator<T> {
        return new LinkedIterator<T>(this);
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
