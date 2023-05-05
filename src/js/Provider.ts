type UrlCallback = (url: string, cache: any) => void;
type TextCallback = (text: string) => void;
type ProviderCallback<T extends Function> = (current: object, success: T, error: () => void) => void;

type ProvideType = 'audio' | 'cover' | 'lyrics';

interface IProvider {
    audio?: ProviderCallback<UrlCallback>;
    cover?: ProviderCallback<UrlCallback>;
    lyrics?: ProviderCallback<TextCallback>;
}

type SuccessCallback = (data: any, cache: any) => void;
type ErrorCallback = () => void;

interface ICallback {
    success: (data: any, cache: any) => void;
    error: ErrorCallback;
}

// class Provider {
//     private readonly iProvider: IProvider;
//     private readonly current: Record<string, any>;
//
//     private isStop: boolean;
//
//     constructor(iProvider: IProvider, current: Record<string, any>) {
//         this.iProvider = iProvider;
//         this.current = current;
//     }
//
//     call<T extends Function>(name: string, success: T, error?: () => void) {
//         if (!error) {
//             error = () => {};
//         }
//         const data = this.current[name];
//         if (data) {
//             success(data);
//             return;
//         }
//         // const callback: Pr = this.iProvider[name];
//     }
// }


class ProviderCallbacks {
    callbacks: Record<ProvideType, ICallback>;
    caches: Record<string, {
        data: any,
        cache: any,
    } | false> = {};

    success(type: ProvideType, data: any, cache: any) {
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
