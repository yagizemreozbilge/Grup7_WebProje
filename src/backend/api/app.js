if (process.env.NODE_ENV != "production")
    require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var customersRouter = require('./routes/customers');
var adminRouter = require('./routes/admin');
var app = express();

if (process.env.NODE_ENV !== "production") {
    console.log("ENV", process.env);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/roles', require('./routes/roles'));
app.use('/availabilities', require('./routes/availabilities'));
app.use('/reservations', require('./routes/reservations'));
app.use('/fields', require('./routes/fields'));
app.use('/tenants', require('./routes/tenants'));
app.use('/auditlogs', require('./routes/auditlogs'));
app.use('/customers', require('./routes/customers'));
app.use('/admin', require('./routes/admin'));










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