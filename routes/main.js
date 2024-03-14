const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const abc = require('./abc.js');
const creds = require('../../creds.js');
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);

// const { validateHeaderName } = require('http');

// var Dictionary = require('japaneasy');
// var dict = new Dictionary();

router.use('/abc', abc);
router.use('/sockets', require('./sockets.js'));


router.get('/', (req, res)=>{
  try{
    res.redirect('/abc');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/LT', (req, res)=>{
  try{
    var colors = {
      "#c5b3e6" : ["fruit", "life", "time"],
      "#a3cfbb" : ["vegetable", "body", "supplies"],
      "#ffe69c" : ["food", "play", "town"],
      "#f1aeb5" : ["colors", "weather", "school"],
      "#9ec5fe" : ["shapes", "clothes", "daily"],
      "#fecba1" : ["adjectives", "weekdays"],
      }
    
    res.render('students/LT', {LT_vocab, colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/select_NH', async (req, res)=>{
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
    res.render('students/NH', {NH_vocab, colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/speak_spell', (req, res)=>{
  try{
    res.render('activities/speak_spell');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/japaneasy', (req, res)=>{
  try{
    dict('アバウト').then(function(result){
      console.log(result);
      res.send(result);
    });
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/shapes', (req, res)=>{
  try{
    res.render('activities/shapes');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/speech', (req, res)=>{
  try{
    res.render('activities/speech');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/richtext', (req, res)=>{ 
  try{
    res.render('tools/richtext');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/names', (req, res)=>{ 
  try{
    res.render('tools/names');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/brainbox', (req, res)=>{
  try{
    let selected = `/image/brainbox/${req.query.brainbox}`;

    fs.readdir( path.join(__dirname, '../public/image/brainbox'), (err, brainbox)=>{
      if (err) throw err;
      res.render('tools/brainbox', {brainbox, selected});
    });
  }
  catch(err){ console.error(err); }
});


router.get('/:activity', async(req, res)=>{
  try{
    if ( !valid(req.params.activity, req.query) ) throw '404';

    let activity = req.params.activity;
    let params = req.query;
    let deck = params.deck;
    delete params.deck;
    let deckType = params.deckType;
    delete params.deckType;

    let link = '';
    let [rows, schema] = await db.query(`SELECT id FROM links 
                                         WHERE deckType=? 
                                         AND activity=? 
                                         AND deck=? 
                                         AND params=?`, 
                                        [deckType, 
                                         activity,
                                         deck, 
                                         JSON.stringify(params)]);
    if (rows.length > 0) {
      link = rows[0].id;
    }
    else {
      let newrow = await db.query(`INSERT INTO links (deckType, activity, deck, params) 
                                   VALUES (?, ?, ?, ?)`, 
                                  [deckType, 
                                   activity, 
                                   deck,
                                   JSON.stringify(params)]);
      link = newrow[0].insertId;
    }

    res.redirect(`${activity}/${link}`);
  }
  catch (err){
    if (err == '404') res.render('404');
    else res.send(err);
    console.error(err);
  }
});


router.get('/:activity/:id', async (req, res)=>{
  try{
    let activity = req.params.activity;
    let id = req.params.id;
    let deck = [];

    var [rows, schema] = await db.query(`SELECT * FROM links
                                         WHERE activity = ?
                                         AND id = ?`, 
                                        [activity, id]);
    if (rows.length == 0) throw '404';
    let params = rows[0].params;
    let deckType = rows[0].deckType;

    if (deckType == "text"){
      deck = JSON.parse(rows[0].deck);
    }
    else if (deckType == "images"){
      deck = JSON.parse(rows[0].deck);
    }
    else{
      let ids = JSON.parse(rows[0].deck);
      [rows, schema] = await db.query(`SELECT * FROM vocab WHERE id IN (?)`, [ids]);
      // convert to array of objects
      deck = await rows.map( row => {
        return {word: row.word, meaning: row.meaning, image: row.image};
      });
    }

    res.render(`activities/${req.params.activity}`, {deckType, deck, params});
  }
  catch(err ){
    if (err == '404') res.render('404');
    else res.send(err);
    console.error(err);
  }
});


function valid(activity, params){
  if ( !["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell"].includes(activity)) return false;
  if ( !params.deck ) return false;
  try{
    JSON.parse(params.deck);
  }
  catch(err){
    return false;
  }
  return true;
}


module.exports = router;
