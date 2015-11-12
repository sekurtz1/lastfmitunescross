var Song = require('./models/song');
var path = require('path');

module.exports = function(app) {


//index.html

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

//api layer 


// recent tracks - returns object with 9 most recent listened to tracks
// if listening to more than one track on an album, returns '(Multiple Tracks)' in array
app.get('/api/getrecent', function(req, res) {
	Song.find({}).sort('-date').limit(200).exec(function(err,songs) {
		if (err) {
			res.send(err);
		} else {
			var results = []; //creating array to put results
			var goNext = function(i) {

			
				if (i < songs.length) {
					//check if the results array has less than 9 entries
					if(results.length < 9) {
						//do something
						var entry = songs[i];
						var uniqueKey = entry.artist.artist + entry.album.album; //concat artist and name to compare against results array
						if (results.length == 0) {
							 results.push(entry); //push the first song returned into the results array
						} else {
							var goNext2 = function(j) {


								if (j < results.length) {  //iterate through items already pushed to results array
									var arrayEntry = results[j];
									var arrayKey = arrayEntry.artist.artist + arrayEntry.album.album; //concat artist and name already in results to compare against songs query
									if (arrayKey == uniqueKey) {
										arrayEntry.name = "(Multiple Tracks)"; //if multiple tracks from same album, return "multiple tracks"
										return results;
									} else {
										goNext2(j+1);
									}

								} else {
									results.push(entry);
									return results;
								}
							};

							goNext2(0);
						}

						goNext(i+1);

					} else {
						//do nothing
						return results;
					}

					return results;
				}
			};
			goNext(0);

			// console.log(results);

			res.send({songs: results});
			// res.send("test");
		}
	});
});





};