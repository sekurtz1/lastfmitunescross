var request = require('request');


var queryCallback = function() {
		return function (err, res) {
			if (res.length) {
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
							if (info.resultCount != 0) {
							
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
												artUrl = artUrl.replace('.100x100-', '.1200x1200-');
												request
												.get(artUrl)
												.on('error', function(err){console.log(err)})
												.pipe(fs.createWriteStream('./public/artwork/' + term + '.jpg'));

												console.log('art downloaded from itunes for ' + term);

												thisImage = '/public/artwork/' + term + '.jpg';

												cb2(thisImage);
											} else {
												next1(i+1);

											}

											
											
										} else {
											cb2(null);
											console.log("Didn't find what we were looking for in iTunes results")
										}

									}

									next1(0);
								} else {
									var artUrl = info.results[0].artworkUrl100;
									artUrl = artUrl.replace('.100x100-', '.1200x1200-');
									request
									.get(artUrl)
									.on('error', function(err){console.log(err)})
									.pipe(fs.createWriteStream('./public/artwork/' + term + '.jpg'));

									console.log('art downloaded from itunes for ' + term);

									thisImage = '/public/artwork/' + term + '.jpg';

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
	};



module.exports = queryCallback;






