// Module dependencies
var express = require('express');
var http = require('http');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
//Mail
//var mailer = require('express-mailer');
// Mongo
var mongo = require('mongodb');
var mongoose = require('mongoose');
//ChromaWallet
var cWallet = require('cc-wallet-core');
//Auth
var basicAuth = require('basic-auth-connect')

//Launch express
var app = express();

//Get Arguments
var args = process.argv.slice(2);
var port = process.env.PORT;

//Set Envarioment
if (args[0] == 'dev'){
    var port = 3010;
} else if (args[0] == 'prod'){
    //Use HTTP Auth on PROD
    app.use(basicAuth('coupling', '666'));
}

//Connect DB
mongoose.connect('mongodb://admin:admin@ds053190.mongolab.com:53190/couplingio');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Connected to MONGOLAB DB !');
});

//Mailer app config
/*
mailer.extend(app, {
  from: 'no-reply@example.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'contact@user.com',
    pass: 'pass'
  }
});
*/
// Config Envarioment
app.set('port', port || process.env.PORT);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Schemas
require('./schemas/user')(db);

//Routes
var routes = require('./routes/routes');

//Set Up JSON parser and view engine
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Express app requirements and response
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.get('/', routes.index);
app.get('/partials/:name',routes.partials);
app.get('/home', routes.index);
app.get('/login', routes.index);
app.get('/register', routes.index);
app.get('/issueCoupon', routes.index);
app.get('/404', routes.index);

app.post('/login', routes.login);
app.post('/register', routes.register);
app.post('/changePass', routes.changePass);
app.post('/issueCoupon', routes.issueCoupon);
app.post('/createWallet', routes.createWallet);

//IF NOT GO TO ERROR404
app.all('*',function(req,res) { res.redirect('/404') });

module.exports = app;

//Start the server
app.listen(app.get('port'), function() {
    console.log('CouplingIO app started on '+Date(Date.now())+' at port: '+app.get('port'));
})



