module.exports = function(app) {
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

app.get('/api/gettracks', function(req, res) {
	//api layer - to build when constructing the front end. don't know what I want to do yet. 
})





};