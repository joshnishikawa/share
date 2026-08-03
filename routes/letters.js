const express = require('express');
const router = express.Router();


router.get('/', (req, res, next)=>{
  try{
    res.render('students/letters');
  }
  catch(err){
    next(err);
  }
});


router.get('/pairs', (req, res, next)=>{
  try{
    res.render('activities/letters/pairs');
  }
  catch(err){
    next(err);
  }
});


router.get('/haystack', (req, res, next)=>{
  try{
    res.render('activities/letters/haystack');
  }
  catch(err){
    next(err);
  }
});


router.get('/alphabetical', (req, res, next)=>{
  try{
    res.render('activities/letters/alphabetical');
  }
  catch(err){
    next(err);
  }
});


router.get('/penmanship', (req, res, next)=>{
  try{
    res.render('activities/letters/penmanship');
  }
  catch(err){
    next(err);
  }
});


router.get('/SRS_abc', (req, res, next)=>{
  try{
    res.render('activities/letters/SRS_abc');
  }
  catch(err){
    next(err);
  }
});


router.get('/SRS_bl', (req, res, next)=>{
  try{
    res.render('activities/letters/SRS_bl');
  }
  catch(err){
    next(err);
  }
});


router.get('/SRS_3L', (req, res, next)=>{
  try{
    res.render('activities/letters/SRS_3L');
  }
  catch(err){
    next(err);
  }
});


router.get('/SRS_h', (req, res, next)=>{
  try{
    res.render('activities/letters/SRS_h');
  }
  catch(err){
    next(err);
  }
});


router.get('/SRS_e', (req, res, next)=>{
  try{
    res.render('activities/letters/SRS_e');
  }
  catch(err){
    next(err);
  }
});


module.exports = router;
