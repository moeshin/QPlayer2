import {QPlayer} from "./index";

declare global {
    interface QPlayerGlobal extends QPlayer {
        $?: JQueryStatic;
    }

    // noinspection JSUnusedGlobalSymbols
    interface Window {
        QPlayer: QPlayerGlobal | Record<string, any> | any;
    }
}
