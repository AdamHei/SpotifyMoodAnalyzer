var sentiment = require('sentiment');
var SpotifyWebAPI = require('spotify-web-api-node');
var analyrics = require('analyrics');

var exports = module.exports = {};

var spotifyAPI = new SpotifyWebAPI({
    clientId: '10d6ca9bb5f34241afd1d5c07ec171fb',
    clientSecret: '8c3a9c91754043d098970e355dd5c137'
});

spotifyAPI.clientCredentialsGrant()
    .then(function (data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);

        spotifyAPI.setAccessToken(data.body['access_token']);
    }, function (err) {
        console.error(err);
    });


exports.getPlaylists = function (user_id, succ_func, err_func) {
    spotifyAPI.getUserPlaylists(user_id, {limit: 50})
        .then(function (data) {
            var res = buildPlaylistsResponse(data);
            succ_func(res);
        }, function (err) {
            err_func(err);
        });
};

exports.getPlaylistSentiment = function (user_id, playlist_id, succ_func, err_func) {
    spotifyAPI.getPlaylist(user_id, playlist_id)
        .then(function (playlist) {
            console.log(playlist);
            succ_func(playlist);
        }, function (err) {
            err_func(err);
        })
};

var buildPlaylistsResponse = function (playlists) {
    var response = [];
    playlists.body.items.forEach(function (playlist) {
        var item = {
            name : playlist.name,
            id : playlist.id,
            img_url : playlist.images[0].url
        };
        response.push(item);
    });
    return response;
};