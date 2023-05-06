type UrlCallback = (url: string, cache: any) => void;
export type TextCallback = (text: string) => void;
type ProviderCallback<T extends Function> = (current: any, success: T, error: () => void) => void;

export type ProvideType = 'audio' | 'cover' | 'lyrics';

export interface ProviderListItem {
    provider?: string,
}

export interface IProvider extends Record<string, any> {
    audio?: true | ProviderCallback<UrlCallback>;
    cover?: true | ProviderCallback<UrlCallback>;
    lyrics?: true | ProviderCallback<TextCallback>;
}

type SuccessCallback = (data: any, cache: any) => void;
type ErrorCallback = () => void;

interface ICallback {
    success: (data: any, cache: any) => void;
    error: ErrorCallback;
}

class Provider {
    readonly iProvider: IProvider;
    readonly current: Record<string, any>;
    readonly cache = new ProviderCallbackCache();

    private isStop: boolean;

    constructor(iProvider: IProvider, current: Record<string, any>) {
        this.iProvider = iProvider;
        this.current = current;
    }

    call<T extends Function>(name: ProvideType, success: T, error?: () => void) {
        if (!error) {
            error = () => {};
        }
        const data = this.current[name];
        if (data) {
            success(data);
            return;
        }
        const callback = this.iProvider[name];
        if (callback === true) {
            // this.cache.set(name, success, error);
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

export {};
