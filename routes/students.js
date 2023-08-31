const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const abc = require('./abc.js');
const New_Horizons = require('./New_Horizons.js');

router.use('/abc', abc);
router.use('/New_Horizons', New_Horizons);


router.get('/', (req, res)=>{
  try{
    res.redirect('/abc');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/wordle', (req, res)=>{
  try{
    res.render('activities/wordle');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/type', (req, res)=>{
  try{
    res.render('activities/type');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/sample', (req, res)=>{
  try{
    res.render('sample');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
