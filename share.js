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

FYshuffle = (myArray) => {
  let l = myArray.length;
  if (l == 2){
    if ( Math.round( Math.random() ) ){ // flip a coin, if heads...
      myArray.unshift( myArray.pop() ); // reverse items
    }
  }
  else{ // do a proper Fisher Yates shuffle for more than 2 items
    for (let i = l ; i > 0; i) {
      var j = Math.floor(Math.random() * i--);
      var k = myArray[i];
      myArray[i] = myArray[j];
      myArray[j] = k;
    }
  }
  return myArray;
}

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
app.use('/teachers', teachersRouter);
app.use('/students', studentsRouter);

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
