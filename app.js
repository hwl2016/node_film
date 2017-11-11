var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var index = require('./routes/index');
var user = require('./routes/user');

var app = express();

var dbUrl = 'mongodb://localhost/film';

mongoose.connect(dbUrl, {
    useMongoClient: true
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    resave:false,//添加这行
    saveUninitialized: true,//添加这行
    secret: 'Huwl',
    store: new mongoStore({ //将session持久化到mongodb中去
        url: dbUrl, //mongodb的url
        collection: 'sessions'  //存储到mongodb中的集合
    })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');

//获取session
app.use((req, res, next) => {
    app.locals.user = req.session.user || null;
    next();
});

app.use('/', index);
app.use('/user', user);

if(app.get('evn') === 'development') {
    mongoose.set('debug', true);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
