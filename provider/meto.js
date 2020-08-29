(function () {
    var meto = {
        api: 'https://api.i-meto.com/meting/api',
        server: 'netease',
        audio: true,
        cover: true,
        lyrics: true,
        load: function (current, callbacks) {
            var id = current.id;
            if (!id) {
                return;
            }
            $.ajax({
                url: meto.api,
                data: {
                    server: current.server || meto.server,
                    type: 'song',
                    id: id
                },
                success: function (data) {
                    if (!Array.isArray(data) || data.length === 0) {
                        callbacks.error('audio');
                        return;
                    }
                    var json = data[0];
                    if (json.pic) {
                        callbacks.success('cover', json.pic);
                    }
                    if (json.lrc) {
                        $.ajax({
                            url: json.lrc,
                            success: function (lrc) {
                                callbacks.success('lyrics', lrc);
                            }
                        });
                    }
                    if (json.url) {
                        callbacks.success('audio', json.url);
                    }
                }
            });
        },
        playlist: function (callback, id, server) {
            if (!server) {
                server = meto.server;
            }
            var api = meto.api;
            $.ajax({
                url: api,
                data: {
                    server: server,
                    type: 'playlist',
                    id: id
                },
                success: function (data) {
                    if (!Array.isArray(data) || data.length === 0) {
                        return;
                    }
                    var length = data.length;
                    for (var i = 0; i < length; ++i) {
                        var item = data[i];
                        item.name = item.title;
                        item.artist = item.author;
                        item.audio = item.url;
                        item.cover = item.pic;
                        item.provider = 'default';
                        delete item.author;
                        delete item.title;
                        delete item.url;
                        delete item.pic;
                    }
                    callback(data);
                },
                error: function () {
                    callback([]);
                }
            });
        }
    };
    window.QPlayer = $.extend(true, window.QPlayer, {
        provider: {
            meto: meto
        }
    });
})();