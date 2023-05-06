import $ from "jquery";
import {IProvider, ProviderCallbackCache, ProviderListItem} from "../provider.mjs";
import {DefaultProviderListItem} from "./default.mjs";

function renameValue(obj: any, map: Record<string, string>) {
    for (let key in map) {
        obj[map[key]] = obj[key];
        delete obj[key];
    }
}

export type MetoServer = 'netease' | 'tencent' | 'xiami' | 'kugou' | 'baidu' | 'kuwo';

export interface MetoProviderListItem extends ProviderListItem {
    id: any;
    server?: MetoServer;
}

export interface MetoSongData {
    url?: string;
    pic?: string;
    lrc?: string;
}

export class MetoProvider implements IProvider {
    api: string = 'https://api.i-meto.com/meting/api';
    server: MetoServer = 'netease';
    audio: true;
    cover: true;
    lyrics: true;
    load(current: MetoProviderListItem, cache: ProviderCallbackCache) {
        $.ajax({
            url: this.api,
            data: {
                server: current.server || this.server,
                type: 'song',
                id: current.id,
            },
            success: (data: MetoSongData[]) => {
                if (!Array.isArray(data) || data.length === 0) {
                    cache.error('audio');
                    return;
                }
                const song = data[0];
                if (song.pic) {
                    cache.success('cover', song.pic);
                }
                if (song.lrc) {
                    $.ajax({
                        url: song.lrc,
                        success: data => {
                            cache.success('lyrics', data);
                        },
                    });
                }
                if (song.url) {
                    cache.success('audio', song.url);
                }
            },
        });
    }
    playlist(id: any, server: MetoServer = this.server): Promise<DefaultProviderListItem[]> {
        return new Promise<any>((resolve, reject) => {
            $.ajax({
                url: this.api,
                data: {
                    id,
                    server,
                    type: 'playlist',
                },
                success: data => resolve(data),
                error: (xhr, status, error) => {
                    reject(new Error(status + ': ' + error));
                }
            });
        }).then(data => {
            if (!Array.isArray(data)) {
                return [];
            }
            for (let song of data) {
                renameValue(song, {
                    name: 'title',
                    artist: 'author',
                    audio: 'url',
                    cover: 'pic'
                });
            }
            return data;
        });
    }
}