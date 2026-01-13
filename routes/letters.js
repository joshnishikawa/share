const express = require('express');
const router = express.Router();


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


router.get('/penmanship', (req, res)=>{
  try{
    res.render('activities/letters/penmanship');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/SRS', (req, res)=>{
  try{
    res.render('activities/letters/SRS');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
