//"use strict";
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const socket_io = require('socket.io')(server);
const groups = require('./sockets/_GROUPS.js');
groups(socket_io);

const createError = require('http-errors');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2/promise');
const passport = require('passport');

const mainRouter = require('./routes/_MAIN.js');
const TRouter = require('./routes/teachers');
const mediaRouter = require('./routes/media');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');

const { I18n } = require('i18n');
const i18n = new I18n({
  locales: ['en', 'ja'],
  directory: path.join(__dirname, 'locales'),
  retryInDefaultLocale: true,
  objectNotation: true,
  autoReload: true
});

// Session store configuration
const sessionStore = new MySQLStore({
  host: process.env.host || 'localhost',
  user: process.env.user || 'root',
  password: process.env.password || '',
  database: process.env.database || 'EJ',
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

// Passport configuration
require('./config/passport')(passport);


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
app.use( express.json({ limit: '50mb' }) );
app.use( express.urlencoded({ extended: false }) );
app.use(  express.static( path.join(__dirname, 'public'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}) );

// Session configuration
app.use(session({
  key: 'session_cookie',
  secret: process.env.SESSION_SECRET || 'dev_secret_change_in_production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Make user available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use( i18n.init );
app.use('/auth', authRouter);
app.use('/api', apiRouter);
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
