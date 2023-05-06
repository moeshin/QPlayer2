import $ from "jquery";
import {IProvider, ProviderListItem, TextCallback} from "../provider";

export interface DefaultProviderListItem extends ProviderListItem {
    lrc?: string,
}

export class DefaultProvider implements IProvider {
    dataType = '*';
    lyrics(current: DefaultProviderListItem, success: TextCallback) {
        const url = current.lrc;
        if (!url) {
            return;
        }
        $.ajax({
            url,
            dataType: this.dataType,
            success: text => {
                if (!text) {
                    return;
                }
                success(text);
            }
        });
    }
}
