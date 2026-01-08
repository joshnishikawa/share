//"use strict";
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const socket_io = require('socket.io')(server);
const io = require('./routes/io');
io(socket_io);

const createError = require('http-errors');
const logger = require('morgan');
const path = require('path');
const mainRouter = require('./routes/main');
const TRouter = require('./routes/teachers');
const mediaRouter = require('./routes/media');

const { I18n } = require('i18n');
const i18n = new I18n({
  locales: ['en', 'ja'],
  directory: path.join(__dirname, 'locales'),
  retryInDefaultLocale: true,
  objectNotation: true,
  autoReload: true
});


const port = process.env.PORT;
server.listen(port, (err)=>{
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
app.use(  express.static( path.join(__dirname, 'public'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}) );
app.use( i18n.init );
app.use('/teachers', TRouter);
// app.use('/media', mediaRouter);
app.use('/', mainRouter);

app.use( (req, res, next)=> { next(createError(404)); });
app.use( (err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  if (err.status === 404) res.render('404');
  else res.render('error');
  return;
});

module.exports = app;
