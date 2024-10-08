const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const abc = require('./abc.js');
const labs = require('./labs.js');
const creds = require('../../creds.js');
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);

router.use(bodyParser.urlencoded({extended: true}));
router.use('/abc', abc);
router.use('/labs', labs);

router.get('/test', (req, res)=>{
  try{
    res.render('tools/test');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

router.get('/', (req, res)=>{
  try{
    res.redirect('/abc');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/groups', (req, res)=>{
  try{
    res.render('students/groups');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/LT', (req, res)=>{
  try{
    res.render('students/LT', {LT_vocab});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/New_Horizons', (req, res)=>{ // Because you borked it dude!
  try{
    res.redirect('/NH');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/NH', async (req, res)=>{
  try{
    var colors = {
      "#ffa9a0" : ["page_8_9", "page_22_23"],   // red
      "#ddefb7" : ["page_10_11", "page_24_25"], // green
      "#cdaed2" : ["page_12_13", "page_34_35"], // purple
      "#ffd3b5" : ["page_14_15", "page_26_27"], // orange
      "#bfe0fa" : ["page_16_17", "page_28_29"], // blue
      "#c4bd9a" : ["page_18_19", "page_30_31"], // olive
      "#ffcbda" : ["page_20_21", "page_32_33"]  // pink
    }

    let [rows, schema] = await db.query(`SELECT id, page, theme, word 
                                         FROM vocabulary 
                                         WHERE book='NH'`);

    let NH_vocab = {};
    for (let row of rows){
      if ( !NH_vocab[row.page] ) NH_vocab[row.page] = {};
      if ( !NH_vocab[row.page][row.theme] ) NH_vocab[row.page][row.theme] = {};
      NH_vocab[row.page][row.theme][row.word] = row.id;
    }

    NH_vocab['+'] = {};
    for (let p in NH_vocab){
      for (let t in NH_vocab[p]){
        if (t.indexOf('+') > -1){ // try 'include'
          let plus = NH_vocab[p][t];
          delete NH_vocab[p][t];
          NH_vocab['+'][t] = plus;
        }
      }
    }


    res.render('students/NH', {NH_vocab, colors, teacher: false});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/slots', (req, res)=>{ 
  try{
    res.render('activities/slots');
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


router.get('/lp', (req, res)=>{ 
  try{
    res.render('tools/lp');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/books', (req, res)=>{
  try{
    let book = req.query.book ?? 'brainbox';
    let page = req.query.page ?? 'airport.png';

    fs.readdir( path.join(__dirname, `../public/image/books/${book}`), (err, pages)=>{
      if (err) throw err;
      res.render('tools/books', {book, pages, page});
    });
  }
  catch(err){ console.error(err); }
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


router.get('/speak_spell', (req, res)=>{
  try{
    res.render('activities/speak_spell');
  }
  catch
  (err){
    res.send(err);
    console.error(err);
  }
});


router.get('/vocablist', async (req, res)=>{
  try{
    // get array of words from vocabulary table
    let words = {};
    var rows, schema;
    var deck = req.query.deck;

    if (req.query.deck) { 
      [rows, schema] = await db.query(`SELECT word, meaning, image, audio 
                                 FROM vocabulary 
                                 WHERE id IN (?)`, 
                                 [deck]);
    }
    else { [rows, schema] = await db.query(`SELECT word, meaning, image, audio FROM vocabulary`);}

    for (let row of rows){
      words[row.word] = {meaning: row.meaning, image: row.image, audio: row.audio};
    }
    res.json(words);
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/:activity', async(req, res)=>{
  try{
    if ( !valid(req.params.activity, req.body) ) throw '404';

    let activity = req.params.activity;
    let params = req.body;
    let deck = params.deck;
    delete params.deck;
    let deckType = params.deckType;
    delete params.deckType;
    if (deckType != 'text'){ delete params.deckName; }
    
    if (deckType == "nolink"){ // expect deck to be an array of objects
      deck = JSON.parse(deck);
      console.log(deck);
      res.render(`activities/${activity}`, {deckType, deck, params: JSON.stringify(params)});
      return;
    }


    let link = '';
    let [rows, schema] = await db.query(`SELECT id FROM links 
                                         WHERE deckType=? 
                                         AND activity=? 
                                         AND deck= BINARY ? 
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
      [rows, schema] = await db.query(`SELECT * FROM vocabulary WHERE id IN (?)`, [ids]);
      // convert to array of objects
      deck = await rows.map( row => {
        return {id: row.id, word: row.word, meaning: row.meaning, image: row.image};
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
  if ( !["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell", "printcards"].includes(activity)) return false;
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
