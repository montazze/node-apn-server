var express = require('express')
  , routes = require('./routes/index.js')
  , userRoutes = require('./routes/users.js')
  , apiRoutes = require('./routes/api.js')
  , sessionRoutes = require('./routes/sessions.js')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash');

var app = express();
process.setMaxListeners(0);

// middleware to add "loggedIn" to the available variables
// when rendering views
var setLoggedIn = function(request, response, next){
	if(request.session == null || request.session.user == null){
		response.locals.loggedIn = false;
	}
	else{
		response.locals.loggedIn = true;
	}
	next();
};

// middleware to force a login for requests that require a session
function requiresLogin(request, response, next) {
  if (request.session.user) {
    next();
  } else {
    response.redirect('/sessions/new?redir=' + request.url);
  }
};

// global configure options
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(setLoggedIn);
  app.use(flash());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// development configure options
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
	app.locals.pretty = true;
});

// production configure options
app.configure('production', function() {
	app.use(express.errorHandler());
});

// the site root
app.get('/', requiresLogin, routes.index);

// session resources
app.get('/sessions/new', sessionRoutes.new);
app.post('/sessions', sessionRoutes.create);
app.get('/sessions/destroy', requiresLogin, sessionRoutes.destroy);

// user resources
app.get('/users', requiresLogin, userRoutes.index);
app.get('/users/new', requiresLogin, userRoutes.new);
app.post('/users', requiresLogin, userRoutes.create);
app.get('/users/:id', requiresLogin, userRoutes.show);
app.get('/users/:id/edit', requiresLogin, userRoutes.edit);
app.put('/users/:id', requiresLogin, userRoutes.update);

// api "Resources"... yes, I know, they aren't really resources...
app.get('/api/upload', requiresLogin, apiRoutes.getUpload);
app.post('/api/upload', apiRoutes.postUpload);
app.get('/api/notify', apiRoutes.getNotify)
app.post('/api/notify', apiRoutes.postNotify);
app.post('/api/connect', apiRoutes.connect);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
