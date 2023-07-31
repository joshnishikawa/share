const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const NH_vocab = require('../public/NH_vocab.js');

router.get('/', (req, res)=>{
  try{
    var colors = {
      "Orchid" : ["p4_5", "p14_15"],
      "PaleGreen" : ["p6_7", "p12_13", "p26_27", "p30_31"],
      "Gold" : ["p8_9", "p16_17", "p22_23"],
      "Pink" : ["p10_11", "p28_29"],
      "SkyBlue" : ["p18_19"],
      "Salmon" : ["p20_21", "p24_25"],
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

module.exports = router;
