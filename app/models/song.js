var request = require('request'); //for my built in method
// var queryCallback = require('../utils') //placeholder to abstract function later

// load mongoose since we need it to define a model
    var mongoose = require('mongoose');

//First way to do this
	var Schema = mongoose.Schema;

//Create schema
	var songSchema = new Schema({
		artist: {
			artist: String,
			mbid: String
		},
    	name: String,
    	album: {
    		album: String,
    		mbid: String
    	},
    	image: String,
		date: String,
		playcount: Number
	});

//Custom method to grab album art
songSchema.methods.artwork = function(cb2){
	var thisArtist = this.artist.artist;
	var thisImage = this.image;
	var thisAlbum = this.album.album;
	var term = encodeURIComponent(thisAlbum);
	console.log(thisArtist, term, thisImage);
	var queryCallback = function() {
		return function (err, res) {
			if (res.length && res[0].image.indexOf('/public') >= 0) {
				cb2(res[0].image);
				console.log('art found!');
			} else {
				var artworkRequest = function() {
					var fs = require('fs');
					var options = {
						url: 'https://itunes.apple.com/search?term=' + term + '&country=us&media=music&entity=album'

					};
					function requestCallback2(error, response, body) {
						if (!error && response.statusCode == 200) {
							var info = JSON.parse(body);
							// console.log(info.results[0].artistName);
							if (info.resultCount !== 0) {
							
								if (info.resultCount > 1) {
									var next1 = function(i) {
										
										if (i < info.results.length) {

											var artistName = info.results[i].artistName;
											var albumName = info.results[i].collectionName;
											// console.log(thisArtist);
											// console.log(artistName);
											// console.log(albumName);
											// console.log(thisAlbum);

											if (artistName.toLowerCase() == thisArtist.toLowerCase() && albumName.toLowerCase() == thisAlbum.toLowerCase()) {
												var artUrl = info.results[i].artworkUrl100;
												artUrl = artUrl.replace('100x100', '1200x1200'); 
												console.log("url = ", artUrl);
												request
												.get(artUrl)
												.on('error', function(err){console.log(err)})
												.pipe(fs.createWriteStream('./public/artwork/' + thisAlbum.replace(/\s+|\//g, "-") + '.jpg'));

												console.log('art downloaded from itunes for ' + thisAlbum);

												thisImage = '/public/artwork/' + thisAlbum.replace(/\s+|\//g, "-") + '.jpg';

												cb2(thisImage);
											} else {
												next1(i+1);

											}

											
											
										} else {
											cb2(null);
											console.log("Didn't find what we were looking for in iTunes results for" + term);
										}

									}

									next1(0);
								} else {
									var artUrl = info.results[0].artworkUrl100;
									artUrl = artUrl.replace('100x100', '1200x1200');
									console.log("url = ", artUrl);
									request
									.get(artUrl)
									.on('error', function(err){console.log(err)})
									.pipe(fs.createWriteStream('./public/artwork/' + thisAlbum.replace(/\s+|\//g, "-") + '.jpg'));

									console.log('art downloaded from itunes for ' + thisAlbum);

									thisImage = '/public/artwork/' + thisAlbum.replace(/\s|\/+/g, "-") + '.jpg';

									cb2(thisImage);
								}
							} else {
								console.log('No Art Found For ' + term);
								cb2(null);
							}

					
						} else {
							console.log(error);
							console.log(response);
						}
					}

				request(options, requestCallback2);

				};

				artworkRequest();



			}
		}
	}

	return this.model('Song').find({'artist.artist': this.artist.artist, 'album.album': this.album.album}, queryCallback()); 
	
};

//Create model
	var Song = mongoose.model('Song', songSchema);

//Make model available
	module.exports = Song;
   





//Second way to do this

    // module.exports = mongoose.model('Song', {
        
    // 	artist: String,
    // 	name: String,
    // 	album: String,
    // 	image: String,
    // 	date: String,
    // 	playcount: Number

    // });