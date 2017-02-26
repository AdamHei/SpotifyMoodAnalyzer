var SpotifyWebAPI = require('spotify-web-api-node');
var analyrics = require('analyrics');
var sentimentLog = require('./sentimentlogic');

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

var buildPlaylistsResponse = function (playlists) {
    var response = [];
    playlists.body.items.forEach(function (playlist) {
        var item = {
            name: playlist.name,
            id: playlist.id,
            img_url: playlist.images[0].url
        };
        response.push(item);
    });
    return response;
};


exports.getPlaylistSentiment = function (user_id, playlist_id, succ_func, err_func) {
    spotifyAPI.getPlaylist(user_id, playlist_id)
        .then(function (playlist) {
            buildSentimentResponse(playlist, succ_func, err_func);
        }, function (err) {
            err_func(err);
        });
};

var buildSentimentResponse = function (playlist, succ_func, err_func) {
    var track_data_arr = pruneNamesWithArtistAndID(playlist);
    getLyrics(track_data_arr, function (track_data_with_lyrics) {
        getValencesHelper(track_data_with_lyrics, 0, function (complete_track_data) {
            sentimentLog.findSentiment(complete_track_data, succ_func, err_func);
        });
    });
};

/**
 * Returns a list of track name + artist objects
 * @param playlist
 * @returns {Array}
 */
var pruneNamesWithArtistAndID = function (playlist) {
    var tracks = playlist.body.tracks.items;
    var song_data_arr = [];
    tracks.forEach(function (track) {
        song_data_arr.push({
            artist: track.track.artists[0].name,
            name: track.track.name,
            id: track.track.id
        });
    });
    return song_data_arr;
};


var getLyrics = function (track_data_arr, succ_func) {
    for (var i = 0; i < track_data_arr.length; i++){
        getLyricsHelper(track_data_arr, i, succ_func);
    }
};

var getLyricsHelper = function (track_data_arr, i, succ_func) {
    var obj = track_data_arr[i];
    var query = obj.name + " " + obj.artist;

    analyrics.getSong(query, function (res) {

        track_data_arr[i].lyrics = res.lyrics.replace(/(?:\r\n|\r|\n)/g, '. ');

        if (i == track_data_arr.length - 1) {
            succ_func(track_data_arr);
        }
    });
};

var getValencesHelper = function(track_data_arr, i, succ_func) {
    spotifyAPI.getAudioFeaturesForTrack(track_data_arr[i].id)
        .then(function(data) {

            track_data_arr[i].valence = data.body.valence;

            i++;
            if (i < track_data_arr.length) {
                getValencesHelper(track_data_arr, i, succ_func);
            }
            else {
                succ_func(track_data_arr);
            }
        }, function(err) {
            console.error(err);
        });
};