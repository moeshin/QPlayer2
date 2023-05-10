// import {LinkedList} from "./list";
//
// const list = new LinkedList<number>();
// list.append(6);
// list.append(2);
// list.prepend(3);
// list.append(4);
// const node = list.get(2);
// console.log(node.value);
// list.insert(node, 233);
// list.insert(node, 666, false);
// list.insert(null, 123, false);
// console.log([...list]);
// console.log([...list.iter()]);

// import {Shuffle} from "./shuffle";
//
// const shuffle = new Shuffle(10);
//
// for (let i = 0; i < 20; i++) {
//     console.log(shuffle.next());
//     // console.log(shuffle.next());
//     console.log(shuffle.prev());
// }
//
// console.log([...shuffle.list]);


import {Lyrics} from "./lyrics";

const lyrics = new Lyrics(`[00:00.000] 作曲 : 蔡近翰Zoe
[00:00.030] 作词 : 尹纯青Eyn
[00:00.90]编曲：宫奇Gon/Luna Safari
[00:01.20]The way I go through with red roses burn my eyes.
[00:14.80]Cold rain starts pouring hard, I'm being called upon.
[00:25.00]Never let you go, it's why I did them all.
[00:32.98]For a chance at least, to live in your way.
[00:39.95]Love of you is my most cherished thing.
[00:46.00]So stay alive, bravely.
[00:52.90]
[01:19.10]I wish I could wake from the dream each time I dream.
[01:32.30]There's a long night coming soon，I'd shine as the last shine.
[01:43.00]Never let you go，it's why I did them all.
[01:50.40]For a chance at least, to live in your way.
[01:57.20]Love of you is my most cherished thing.
[02:04.00]So stay alive, bravely.
[02:10.60]
[02:22.20]Never let you go，it's why I did them all.
[02:29.20]For a chance at least, to live in your way.
[02:36.80]Love of you is my most cherished thing.
[02:43.00]So stay alive, bravely.
[02:49.30]
[02:50.30]混音：宫奇Gon
[02:51.30]制作人：蔡近翰Zoe Music by HOYO-MiX

[00:01.20]道途之上，赤玫瑰灼烧我的双目
[00:14.80]冷雨如注，我于此只为一声召唤
[00:25.00]绝不放弃你，是我做这一切的原因
[00:32.98]至少这一次，以自己的方式活吧
[00:39.95]予你的爱是我最珍惜的事物
[00:46.00]所以请勇敢，活下去
[00:52.90]
[01:19.10]我希望从夙夜梦寐中苏醒
[01:32.30]很快长夜将至，我愿化作最后的光芒
[01:43.00]绝不放弃你，是我做这一切的原因
[01:50.40]至少这一次，以自己的方式活吧
[01:57.20]予你的爱是我最珍惜的事物
[02:04.00]所以请勇敢，活下去
[02:10.60]
[02:22.20]绝不放弃你，是我做这一切的原因
[02:29.20]至少这一次，以自己的方式活吧
[02:36.80]予你的爱是我最珍惜的事物
[02:43.00]所以请勇敢，活下去
[02:49.30]`);

console.log(lyrics);
console.log(lyrics.times.length)
console.log(lyrics.texts.length)