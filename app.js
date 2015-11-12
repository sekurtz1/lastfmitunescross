// set up ======================================================================
var express = require('express');
var app = express();

// config ======================================================================

app.use(express.static('public'));
 
// routes ======================================================================
require('./app/routes')(app);

// last.fm api call and data save ==============================================


var apiRequest = require('./app/api');


apiRequest();
// setInterval(apiRequest, 60000); //uncomment to run last.fm API check on interval






app.listen(8080);
console.log('server listening on port 8080');