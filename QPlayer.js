window.QPlayer = {isRotate: true};
$(function () {

    if (!window.QPlayer) {
        window.QPlayer = {};
    }
    const q = window.QPlayer || (window.QPlayer = {});
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
        $progressCurrent = $('#QPlayer-progress-current'),
        $lyrics = $('#QPlayer-lyrics')
    ;

    const
        audio = $audio[0]
    ;

    let $lyricsList, $listLi, isLoadPause, isPrevisionPlay;

    // Test
    window._audio = audio;

    q.index = -1;
    q.current = null;
    if (!q.provider) {
        q.provider = {};
    }

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
                if (this.list.length >= v.list.length) {
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
                this.list.unshift(index);
                return index;
            }
            if (this.index === -1) {
                return push();
            }
            return this.list[--this.index];
        };
        // this.remove = function (index) {
        //     const list = this.list;
        //     const _index = list.indexOf(index);
        //     if (_index === -1) {
        //         return false;
        //     }
        //     list.splice(_index, 1);
        //     --this.index;
        // };
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

    function onPlay() {
        $q.addClass('QPlayer-playing');
    }

    function onPause() {
        if (isLoadPause) {
            isLoadPause = false;
            return;
        }
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

    function getListLi(index) {
        return $listLi.eq(index);
    }

    function Provider(provider, current) {
        const callbacks = new ProviderCallback();
        let isStop;
        this.call = function (name, success, error) {
            if (!error) {
                error = function () {}
            }
            const data = current[name];
            if (data) {
                success(data);
                return;
            }
            const callback = provider[name];
            if (callback === true) {
                callbacks.set(name, success, error);
                return;
            }
            if (callback) {
                callback(current, success, error);
                return;
            }
            error();
        };
        this.stop = function () {
            isStop = true;
        };
        this.load = function () {
            isStop = false;
            const load = provider.load;
            if (!load) {
                return;
            }
            load(current, callbacks);
        };

        function ProviderCallback() {
            const callbacks = {};
            const caches = {};
            this.success = function (name, data, cache) {
                const callback = callbacks[name];
                if (!callback) {
                    caches[name] = {
                        data: data,
                        cache: cache
                    };
                    return;
                }
                callback.success(data, cache);
            };
            this.error = function (name) {
                const callback = callbacks[name];
                if (!callback) {
                    caches[name] = false;
                    return;
                }
                callback.error();
            };
            this.set = function (name, success, error) {
                if (isStop) {
                    return;
                }
                const cache = caches[name];
                if (cache) {
                    success(cache.data, cache.cache);
                    return;
                }
                if (cache === false) {
                    error();
                    return;
                }
                callbacks[name] = {success: success, error: error};
            };
        }
    }

    function getProvider(current) {
        const providerName = current.provider || 'netease';
        if (typeof providerName === 'string') {
            let provider = q.provider[providerName];
            if (!provider) {
                console.warn(`没有找到相应的 Provider：${providerName}`);
                provider = {};
            }
            provider = current.provider = new Provider(provider, current);
            provider.name = providerName;
            return provider;
        }
        return providerName instanceof Provider ? providerName : new Provider({}, current);
    }

    function Lyrics(lrc) {
        this.time = [];
        this.text = [];
        this.index = -1;
        this.nextTime = 0;
        this.offset = 0;
        this.has = false;
        this.add = function (time, text) {
            const length = this.time.length;
            for (let i = 0; i < length; ++i) {
                const t = this.time[i];
                if (t < time) {
                    continue;
                }
                if (t === time) {
                    this.text[i] += '<br>' + text;
                    return;
                }
                if (i !== length - 1) {
                    this.time.splice(i, 0, time);
                    this.text.splice(i, 0, text);
                    return;
                }
            }
            this.time[length] = time;
            this.text[length] = text;
        };
        this.find = function (time) {
            const length = this.time.length;
            for (let i = 0; i < length; ++i) {
                const t = this.time[i] + this.offset;
                if (t < time) {
                    continue;
                }
                if (t === time) {
                    return i;
                }
                return i - 1;
            }
            return length - 1;
        };
        this.goto = function (index) {
            if (this.index !== -1) {
                $($lyricsList[this.index]).removeClass('QPlayer-lyrics-current');
            }
            this.nextTime = this.time[index + 1] + this.offset;
            this.index = index;
            if (index < 0) {
                return;
            }
            const $current = $($lyricsList[index]).addClass('QPlayer-lyrics-current');
            $lyrics.stop(true).animate({
                scrollTop: $current.offset().top - $lyrics.offset().top + $lyrics.scrollTop()
                    - ($lyrics.height() - $current.height()) / 2
            });
        };
        this.next = function (time) {
            if (isNaN(this.nextTime) || this.nextTime > time) {
                return;
            }
            this.goto(this.index + 1);
        };
        this.show = function () {
            const length = this.text.length;
            if (length === 0) {
                return;
            }
            let html = '';
            for (let i = 0; i < length; ++i) {
                html += `<p>${this.text[i]}</p>`;
            }
            $lyrics.removeClass('QPlayer-lyrics-no');
            $lyrics.html(html);
            $lyricsList = $lyrics.children();
            this.goto(-1);
        };
        const linePattern = /^/mg;
        const timePattern = /\t*\[([0-6]?\d):([0-6]?\d)(?:\.(\d{1,3}))?]/g;
        const textPattern = /.*/mg;
        const offsetPattern = /^\[offset:\t*([+-]?\d+)]/mg;
        while ((linePattern.exec(lrc)) !== null) {
            const lineIndex = linePattern.lastIndex;
            let result;
            offsetPattern.lastIndex = lineIndex;
            if ((result = offsetPattern.exec(lrc)) != null) {
                linePattern.lastIndex = offsetPattern.lastIndex;
                this.offset = parseFloat(result[1]);
                continue;
            }
            let index = timePattern.lastIndex = lineIndex;
            const times = [];
            function isTime() {
                return (result = timePattern.exec(lrc)) != null && result.index === index;
            }
            if (!isTime()) {
                ++linePattern.lastIndex;
                continue;
            }
            do {
                linePattern.lastIndex = textPattern.lastIndex = timePattern.lastIndex;
                let time = parseInt(result[1]) * 60000 + parseInt(result[2]) * 1000;
                const f = result[3];
                if (f) {
                    const length = f.length;
                    time += parseInt(length < 3 ? f + '0'.repeat(3 - length) : f);
                }
                times.push(time);
                index = timePattern.lastIndex;
            } while (isTime());
            if (times.length === 0) {
                continue;
            }
            const text = textPattern.exec(lrc)[0].trim();
            const length = times.length;
            for (let i = 0; i < length; ++i) {
                this.add(times[i], text);
            }
        }
        this.has = this.time.length !== 0;
    }

    function errorWithIndex(index) {
        getListLi(index).addClass('QPlayer-list-error');
    }

    /**
     * 加载
     *
     * @param index
     * @return {boolean}
     */
    q.load = function(index) {
        let current = q.current;
        if (current) {
            getProvider(current).stop();
            isLoadPause = true;
            audio.pause();
        }
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
        $list.children('.QPlayer-list-current').removeClass('QPlayer-list-current');
        const $li = getListLi(index).addClass('QPlayer-list-current');
        if (!current) {
            $list.scrollTop($li.offset().top - $list.offset().top + 1);
        }
        current = v.list[index];
        $name.text(current.name);
        $artist.text(current.artist);
        $lyrics.addClass('QPlayer-lyrics-no').html('<p>暂无歌词，请欣赏。</p>');
        $progressCurrent.width('0');
        $lyricsList = null;
        q.index = index;
        q.current = current;
        const provider = getProvider(current);
        provider.call('cover', function (url, cache) {
            if (!url) {
                return;
            }
            $cover.attr('src', url);
            if (cache) {
               current.cover = url;
            }
        });
        provider.call('lyrics', function (lrc) {
            if (!lrc) {
                return;
            }
            if (!(lrc instanceof Lyrics)) {
                current.lyrics = new Lyrics(lrc);
            }
            current.lyrics.show();
        });
        provider.load();
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
     * 2 播放音频
     * 3 加载并播放音频
     */
    function play(index, isPrevious) {
        isPrevisionPlay = isPrevious;
        if (index === false) {
            console.warn('list 为空！');
            return 1;
        } else if (typeof index === 'number') {
            if (!q.load(index)) {
                errorWithIndex(index);
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

        onPlay();
        const current = q.current;
        function error() {
            const list = v.list;
            const _index = list[index] === current ? index : list.indexOf(current);
            if (_index === -1) {
                console.warn('未找到索引');
                return;
            }
            errorWithIndex(_index);
            if (isPrevious) {
                q.previous();
            } else {
                q.next();
            }
        }
        getProvider(current).call('audio', function (url, cache) {
            if (!url) {
                error();
                return;
            }
            if (cache) {
                current.audio = cache;
            }
            audio.src = url;
            audio.load();
            audio.play();
        }, error);
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
    $list.on('click', 'li:not(.QPlayer-list-current)', function () {
        const index = $(this).index();
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
            const lyrics = q.current.lyrics;
            if (lyrics && lyrics.has) {
                lyrics.next(time * 1000);
            }
            if (!isProgressClicked) {
                $progressCurrent.width(100 * time / audio.duration + '%');
            }
        })
        .on('error', function () {
            console.log('error', arguments);
            const index = v.list.indexOf(q.current);
            if (index !== -1) {
                errorWithIndex(index);
            }
            if (isPrevisionPlay) {
                q.previous();
            } else {
                q.next();
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
            const time = current > 0 ? duration * current / total: 0;
            audio.currentTime = time;
            const lyrics = q.current.lyrics;
            if (lyrics && lyrics.has) {
                lyrics.goto(lyrics.find(time * 1000));
            }
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
                const length = value.length;
                let html = '';
                for (let i = 0; i < length; ++i) {
                    const item = value[i];
                    let artist = item.artist;
                    if (Array.isArray(artist)) {
                        item.artist = artist = artist.join('/');
                    }
                    html += `<li><strong>${item.name}</strong><span>${artist}</span></li>`;
                }
                $list.html(html);
                $listLi = $list.children();
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

