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


router.get('/alphabetical', (req, res)=>{
  try{
    res.render('activities/abc/alphabetical');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/write', (req, res)=>{
  try{
    res.render('activities/abc/write');
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
    res.cookie('abcranks', cookie.toString(), {path: '/abc', maxAge: 252288000, encode: v => v});
    res.send('success');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/dressup/:type', (req, res)=>{
  try{

    res.render(`activities/abc/dressup_${req.params.type}.ejs`);
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
