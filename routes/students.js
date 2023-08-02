const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const NH_vocab = require('../public/NH_vocab.js');

router.get('/', (req, res)=>{
  try{
    var colors = {
      "#c5b3e6" : ["page_4_5", "page_14_15"],
      "#a3cfbb" : ["page_6_7", "page_12_13", "page_26_27", "page_30_31"],
      "#ffe69c" : ["page_8_9", "page_16_17", "page_22_23"],
      "#f1aeb5" : ["page_10_11", "page_28_29"],
      "#9ec5fe" : ["page_18_19"],
      "#fecba1" : ["page_20_21", "page_24_25"],
      }
    
    res.render('students/students', {NH_vocab: NH_vocab, colors: colors});
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


router.get('/haystack', (req, res)=>{
  try{
    res.render('activities/abc/haystack');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

module.exports = router;
