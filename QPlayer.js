$(function () {

    if (!window.QPlayer) {
        window.QPlayer = {};
    }
    var q = window.QPlayer || (window.QPlayer = {});
    var v = {};

    var
        $q = $('#QPlayer'),
        $audio = $('#QPlayer-audio'),
        $cover = $('#QPlayer-cover'),
        $coverImg = $('#QPlayer-cover-img'),
        $list = $('#QPlayer-list'),
        $title = $('#QPlayer-title'),
        $more = $('#QPlayer-more'),
        $time = $('#QPlayer-time'),
        $progress = $('#QPlayer-progress'),
        $progressCurrent = $('#QPlayer-progress-current'),
        $lyrics = $('#QPlayer-lyrics'),
        $mode = $('#QPlayer-btn-mode')
    ;

    var
        audio = $audio[0]
    ;

    var $lyricsList, $listLi, isLoadPause, isPrevisionPlay, errorStartIndex, isAllError;

    q.index = -1;
    q.current = null;
    if (!q.provider) {
        q.provider = {};
    }

    function Shuffle(index) {
        var _this = this;
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
                var length = v.list.length;
                if (this.list.length === length) {
                    this.index = length - 1;
                    return this.list[this.index];
                }
                var index = getIndex();
                this.list.unshift(index);
                return index;
            }
            if (this.index === -1) {
                return push();
            }
            return this.list[--this.index];
        };
        function push() {
            var index = getIndex();
            _this.list.push(index);
            ++_this.index;
            return index;
        }
        function getIndex() {
            var length = v.list.length;
            if (_this.index === -1) {
                return random(length);
            }
            var list = [];
            for (var i = 0; i < length; ++i) {
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
        if (q.isShuffle) {
            return q.shuffle.next();
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
        if (q.isShuffle) {
            return q.shuffle.previous();
        }
        if (--q.index < 0) {
            q.index = q.list.length - 1;
        }
        return q.index;
    }

    function onPlay() {
        $q.addClass('QPlayer-playing');
        $title.marquee('resume');
    }

    function onPause() {
        if (isLoadPause) {
            isLoadPause = false;
            return;
        }
        $q.removeClass('QPlayer-playing');
        $title.marquee('pause');
    }

    function s2m(s) {
        var m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        return m + ':' + s;
    }

    function getListLi(index) {
        return $listLi.eq(index);
    }

    function Provider(provider, current) {
        var callbacks = new ProviderCallback();
        var isStop;
        this.call = function (name, success, error) {
            if (!error) {
                error = function () {}
            }
            var data = current[name];
            if (data) {
                success(data);
                return;
            }
            var callback = provider[name];
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
            var load = provider.load;
            if (!load) {
                return;
            }
            load(current, callbacks);
        };

        function ProviderCallback() {
            var callbacks = {};
            var caches = {};
            this.success = function (name, data, cache) {
                var callback = callbacks[name];
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
                var callback = callbacks[name];
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
                var cache = caches[name];
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
        // noinspection JSUnresolvedVariable
        var providerName = current.provider || q.defaultProvider;
        if (typeof providerName === 'string') {
            var provider = q.provider[providerName];
            if (!provider) {
                console.warn('没有找到相应的 Provider：' + providerName);
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
            var length = this.time.length;
            for (var i = 0; i < length; ++i) {
                var t = this.time[i];
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
            var length = this.time.length;
            for (var i = 0; i < length; ++i) {
                var t = this.time[i] + this.offset;
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
            var $current = $($lyricsList[index]).addClass('QPlayer-lyrics-current');
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
            var length = this.text.length;
            if (length === 0) {
                return;
            }
            var html = '';
            for (var i = 0; i < length; ++i) {
                html += '<p>' + this.text[i] + '</p>';
            }
            $lyrics.removeClass('QPlayer-lyrics-no');
            $lyrics.html(html);
            $lyricsList = $lyrics.children();
            this.goto(-1);
        };
        var linePattern = /^/mg;
        var timePattern = /\t*\[([0-6]?\d):([0-6]?\d)(?:\.(\d{1,3}))?]/g;
        var textPattern = /.*/mg;
        var offsetPattern = /^\[offset:\t*([+-]?\d+)]/mg;
        while ((linePattern.exec(lrc)) !== null) {
            var lineIndex = linePattern.lastIndex;
            var result;
            offsetPattern.lastIndex = lineIndex;
            if ((result = offsetPattern.exec(lrc)) != null) {
                linePattern.lastIndex = offsetPattern.lastIndex;
                this.offset = parseFloat(result[1]);
                continue;
            }
            var index = timePattern.lastIndex = lineIndex;
            var times = [];
            function isTime() {
                // noinspection JSReferencingMutableVariableFromClosure
                return (result = timePattern.exec(lrc)) != null && result.index === index;
            }
            if (!isTime()) {
                ++linePattern.lastIndex;
                continue;
            }
            do {
                linePattern.lastIndex = textPattern.lastIndex = timePattern.lastIndex;
                var time = parseInt(result[1]) * 60000 + parseInt(result[2]) * 1000;
                var f = result[3];
                if (f) {
                    var fLength = f.length;
                    time += parseInt(fLength < 3 ? f + '0'.repeat(3 - fLength) : f);
                }
                times.push(time);
                index = timePattern.lastIndex;
            } while (isTime());
            if (times.length === 0) {
                continue;
            }
            var text = textPattern.exec(lrc)[0].trim();
            var length = times.length;
            for (var i = 0; i < length; ++i) {
                this.add(times[i], text);
            }
        }
        this.has = this.time.length !== 0;
    }

    function errorWithIndex(index) {
        if (errorStartIndex === index) {
            isAllError = true;
            init();
            q.pause();
            return true;
        }
        if (errorStartIndex === -1) {
            errorStartIndex = index;
        }
        getListLi(index).addClass('QPlayer-list-error');
        return false;
    }

    function initLoad() {
        $lyrics.addClass('QPlayer-lyrics-no').html('<p>无歌词，请欣赏。</p>');
        $lyricsList = null;
        $progressCurrent.width('0');
        audio.currentTime = 0;
        $cover.addClass('QPlayer-cover-no');
        $cover.offset();
        $title.marquee('destroy');
    }

    function init() {
        q.index= -1;
        q.current = null;
        initLoad();
        $title.html('<strong>没有歌曲</strong>');
        isLoadPause = false;
        errorStartIndex = -1;
    }

    function isNeedMarquee() {
        var width = 0;
        // noinspection JSUnresolvedFunction
        $title.children().each(function () {
            width += $(this).width();
        });
        return width > $title.width();
    }

    /**
     * 加载
     *
     * @param {Number} index
     * @return {boolean}
     */
    q.load = function(index) {
        isAllError = false;
        var current = q.current;
        if (current) {
            getProvider(current).stop();
            isLoadPause = true;
            audio.pause();
        }
        initLoad();
        var length = v.list.length;
        if (length === 0) {
            console.warn('list 为空！');
            return false;
        }
        if (!(length > index || index > 0)) {
            console.warn('超出 list，length=' + length + '，index=' + index);
            return false;
        }
        $list.children('.QPlayer-list-current').removeClass('QPlayer-list-current');
        var $li = getListLi(index).addClass('QPlayer-list-current');
        if (!current) {
            $list.scrollTop($li.offset().top - $list.offset().top + 1);
        }
        current = v.list[index];
        $title.html('<strong>' + current.name + '</strong><span>' + current.artist + '</span>');
        if (isNeedMarquee()) {
            $title.marquee({
                duration: 10000,
                gap: 40,
                delayBeforeStart: 1000,
                duplicated: true,
                startVisible: true
            }).marquee('pause');
        }
        q.index = index;
        q.current = current;
        var provider = getProvider(current);
        provider.call('cover', function (url, cache) {
            if (isAllError || !url) {
                return;
            }
            $coverImg.attr('src', url);
            $cover.removeClass('QPlayer-cover-no');
            if (cache) {
               current.cover = url;
            }
        });
        provider.call('lyrics', function (lrc) {
            if (isAllError || !lrc) {
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
     * 4 全部错误无法播放
     */
    function play(index, isPrevious) {
        isPrevisionPlay = isPrevious;
        if (index === false) {
            console.warn('list 为空！');
            return 1;
        } else if (typeof index === 'number') {
            if (!q.load(index)) {
                return errorWithIndex(index) ? 4 : 0;
            }
        } else {
            index = q.index;
            if (audio.readyState !== 0) {
                onPlay();
                audio.play();
                return 2;
            }
        }
        if (index === -1) {
            return 0;
        }

        onPlay();
        var current = q.current;
        function error() {
            var list = v.list;
            var _index = list[index] === current ? index : list.indexOf(current);
            if (_index === -1) {
                console.warn('未找到索引');
                return;
            }
            if (errorWithIndex(_index)) {
                return;
            }
            if (isPrevious) {
                q.previous();
            } else {
                q.next();
            }
        }
        getProvider(current).call('audio', function (url, cache) {
            if (isAllError) {
                return;
            }
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

    q.play = function (index, isPrevious) {
        var bool = play(index, isPrevious);
        if (bool) {
            return bool;
        }
        return isPrevious ? q.previous() : q.next();
    };

    q.pause = function () {
        onPause();
        audio.pause();
    };

    q.next = function () {
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
        if ($q.hasClass('QPlayer-playing')) {
            q.pause();
        } else {
            q.play();
        }
    });
    $('#QPlayer-btn-next').click(q.next);
    $('#QPlayer-btn-previous').click(q.previous);
    $cover.click(function () {
        q.isRotate = !v.isRotate;
    });
    $mode.click(function () {
        q.isShuffle = !v.isShuffle
    });
    $list.on('click', 'li:not(.QPlayer-list-current)', function () {
        var index = $(this).index();
        if (v.isShuffle) {
            q.shuffle = new Shuffle(index);
        }
        q.play(index);
    });
    $audio
        .on('playing', onPlay)
        .on('pause', onPause)
        .on('ended', q.next)
        .on('timeupdate', function () {
            var time = audio.currentTime;
            $time.text(s2m(time));
            var lyrics = q.current.lyrics;
            if (lyrics && lyrics.has) {
                lyrics.next(time * 1000);
            }
            if (!isProgressClicked) {
                $progressCurrent.width(100 * time / audio.duration + '%');
            }
        })
        .on('error', function () {
            console.log('error', arguments);
            var index = v.list.indexOf(q.current);
            if (index !== -1 && errorWithIndex(index)) {
                return;
            }
            if (isPrevisionPlay) {
                q.previous();
            } else {
                q.next();
            }
        })
        .on('canplay', function () {
            errorStartIndex = -1;
        })
    ;

    // 进度条操作
    var isProgressClicked;
    function getXFromEvent(e) {
        var type = e.type;
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
        var total = $progress.width();
        var current = getProgressFromEvent(e);
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
            var duration = audio.duration;
            if (isNaN(duration)) {
                $progressCurrent.width(0);
                return;
            }
            var total = $progress.width();
            var current = getProgressFromEvent(e);
            if (current >= total) {
                q.next();
                return;
            }
            var time = current > 0 ? duration * current / total: 0;
            audio.currentTime = time;
            var lyrics = q.current.lyrics;
            if (lyrics && lyrics.has) {
                lyrics.goto(lyrics.find(time * 1000));
            }
        })
        .on('mousemove touchmove', moveProgress);

    init();
    $list.html('<li class="QPlayer-list-current">没有歌曲</li>');

    function getLocalStorageName(name) {
        return 'QPlayer-' + name;
    }

    function getBoolFromLocalStorage(name) {
        var value = localStorage.getItem(getLocalStorageName(name));
        return !!(value && value !== 'false');
    }

    function setBoolFromLocalStorage(name, value) {
        localStorage.setItem(getLocalStorageName(name), value);
    }

    function hasLocalStorageName(name) {
        return localStorage.hasOwnProperty(getLocalStorageName(name));
    }

    function defineProperties(obj, properties) {
        var keys = Object.keys(properties);
        var length = keys.length;
        for (var i1 = 0; i1 < length; ++i1) {
            var key1 = keys[i1];
            v[key1] = obj[key1];
        }
        Object.defineProperties(obj, properties);
        for (var i2 = 0; i2 < length; ++i2) {
            var key2 = keys[i2];
            if (properties[key2].type === 'bool' && hasLocalStorageName(key2)) {
                obj[key2] = getBoolFromLocalStorage(key2);
                continue;
            }
            obj[key2] = v[key2] || properties[key2].default;
        }
    }

    defineProperties(q,{
        isShuffle: {
            get: function () {
                return v.isShuffle;
            },
            set: function (value) {
                v.isShuffle = value;
                setBoolFromLocalStorage('isShuffle', value);
                if (value) {
                    $mode.addClass('QPlayer-shuffle');
                    var index = q.index;
                    q.shuffle = new Shuffle(index === -1 ? undefined : index);
                } else {
                    $mode.removeClass('QPlayer-shuffle');
                    q.shuffle = null;
                }
            },
            type: 'bool',
            default: false
        },
        isRotate: {
            get: function () {
                return v.isRotate;
            },
            set: function (value) {
                v.isRotate = value;
                setBoolFromLocalStorage('isRotate', value);
                if (value) {
                    $cover.addClass('QPlayer-cover-rotate');
                } else {
                    $cover.removeClass('QPlayer-cover-rotate');
                }
            },
            type: 'bool',
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
                var length = value.length;
                var html = '';
                for (var i = 0; i < length; ++i) {
                    var item = value[i];
                    var artist = item.artist;
                    if (Array.isArray(artist)) {
                        item.artist = artist = artist.join('/');
                    }
                    html += '<li><strong>' + item.name + '</strong><span>' + artist + '</span></li>';
                }
                $list.html(html);
                $listLi = $list.children();
                if (q.index > -1 && q.current) {
                    if (length > q.index && value[q.index] === q.current) {
                        return;
                    }
                    if (length === 0) {
                        return;
                    }
                }
                init();
                // noinspection JSCheckFunctionSignatures
                q.load(getNextIndex());
            },
            type: 'list',
            default: []
        }
    });
});

