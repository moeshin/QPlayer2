<?php

use Metowolf\Meting;

function post($key, $default = '') {
    return isset($_POST[$key]) ? $_POST[$key] : $default;
}

function radio($arr, $checked) {
    $f = !array_key_exists($checked, $arr);
    $n = 0;
    foreach ($arr as $k => $v) {
        echo '<label><input type="radio" name="type" value="';
        echo $k;
        echo '"';
        if (($n++ == 0 && $f) || $checked == $k) {
            echo ' checked';
        }
        echo '>';
        echo $v;
        echo '</label>';
    }
}
$type = post('type', 'playlist');
$id = post('id', 3136952023);
$il = post('il') ? true : false;
$cookie = post('cookie');
if (!isset($_POST['type']) || !isset($_POST['id'])
    || !in_array($type, array('playlist', 'song', 'album', 'artist'))) {
    $json = '[]';
} else {
    include_once 'libs/Meting.php';
    $m = new Meting();
    $m->cookie($cookie)->format(true);
    $data = $m->$type($id);
    $data = json_decode($data, 1);
    $r = array();
    foreach ($data as $v) {
        $cover = json_decode($m->pic($v['pic_id']), true);
        $arr = array(
            'name' => $v['name'],
            'artist' => implode(' / ', $v['artist']),
            'audio' => 'https://music.163.com/song/media/outer/url?id=' . $v['id'],
            'cover' => $cover['url']
        );
        if ($il) {
            $lyrics = json_decode($m->lyric($v['lyric_id']), true);
            $arr['lyrics'] = $lyrics['lyric'] . "\n" . $lyrics['tlyric'];
        }
        $r[] = $arr;
    }
    $json = json_encode($r, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <title>Netease Cloud Music Parsing</title>
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="../QPlayer.css">
    <script src="./jquery.min.js"></script>
    <script src="./jquery.marquee.min.js"></script>
    <script src="../QPlayer.js"></script>
    <script src="./script.js"></script>
    <script>
window.execute = function () {
    QPlayer.list = JSON.parse($('#json').val());
}
    </script>
</head>
<body>
<form method="post">
    <p>Type:
        <?php
        radio(array(
            'playlist' => 'Playlist',
            'song' => 'Song',
            'album' => 'Album',
            'artist' => 'Artist'
        ), $type);
        ?>
    </p>
    <p><label>ID: <input name="id" type="text" value="<?php echo $id; ?>"></label></p>
    <p><label><input type="checkbox" name="il" value="true" <?php if ($il) echo 'checked'; ?>>Include lyrics</label></p>
    <label>Cookie:<textarea name="cookie" style="height: 80px;"><?php echo $cookie; ?></textarea></label>
    <p><button type="submit">Get</button></p>
</form>
<label>JSON:<textarea id="json"><?php echo $json; ?></textarea></label>
<p class="right"><button onclick="execute()">Execute</button></p>
</body>
</html>