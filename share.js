//"use strict";
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const rooms = [
  "cat", "dog", "sun", "cup", "pen", "hat", "red", "bus", "bed", "map", "fox",
  "bird", "fish", "ball", "book", "tree", "rain", "moon", "hand", "time", "sock",
  "star", "wind", "desk", "lamp", "door", "bell", "cake", "duck", "frog",
  "milk", "road", "bear", "coat", "lady", "baby", "soap", "seed",
  "ship", "ring", "nose", "shoe", "leaf", "hair", "head", "bath",
  "comb", "yarn", "flag", "doll", "van", "key", "jam", "fun", "zip", "box", "top",
  "hot", "bug", "dig", "ear", "run", "toy", "wet"];

var publicRooms = ["bug", "dig"]; // array of rooms in use
var privateRooms = []; // array of teacher-created rooms in use

var available = rooms.filter(x => !publicRooms.includes(x) && !privateRooms.includes(x));

// select a random word from the available array
var word = available[Math.floor(Math.random() * available.length)];
publicRooms.push(word); // add the word to the rooms array


io.sockets.on('connection', socket =>{
  console.log('io connection');

  socket.on('join', async function(data){ // data = {room: 'room1'}
    socket.join('room1');
    console.log('socket joined room1');

    const sockets = await io.in(data.room).fetchSockets();
    let socketIds = sockets.map(s => s.id);
    console.log('socketIds: ', socketIds);

  });

  socket.on('selectimg', function(data){
    // emit to all sockets in the room except the sender
    socket.broadcast.to(data.room).emit('selectedimg', data.word);
  });

  socket.on('selectword', async function(data){
    // emit to all sockets in the room except the sender
    socket.broadcast.to(data.room).emit('selectedword', data.word);
    console.log('selectedword: ', data.word);
  });
});

io.on('disconnect', function(){
  console.log('io disconnect');
});
io.on('error', function(){
  console.log('io error');
});

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
app.use(  express.static( path.join(__dirname, 'public') )  );
app.use( i18n.init );
app.use('/teachers', TRouter);
app.use('/media', mediaRouter);
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
