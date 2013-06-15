
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./lib/middleware/user')
  , register = require('./routes/register')
  , login = require('./routes/login')
  , grave = require('./routes/grave')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('less-middleware')({ src: __dirname + '/public' }));

app.use(express.cookieParser('your secret here'));
app.use(express.cookieSession());

app.use(express.static(path.join(__dirname, 'public')));

// only the routes and middleware following app.use(user) 
// will have access to req.user
app.use(user);

app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Routing
 */

app.get('/', grave.show);

app.get('/register', register.form);
app.post('/register', register.submit);

app.get('/login', login.form);
app.post('/login', login.submit);

app.get('/logout', login.logout);

app.post('/grave', grave.add);

app.get('/:user?', grave.user);
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
