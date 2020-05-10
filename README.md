# QPLayer

A simple and compact HTML5 bottom hover music player.

### List Item

| Key       | Type                       |
| --------- | -------------------------- |
| name      | String                     |
| artist    | Array &#124; String        |
| audio     | Url                        |
| cover     | Url                        |
| lyrics    | [LRC][0] &#124; Lyrics     |
| provider  | [Provider Name](#Provider) |

### Provider

Make loading data more flexible.

| Callback  | Success param |
| --------- | ------------- |
| audio     | url, cache    |
| cover     | url, cache    |
| lyrics    | [lrc][0]         |

 ```js
/**
 * @param {Object}   current  Current list item.
 * @param {function} success  See the table.
 * @param {function} error    No param and only audio is available.
 */
function callback(current, success, error) {}
 ```

#### Load

You also can set them to `true` to callback when loading.

```js
/**
 * @param {Object} current    Current list item.
 * @param {Object} callbacks
 * {
 *     success: function(name, ...arguments) {},
 *     error: function(name) {}
 * }
 */
function callback(current, callbacks) {}
```

#### Example 1: General callback

```js
QPlayer = $.extend(true, QPlayer, {
    provider: {
        example: {
            lyrics: function(current, success) {
                if (current.lrc) {
                    $.ajax({
                        url: current.lrc,
                        success: function(lrc) {
                            if (lrc) {
                                success(lrc);
                            }
                        }
                    });
                }
            }
        }
    },
    list: [{
        name: 'Hello World',
        lrc: 'Hello World.lrc',
        provider: 'example'
    }]
});
QPlayer.list = [{
    name: 'Hello World',
    lrc: 'Hello World.lrc',
    provider: 'example'
}];
```

#### Example 2: Loading callback

```js
QPlayer = $.extend(true, QPlayer, {
    provider: {
        example: {
            load: function(current, callbacks) {
                var name = current.name;
                callbacks.success('audio', name + '.mp3');
                callbacks.success('cover', name + '.png');
                $.ajax({
                    url: name + '.lrc',
                    success: function(lrc) {
                        if (lrc) {
                            callbacks.success('lyrics', lrc);
                        }
                    }
                });
            }
        }
    }
});
QPlayer.list = [{
    name: 'Hello World',
    provider: 'example'
}];
```

#### Default Provider

You can set `QPlayer.defaultProvider` to change default provider, default is `default`.

#### QPlayer.provider.default

If the list item has the `lrc` property set and it is `url`, will use ajax load it.

And you set `QPlayer.provider.default.dataType`, default is `*`, see [jQuery.ajax()](https://api.jquery.com/jQuery.ajax/) for details.

### QPlayer.setColor

```js
/**
* @param {Object|String} options A color or options.
*/
function setColor(options) {}
```

| Options
| -----
| all
| switch
| progress
| list
| lyrics

You can set `false` to filter.

### QPlayer.init

It will be auto called with jQuery ready.

You can also call it after [pjax](https://github.com/defunkt/jquery-pjax).


[0]: https://de.wikipedia.org/wiki/LRC_(Dateiformat
