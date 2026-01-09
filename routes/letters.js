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
    res.render('students/letters');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/pairs', (req, res)=>{
  try{
    res.render('activities/letters/pairs');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/haystack', (req, res)=>{
  try{
    res.render('activities/letters/haystack');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/alphabetical', (req, res)=>{
  try{
    res.render('activities/letters/alphabetical');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/write', (req, res)=>{
  try{
    res.render('activities/letters/write');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/SRS', (req, res)=>{
  try{
    // set cookie
    let cookie = req.body.ranks.join(',');
    console.log(cookie);
    res.cookie('lettersranks', cookie.toString(), {path: '/letters', maxAge: 252288000, encode: v => v});
    res.send('success');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
