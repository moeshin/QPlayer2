import $ from "jquery";
import {IProvider, ListItem, TextCallback} from "../provider.mjs";

export interface DefaultProviderListItem extends ListItem {
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
