import {Shuffle} from "./shuffle";

const shuffle = new Shuffle(10);

for (let i = 0; i < 20; i++) {
    console.log(shuffle.next());
    // console.log(shuffle.next());
    console.log(shuffle.prev());
}

console.log([...shuffle.list]);
