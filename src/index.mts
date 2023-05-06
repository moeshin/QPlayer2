import {IProvider} from "./provider/index.mjs";
import {DefaultProvider} from "./provider/default.mjs";

export class QPlayer {
    defaultProvider = 'default';
    provider: Record<string, IProvider> = {
        default: new DefaultProvider(),
    };
}
