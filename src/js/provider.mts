import {Lyrics} from "./lyrics.mjs";

export interface ErrorCallback {
    (): void
}
export interface SuccessCallback {
    (data: any): void
}
export interface TextCallback extends SuccessCallback {
    (text: string): void
}
export interface LyricsCallback extends SuccessCallback {
    (lyrics: string | Lyrics): void
}
interface ProviderCallback<T extends SuccessCallback> {
    (current: ListItem, success: T, error: () => void): void
}

export type ProvideType = 'audio' | 'cover' | 'lyrics' | string;

export interface ListItem extends Record<string, any> {
    name: string;
    artist?: string | string[];
    audio?: string;
    cover?: string;
    lyrics?: string | Lyrics;
    provider?: string;
}

export interface IProvider extends Record<string, any> {
    name?: string;
    audio?: true | ProviderCallback<TextCallback>;
    cover?: true | ProviderCallback<TextCallback>;
    lyrics?: true | ProviderCallback<LyricsCallback>;
    load?(current: ListItem, cache: LoadCallback): void;
}

interface ICallback {
    success: SuccessCallback;
    error: ErrorCallback;
}

export class Provider {
    readonly provider: IProvider;
    readonly current: ListItem;
    readonly cache = new LoadCallback();

    private isStop: boolean;

    constructor(current: ListItem, provider: IProvider) {
        this.current = current;
        this.provider = provider;
    }

    callback(name: ProvideType, success: SuccessCallback, error?: () => void) {
        const data = this.current[name];
        if (data) {
            success(data);
            return;
        }
        if (!error) {
            error = () => {};
        }
        const callback = this.provider[name];
        if (callback === true) {
            if (!this.isStop) {
                this.cache.set(name, success, error);
            }
            return;
        }
        if (callback) {
            callback(this.current, success, error);
            return;
        }
        error();
    }

    stop() {
        this.isStop = true;
    }

    load() {
        this.isStop = false;
        const {load} = this.provider;
        if (load) {
            load(this.current, this.cache);
        }
    }
}


export class LoadCallback {
    callbacks: Record<ProvideType, ICallback> = {};
    caches: Record<ProvideType, {
        data?: any,
        err?: boolean,
    }> = {};

    success(type: ProvideType, data: any) {
        const callback = this.callbacks[type];
        if (callback) {
            callback.success(data);
            return;
        }
        this.caches[type] = {
            data,
        };
    }

    error(type: ProvideType) {
        const callback = this.callbacks[type];
        if (callback) {
            callback.error;
            return;
        }
        this.caches[type] = {
            err: true,
        };
    }

    set(type: ProvideType, success: SuccessCallback, error: ErrorCallback) {
        const cache = this.caches[type] || {};
        if (cache) {
            const {data, err} = cache;
            if (err) {
                error();
                return;
            }
            if (data) {
                this.success(type, data);
                return;
            }
        }
        this.callbacks[type] = {
            success,
            error,
        };
    }
}
