(function () {
    const q = window.QPlayer || (window.QPlayer = {});
    const provider = q.provider || (q.provider = {});
    provider.netease = {
        audio: function (current, success, error) {
            const id = current.id;
            if (!id) {
                error();
                return;
            }
            $.ajax({
                dataType: 'jsonp',
                url: 'https://api.littlehands.site/NeteaseMusic/',
                data: {
                    type: 'song',
                    id: id
                },
                success: function (json) {
                    const url = json.url;
                    if (url) {
                        success(url);
                    } else {
                        error();
                    }
                },
                error: error
            });
        },
        lyrics: function (current, success) {
            const id = current.id;
            if (!id) {
                return;
            }
            $.ajax({
                dataType: 'jsonp',
                url: 'https://api.littlehands.site/NeteaseMusic/',
                data: {
                    type: 'lyric',
                    id: id
                },
                success: function (json) {
                    // noinspection JSUnresolvedVariable
                    success(json.lyric + json.tlyric);
                }
            });
        }
    };
})();