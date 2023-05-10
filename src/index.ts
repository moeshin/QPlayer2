import {IProvider} from "./provider";
import {DefaultProvider} from "./provider/default";

export class QPlayer {
    defaultProvider = 'default';
    provider: Record<string, IProvider> = {
        default: new DefaultProvider(),
    };
}
