// import {Shuffle} from "./shuffle";
//
// const shuffle = new Shuffle(10);
//
// for (let i = 0; i < 11; i++) {
//     if (i == 10) {
//         debugger
//     }
//     const index = shuffle.random();
//     console.log(i, index);
//     shuffle.append(index);
// }
//
// console.log(shuffle);

import {LinkedList} from "./list";

const list = new LinkedList<number>();

for (let i = 0; i < 10; i++) {
    list.append(i);
}

for (let number of list) {
    console.log(number);
}
