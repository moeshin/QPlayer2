window.QPlayer = {isRotate: true};
$(function () {

    if (!window.QPlayer) {
        window.QPlayer = {};
    }
    const q = window.QPlayer;
    const v = {};

    const
        $q = $('#QPlayer'),
        $audio = $('#QPlayer-audio'),
        $cover = $('#QPlayer-cover'),
        $list = $('#QPlayer-list'),
        $name = $('#QPlayer-name'),
        $artist = $('#QPlayer-artist'),
        $more = $('#QPlayer-more'),
        $time = $('#QPlayer-time'),
        $progress = $('#QPlayer-progress'),
        $progressCurrent = $('#QPlayer-progress-current')
    ;

    const
        audio = $audio[0]
    ;

    // Test
    window._audio = audio;

    q.index = -1;
    q.current = null;

    function Random(index) {
        const _this = this;
        if (index === undefined) {
            this.index = -1;
            this.list = [];
        } else {
            this.index = 0;
            this.list = [index];
        }
        this.next = function () {
            if (this.index + 1 === this.list.length) {
                if (this.list.length === v.list.length) {
                    this.index = 0;
                    return _this.list[0];
                }
                return push();
            }
            return this.list[++this.index];
        };
        this.previous = function () {
            if (this.index === 0) {
                const length = v.list.length;
                if (this.list.length === length) {
                    this.index = length - 1;
                    return this.list[this.index];
                }
                const index = getIndex();
                this.list.splice(0, 0, index);
                return index;
            }
            if (this.index === -1) {
                return push();
            }
            return this.list[--this.index];
        };
        this.remove = function (index) {
            const list = this.list;
            const _index = list.indexOf(index);
            if (_index === -1) {
                return false;
            }
            list.splice(_index, 1);
            --this.index;
        };
        function push() {
            const index = getIndex();
            _this.list.push(index);
            ++_this.index;
            return index;
        }
        function getIndex() {
            const length = v.list.length;
            if (_this.index === -1) {
                return random(length);
            }
            const list = [];
            for (let i = 0; i < length; ++i) {
                if (_this.list.includes(i)) {
                    continue;
                }
                list.push(i);
            }
            return list[random(list.length)];
        }
        function random(max) {
            return Math.floor(Math.random() * max);
        }
    }

    function getNextIndex() {
        if (v.list.length === 0) {
            return false;
        }
        if (q.isRandom) {
            return q.random.next();
        }
        if (++q.index === q.list.length) {
            q.index = 0;
        }
        return q.index;
    }

    function getPreviousIndex() {
        if (v.list.length === 0) {
            return false;
        }
        if (q.isRandom) {
            return q.random.previous();
        }
        if (--q.index < 0) {
            q.index = q.list.length - 1;
        }
        return q.index;
    }

    function playAudio() {
        onPlay();
        audio.src = q.current.url;
        audio.play();
    }

    function onPlay() {
        $q.addClass('QPlayer-playing');
    }

    function onPlayPrepare() {
        $progressCurrent.width('0');
        onPlay();
    }

    function onPause() {
        $q.removeClass('QPlayer-playing');
    }

    function s2m(s) {
        let m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        if (m < 10) {
            m = `0${m}`;
        }
        if (s < 10) {
            s = `0${s}`;
        }
        return `${m}:${s}`;
    }

    function isPlaying() {
        return $q.hasClass('QPlayer-playing');
    }

    function get$Li(index) {
        return $list.children(`:not(.QPlayer-list-error):eq(${index})`);
    }

    /**
     * 加载
     *
     * @param index
     * @return {boolean}
     */
    q.load = function(index) {
        const length = v.list.length;
        if (length === 0) {
            console.warn('list 为空！');
            return false;
        }
        if (typeof index === 'number') {
            if (!(length > index || index > 0)) {
                console.warn(`超出 list，length=${length}，index=${index}`);
                return false;
            }
        } else {
            index = getNextIndex();
        }
        const current = v.list[index];
        $name.text(current.name);
        $artist.text(current.artist);
        $cover.attr('src', current.cover);
        $list.children('.QPlayer-list-current').removeClass('QPlayer-list-current');
        get$Li(index).addClass('QPlayer-list-current');
        // todo 加载歌词

        q.index = index;
        q.current = current;
        audio.load();
        return true;
    };

    /**
     * 播放
     *
     * @param index
     * @param isPrevious
     * @return {number}
     * 0 错误
     * 1 List 为空
     * 2 成功
     * 3 请求 API
     */
    function play(index, isPrevious) {
        // FIXME 递归栈溢出
        function error(index) {
            get$Li(index).addClass('QPlayer-list-error');
            v.list.splice(index, 1);
            q.random.remove(index);
        }
        function errorSync() {
            error(index);
        }
        function errorAsync() {
            const list = v.list;
            const _index = list[index] === current ? index : list.indexOf(current);
            if (_index === -1) {
                console.warn('未找到索引');
                return;
            }
            error(_index);
            if (isPrevious) {
                q.previous();
            } else {
                q.next();
            }
        }

        if (index === false) {
            console.warn('list 为空！');
            return 1;
        } else if (typeof index === 'number') {
            if (!q.load(index)) {
                errorSync();
                return 0;
            }
        } else {
            index = q.index;
            if (audio.readyState !== 0) {
                onPlay();
                audio.play();
                return 2;
            }
        }

        const current = q.current;
        if (current.url) {
            playAudio();
            return 2;
        }
        const id = current.id;
        if (!id) {
            errorSync();
            return 0;
        }
        const source = current.source || 'netease';
        if (source !== 'netease') {
            console.warn('暂不支持源：' + source);
            errorSync();
            return 0;
        }
        onPlayPrepare();
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
                    current.url = url;
                    playAudio();
                } else {
                    errorAsync();
                }
            },
            error: function () {
                errorAsync();
            }
        });
        return 3;
    }

    q.play = function(index, isPrevious) {
        const bool = play(index, isPrevious);
        if (bool) {
            return bool;
        }
        return isPrevious ? q.previous() : q.next();
    };

    q.pause = function() {
        onPause();
        audio.pause();
    };

    q.next = function() {
        return q.play(getNextIndex());
    };

    q.previous = function previous() {
        return q.play(getPreviousIndex(), true);
    };

    $('#QPlayer-switch').click(function () {
        $q.toggleClass('QPlayer-show');
    });
    $('#QPlayer-btn-list').click(function () {
        $more.toggleClass('QPlayer-list-show');
    });
    $('#QPlayer-btn-lyrics').click(function () {
        $more.toggleClass('QPlayer-lyrics-show');
    });
    $('#QPlayer-btn-play').click(function () {
        if (isPlaying()) {
            q.pause();
        } else {
            q.play();
        }
    });
    $('#QPlayer-btn-next').click(q.next);
    $('#QPlayer-btn-previous').click(q.previous);
    $list.on('click', 'li:not(.QPlayer-list-current, .QPlayer-list-error)', function () {
        const index = $list.children(':not(.QPlayer-list-error)').index(this);
        if (q.isRandom) {
            q.random = new Random(index);
        }
        q.play(index);
    });
    $audio
        .on('playing', onPlay)
        .on('pause', onPause)
        .on('ended', q.next)
        .on('timeupdate', function () {
            const time = audio.currentTime;
            $time.text(s2m(time));
            if (!isProgressClicked) {
                $progressCurrent.width(100 * time / audio.duration + '%');
            }
        })
    ;

    // 进度条操作
    let isProgressClicked;
    function getXFromEvent(e) {
        const type = e.type;
        switch (type) {
            case 'mousedown':
            case 'mouseup':
            case 'mousemove':
                return e.pageX;
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
                return e.originalEvent.changedTouches[0].pageX;
        }
        return false;
    }
    function getProgressFromEvent(e) {
        return getXFromEvent(e) - $progress.offset().left;
    }
    function moveProgress(e) {
        if (!isProgressClicked) {
            return;
        }
        e.preventDefault();
        const total = $progress.width();
        const current = getProgressFromEvent(e);
        $progressCurrent.width(current < total ? current : total);
    }
    $progress.on('mousedown touchstart', function (e) {
        isProgressClicked = true;
        moveProgress(e);
    });
    $(document)
        .on('mouseup touchend', function (e) {
            if (!isProgressClicked) {
                return;
            }
            isProgressClicked = false;
            const duration = audio.duration;
            if (isNaN(duration)) {
                $progressCurrent.width(0);
                return;
            }
            const total = $progress.width();
            const current = getProgressFromEvent(e);
            if (current >= total) {
                q.next();
                return;
            }
            audio.currentTime = current > 0 ? duration * current / total: 0;
            // todo 寻找歌词
        })
        .on('mousemove touchmove', moveProgress);

    function defineProperties(obj, properties) {
        const keys = Object.keys(properties);
        const length = keys.length;
        for (let i = 0; i < length; ++i) {
            const key = keys[i];
            v[key] = obj[key];
        }
        Object.defineProperties(obj, properties);
        for (let i = 0; i < length; ++i) {
            const key = keys[i];
            obj[key] = v[key] || properties[key].default;
        }
    }

    defineProperties(q,{
        isRandom: {
            get: function () {
                return v.isRandom;
            },
            set: function (bool) {
                v.isRandom = bool;
                if (bool) {
                    q.random = new Random();
                }
            },
            default: false
        },
        isRotate: {
            get: function () {
                return v.isRotate;
            },
            set: function (value) {
                v.isRotate = value;
                if (!$cover.length) {
                    console.warn('找不到 QPlayer！');
                    return;
                }
                if (value) {
                    $cover.addClass('QPlayer-cover-rotate');
                } else {
                    $cover.removeClass('QPlayer-cover-rotate');
                }
            },
            default: true
        },
        list: {
            get: function () {
                return v.list;
            },
            set: function (value) {
                if (!Array.isArray(value)) {
                    console.warn('list 应该是数组');
                    return;
                }
                v.list = value;
                if (value.length === 0) {
                    return;
                }
                $list.empty();
                const length = value.length;
                for (let i = 0; i < length; i++) {
                    const item = value[i];
                    let artist = item.artist;
                    if (Array.isArray(artist)) {
                        item.artist = artist = artist.join('/');
                    }
                    const $li = $(`<li><strong>${item.name}</strong><span>${artist}</span></li>`);
                    $list.append($li);
                    $li.prop('QPlayer', item);
                }
                if (q.index > -1 && q.current) {
                    const length = value.length;
                    if (length > q.index && value[q.index] === q.current) {
                        return;
                    }
                    if (length === 0) {
                        return;
                    }
                }
                q.index= -1;
                q.current = null;
                q.load();
            },
            default: []
        }
    });
});

