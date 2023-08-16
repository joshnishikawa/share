//"use strict";
require('dotenv').config();
const express = require('express');
const app = express();
const createError = require('http-errors');
const logger = require('morgan');
const path = require('path');
const teachersRouter = require('./routes/teachers');
const studentsRouter = require('./routes/students');

const port = process.env.PORT || 5000;

const { I18n } = require('i18n');
const i18n = new I18n({
  locales: ['en', 'ja'],
  directory: path.join(__dirname, 'locales'),
  retryInDefaultLocale: true,
  objectNotation: true,
  autoReload: true
});


app.listen(port, (err)=>{
  if(err) {
    console.error(err);
    return;
  }
  console.log('Listening on port: ', port);
});

// SET VIEW ENGINE /////////////////////////////////////////////////////////////
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// PROCESS USER REQUESTS *IN ORDER* ////////////////////////////////////////////
app.use( logger('dev') );
app.use(  express.static( path.join(__dirname, 'public') )  );
app.use( i18n.init );
app.use('/', studentsRouter);
app.use('/teachers', teachersRouter);

app.use( (req, res, next)=> { next(createError(404)); });
app.use( (err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
  return;
});

module.exports = app;
