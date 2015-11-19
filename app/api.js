// setup ================================================================================
var request = require('request');
var mongoose = require('mongoose');
var config = require('../config/config');
var moment = require('moment');
var async = require('async');

// config ===============================================================================

mongoose.connect(config.url);
var username = config.username;
var apiKey = config.apiKey;

var Song = require('./models/song');

// last.fm api call and data save =======================================================

var apiRequest = function() {


	var options = {
		url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + '&format=json&limit=25',

	};
	function requestCallback(error, response, body) {
			if (!error && response.statusCode == 200) {
				var info = JSON.parse(body);
				// console.log(info['recenttracks']['track']);

				var next = function(i) {
		
					if (i < info.recenttracks.track.length) {
						
						if (info['recenttracks']['track'][i]['@attr']) {
							next(i+1);
						} else {

							var apiName = info['recenttracks']['track'][i]['name'];
							var apiDate = moment(new Date(info['recenttracks']['track'][i]['date']['#text']));
							var apiArtist = info['recenttracks']['track'][i]['artist']['#text'];
							var artistMbid = info['recenttracks']['track'][i]['artist']['mbid'];
							var apiAlbum = info['recenttracks']['track'][i]['album']['#text'];
							var albumMbid = info['recenttracks']['track'][i]['album']['mbid'];
							var apiImage = info['recenttracks']['track'][i]['image'][3]['#text'];

							Song.find({'name': apiName, 'artist.artist': apiArtist}, function(err, res) {


		  						if (res.length) {

		  							var storedDate = moment(new Date(res[0].date));

		  							if (storedDate.isBefore(apiDate)) {
		  								
		  								Song.update(
										{'name': apiName, 'artist.artist': apiArtist},
										{ $inc: {playcount: 1}, $set: {date: apiDate.toISOString()}},
										function(err, doc) {
											if (err) throw err;
										}

										);

		  								console.log(apiName, "playcount and date updated");

		  								next(i+1);

		  							} 

		  							// This 'else if' statement is only necessary for the backload of data into mongo (if you want to do that)
		  						// 	else if (storedDate.isAfter(apiDate)) {

		  						// 		Song.update(
										// {name: apiName},
										// { $inc: {playcount: 1}},
										// function(err, doc) {
										// 	if (err) throw err;
										// }

										// );

		  						// 		console.log(apiName, "playcount updated");

		  						// 		next(i+1);


		  						// 	}




		  							else {

		  								// console.log("Song already exists!");

		  								next(i+1);

		  							}


		  							
		  						} else {
		 							
									var newSong = new Song ({
									artist: {
										artist: apiArtist,
										mbid: artistMbid
									},
									name: apiName,
									album: {
										album: apiAlbum,
										mbid: albumMbid
									},
									image: apiImage,
									date: apiDate.toISOString(),
									playcount: 1

									});

									async.series([
										function(callback) {

											newSong.artwork(function(imageurl) {


			  								callback(null, imageurl);

											});
											
										},

										function(callback) {

											newSong.save(function(err) {
					  							if (err) throw err;

					  						console.log('Song created!');
					  						callback();
											});
											
										}
									],

									function(err, results) {
										// console.log(results[0]);

										setTimeout(function(){
											if (results[0] != null) {
												Song.update(
													{name: apiName},
													{$set:{image: results[0]}},
													function(err, doc) {
														if (err) throw err;
													});
												
											} else {
												//do nothing
											}
										}, 200);
									
									});

									next(i+1);
									}

									

							

							});

						};

					};


				};

				next(0);

				
			} else {
				console.log(error);
				console.log(response);
			}
	}

	request(options, requestCallback);
};


module.exports = apiRequest;


