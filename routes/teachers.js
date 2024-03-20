const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const creds = require('../../creds.js');
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);
const text_decks = require('../public/javascripts/text_decks.json'); // FIXME: Deprecate this in 2025


router.get('/', (req, res)=>{
  try{
    res.redirect('/teachers/images');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/images', (req, res)=>{
  try{
    res.render('teachers/images');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/LT', async (req, res)=>{
  try{
    var colors = {
      "#c5b3e6" : ["fruit", "life", "time"],
      "#a3cfbb" : ["vegetable", "body", "supplies"],
      "#ffe69c" : ["food", "play", "town"],
      "#f1aeb5" : ["colors", "weather", "school"],
      "#9ec5fe" : ["shapes", "clothes", "daily"],
      "#fecba1" : ["adjectives", "weekdays"],
      }

    let [rows, schema] = await db.query(`SELECT id, page, theme, word 
                                         FROM vocab 
                                         WHERE book='LT'`);
    let LT_vocab = {};
    for (let row of rows){
      if ( !LT_vocab[row.theme] ) LT_vocab[row.theme] = {};
      LT_vocab[row.theme][row.word] = row.id;
    }

    res.render('teachers/LT', {LT_vocab, colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/NH', async(req, res)=>{ // FIXME: There needs to be a single route to render this menu for students or teachers.
  try{
    var colors = {
      "#c5b3e6" : ["page_4_5", "page_14_15"],
      "#a3cfbb" : ["page_6_7", "page_12_13", "page_26_27", "page_30_31"],
      "#ffe69c" : ["page_8_9", "page_16_17", "page_22_23"],
      "#f1aeb5" : ["page_10_11", "page_28_29"],
      "#9ec5fe" : ["page_18_19"],
      "#fecba1" : ["page_20_21", "page_24_25"],
      }

    let [rows, schema] = await db.query(`SELECT id, page, theme, word 
                                         FROM vocab 
                                         WHERE book='NH'`);
    let NH_vocab = {};
    for (let row of rows){
      if ( !NH_vocab[row.page] ) NH_vocab[row.page] = {};
      if ( !NH_vocab[row.page][row.theme] ) NH_vocab[row.page][row.theme] = {};
      NH_vocab[row.page][row.theme][row.word] = row.id;
    }

    res.render('teachers/NH', {NH_vocab, colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/text', (req, res)=>{
  try{
    res.render('teachers/text', {text_decks});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/tools', (req, res)=>{
  try{
    fs.readdir( path.join(__dirname, '../public/image/brainbox'), (err, brainbox)=>{
      if (err) throw err;
      res.render('teachers/tools', {brainbox});
    });
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
