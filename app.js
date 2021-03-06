var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    fs = require('fs');

app.set('port', process.env.PORT || 3001);

app.use(express.logger({'format': 'dev'}));

app.use(express.static(__dirname + '/public', {maxAge: 1}));

//Express server
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
