const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());


router.get('/', (req, res)=>{
  try{
    res.render('students/abc');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/pairs', (req, res)=>{
  try{
    res.render('activities/abc/pairs');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/haystack', (req, res)=>{
  try{
    res.render('activities/abc/haystack');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/SRS', (req, res)=>{
  try{
    res.render('activities/abc/SRS');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/SRS', (req, res)=>{
  try{ // this could be used to update a database but for now it just
       // allows the cookie to be set in real time
    res.send('success');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/reset', (req, res)=>{
  try{
    res.clearCookie('ranks', {path: '/abc'});
    res.send('success');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

module.exports = router;
