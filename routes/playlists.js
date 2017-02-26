var express = require('express');
var router = express.Router();

var spotLogic = require('../spotifylogic');


router.get('/', function (req, res, next) {
    res.send('Hello');
});

router.get('/:user_id', function (req, res, next) {
    spotLogic.getPlaylists(req.params['user_id'], function (playlists) {
        res.send(playlists);
    }, function (err) {
        console.error(err);
        res.send(err);
    });
});

router.get('/:user_id/:playlist_id', function (req, res, next) {
    var user_id = req.params['user_id'], playlist_id = req.params['playlist_id'];
    spotLogic.getPlaylistSentiment(user_id, playlist_id, function (playlist_sentiment) {
        res.send(playlist_sentiment);
    }, function (err) {
        console.error(err);
        res.send('We done goofed');
    })
});


module.exports = router;
