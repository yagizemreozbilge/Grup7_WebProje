if(process.env.NODE_ENV != "production")
  require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');




var app = express();
console.log("ENV", process.env);

// CORS yapılandırması - Frontend'den gelen isteklere izin ver
app.use(cors({
  origin: function (origin, callback) {
    // Development için tüm localhost portlarına izin ver
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
  console.log("Merhaba Dunya!");
  next();
});

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/roles', require('./routes/roles'));
app.use('/availabilities', require('./routes/availabilities'));
app.use('/reservations', require('./routes/reservations'));
app.use('/fields', require('./routes/fields'));
app.use('/tenants', require('./routes/tenants'));
app.use('/auditlogs', require('./routes/auditlogs'));









// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
