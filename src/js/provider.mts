import {Lyrics} from "./lyrics.mjs";

type UrlCallback = (url: string, isCache?: boolean) => void;
export type TextCallback = (text: string) => void;
type ProviderCallback<T extends Function> = (current: ListItem, success: T, error: () => void) => void;

export type ProvideType = 'audio' | 'cover' | 'lyrics';

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
    audio?: true | ProviderCallback<UrlCallback>;
    cover?: true | ProviderCallback<UrlCallback>;
    lyrics?: true | ProviderCallback<TextCallback>;
    load?(current: ListItem, cache: ProviderCallbackCache): void;
}

type SuccessCallback = (data: any, isCache?: boolean) => void;
type ErrorCallback = () => void;

interface ICallback {
    success: (data: any, cache: any) => void;
    error: ErrorCallback;
}

class Provider {
    readonly provider: IProvider;
    readonly current: ListItem;
    readonly cache = new ProviderCallbackCache();

    private isStop: boolean;

    constructor(provider: IProvider, current: ListItem) {
        this.provider = provider;
        this.current = current;
    }

    call(name: ProvideType, success: SuccessCallback, error?: () => void) {
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
            this.cache.set(name, success, error);
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


export class ProviderCallbackCache {
    callbacks: Record<string, ICallback> = {};
    caches: Record<string, {
        data: any,
        cache: any,
    } | false> = {};

    success(type: ProvideType, data: any, cache?: any) {
        const callback = this.callbacks[type];
        if (callback) {
            callback.success(data, cache);
            return;
        }
        this.caches[type] = {
            data,
            cache,
        };
    }

    error(type: ProvideType) {
        const callback = this.callbacks[type];
        if (callback) {
            callback.error;
            return;
        }
        this.caches[type] = false;
    }

    set(type: ProvideType, success: SuccessCallback, error: ErrorCallback) {
        // if (isStop) return;
        const cache = this.caches[type];
        if (cache) {
            success(cache.data, cache.cache);
            return;
        }
        if (cache === false) {
            error();
            return;
        }
        this.callbacks[type] = {
            success,
            error,
        };
    }
}
