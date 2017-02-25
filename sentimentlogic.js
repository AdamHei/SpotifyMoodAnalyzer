var sentiment = require('sentiment');

var exports = module.exports = {};


exports.findSentiment = function (song_details_arr, succ_func, err_func) {
    addSentiment(song_details_arr);

    console.log(song_details_arr);


    //TODO Replace
    succ_func(song_details_arr);
};

var addSentiment = function (song_details_arr) {
    for (var i = 0; i < song_details_arr.length; i++) {
        song_details_arr[i].sentiment = sentiment(song_details_arr[i].lyrics);
        var val = song_details_arr[i].valence;
        var comp = song_details_arr[i].sentiment.comparative;
        song_details_arr[i].sentiment_score = (val + (comp + 1) / 2) / 2;
    }
};