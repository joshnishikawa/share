const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const letters = require('./letters.js');
const things = require('./things.js');
const vocab = require('./vocab.js');
const tools = require('./tools.js');
const labs = require('./labs.js');
const creds = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
}
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);
const vocabulary = require('../public/vocabulary.js');
const NH_colors = {
  "#ffa9a0" : ["page_8_9", "page_22_23"],   // red
  "#ddefb7" : ["page_10_11", "page_24_25"], // green
  "#cdaed2" : ["page_12_13", "page_34_35"], // purple
  "#ffd3b5" : ["page_14_15", "page_26_27"], // orange
  "#bfe0fa" : ["page_16_17", "page_28_29"], // blue
  "#c4bd9a" : ["page_18_19", "page_30_31"], // olive
  "#ffcbda" : ["page_20_21", "page_32_33"]  // pink
}

router.use(bodyParser.urlencoded({extended: true}));
router.use('/letters', letters);
router.use('/things', things);
router.use('/vocab', vocab);
router.use('/tools', tools);
router.use('/labs', labs);


async function getNHVocab(){
  let rows = vocabulary.filter(item => item.book === 'NH');
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
  return NH_vocab;
}


router.get('/', (req, res)=>{
  try{
    res.redirect('/abc');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/LT1', (req, res)=>{
  try{
    res.sendFile(path.join(__dirname, '../public/LT1/index.html'));
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/LT2', (req, res)=>{
  try{
    res.sendFile(path.join(__dirname, '../public/LT2/index.html'));
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/api/any-vocab', async (req, res)=>{
  try{
    // get array of words from vocabulary table
    let words = {};
    var rows;
    var deck = req.query.deck ? JSON.parse(req.query.deck) : [];
    if (req.query.deck) {
      rows = vocabulary.filter(item => deck.includes(item.id));
    }
    else {
      // parse everything from vocabulary table
      rows = vocabulary;
    }

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


// API endpoint to get NH vocabulary and colors data
router.get('/api/nh-vocab', async (req, res) => {
  try {
    let NH_vocab = await getNHVocab();

    let translations = {};
    for (let p in NH_vocab){
      for (let t in NH_vocab[p]){
        let translatedTheme = req.__(t);
        translations[t] = translatedTheme;
      }
    }

    res.json({ NH_vocab, NH_colors, translations });
  }
  catch(err){
    res.status(500).json({ error: err.message });
    console.error(err);
  }
});


router.get('/NH', async (req, res)=>{
  try{
    let NH_vocab = await getNHVocab();
    res.render('students/NH', {NH_vocab, NH_colors, teacher: false});
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


router.get('/shapes', (req, res)=>{ // moved to things
  try{
    res.redirect('/things/shapes');
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


router.get('/groups', (req, res)=>{
  try{
    res.render('students/groups');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


// Redirects for edprecated routes /////////////////////////////////////////////

router.get('/New_Horizons', (req, res)=>{ // Because you borked it dude!
  try{
    res.redirect('/NH');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/abc', (req, res)=>{
  try{
    res.redirect('/letters');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/:activity', async(req, res)=>{
  try{
    if ( ["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell", "penmanship", "printcards", "double", "write"].includes(req.params.activity) ){
      res.redirect(`/vocab/${req.params.activity}`);
    }
    else if ( ["richtext", "names", "lp", "interview"].includes(req.params.activity) ){
      res.redirect(`/tools/${req.params.activity}`);
    }
    else{
      throw '404';
    }
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/:activity/:id', async(req, res)=>{
  try{
    console.log(req.params.activity);
    if ( ["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell", "penmanship", "printcards", "double", "write"].includes(req.params.activity) ){
      res.redirect(`vocab/${req.params.activity}/${req.params.id}`);
    }
    else {
      console.log('404 redirect failed for activity:', req.params.activity);
      throw '404';
    }
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
