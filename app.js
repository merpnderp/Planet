var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    b = require('browserify')(),
    fs = require('fs');

/*
 b.transform('brfs');
 b.add('./public/main.js');
 b.external('./public/three.js');
 b.external('./public/jquery.js');
 b.external('./public/stats.js');
 b.external('./public/common-shims.js');
 b.bundle().pipe(fs.createWriteStream('./public/bundle.js'));
 */


app.set('port', process.env.PORT || 3001);

app.use(express.logger({'format': 'dev'}));

app.use(express.static(__dirname + '/public', {maxAge: 1}));

//Express server
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
