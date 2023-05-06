import $ from "jquery";
import {QPlayer} from "./index.mjs";

$(() => {
    const q = window.QPlayer;
    if (q instanceof QPlayer) {
        return;
    }
    const qPlayer: QPlayerGlobal = new QPlayer();
    qPlayer.$ = $;
    if (typeof q === 'object') {
        $.extend(true, qPlayer, q);
    }
    window.QPlayer = qPlayer;
});
