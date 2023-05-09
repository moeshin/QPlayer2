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

    node: LinkedNode<T>;
    
    constructor(node: LinkedNode<T>) {
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
        const result = this.return();
        if (!result.done) {
            this.node = this.node.next;
        }
        return result;
    }

    // prev(): IteratorResult<T> {
    //     if (this.node) {
    //         this.node = this.node.prev;
    //     }
    //     return this.return();
    // }
}

export class LinkedList<T> implements Iterable<T> {
    head: LinkedNode<T> = null;
    tail: LinkedNode<T> = null;
    length = 0;

    [Symbol.iterator](): LinkedIterator<T> {
        return new LinkedIterator<T>(this.head);
    }

    append(value: T) {
        const node = new LinkedNode(value, this.tail);
        if (this.length > 0) {
            this.tail.next = node;
            this.tail = node;
        } else {
            this.head = node;
            this.tail = node;
        }
        ++this.length;
    }

    prepend(value: T) {
        const node = new LinkedNode(value, null, this.head);
        if (this.length > 0) {
            this.head.prev = node;
            this.head = node;
        } else {
            this.head = node;
            this.tail = node;
        }
        ++this.length;
    }

    // at(index: number) {
    //     let value: LinkedNode<T>;
    //     if (index > -1) {
    //         value = this.head;
    //         for (let i = 0; i < index; ++i) {
    //             value = value.next;
    //         }
    //     } else {
    //         value = this.tail;
    //         index = -1 * index - 1;
    //         for (let i = 0; i < index; ++i) {
    //             value = value.prev;
    //         }
    //     }
    //     return value;
    // }

    // static remove<T>(node: LinkedNode<T>, list?: LinkedList<T>) {
    //     const {prev, next} = node;
    //     if (prev != null) {
    //         prev.next = next;
    //     } else if (list?.head === node) {
    //         list.head = next;
    //     }
    //     if (next != null) {
    //         next.prev = prev;
    //     } else if (list?.tail === node) {
    //         list.tail = prev;
    //     }
    // }
}
