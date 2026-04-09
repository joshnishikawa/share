const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const letters = require('./letters.js');
const things = require('./things.js');
const vocab = require('./vocab.js');
const tools = require('./tools.js');
const labs = require('./labs.js');
const multiplayer = require('./multiplayer');
const db = require('../config/db.js');
const vocabulary = require('../public/vocabulary.js');
const { NH_colors, getNHVocab } = require('../config/nh_helpers.js');

router.use('/letters', letters);
router.use('/things', things);
router.use('/vocab', vocab);
router.use('/tools', tools);
router.use('/labs', labs);
router.use('/multiplayer', multiplayer);


router.get('/', (req, res)=>{
  try{
    res.redirect('/abc');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/LT1', (req, res)=>{
  try{
    res.sendFile(path.join(__dirname, '../public/LT1/index.html'));
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/LT2', (req, res)=>{
  try{
    res.sendFile(path.join(__dirname, '../public/LT2/index.html'));
  }
  catch(err){
    res.status(500).render('error');
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
    res.status(500).render('error');
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
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/slots', (req, res)=>{ 
  try{
    res.render('activities/slots');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/interview', (req, res)=>{
  try{
    const validBooks = ['brainbox', 'honto1', 'honto2', 'honto3'];
    let book = validBooks.includes(req.query.book) ? req.query.book : 'brainbox';
    let page = req.query.page ?? 'airport.png';

    fs.readdir( path.join(__dirname, `../public/image/interview/${book}`), (err, pages)=>{
      if (err) throw err;
      res.render('activities/interview', {book, pages, page});
    });
  }
  catch(err){ console.error(err); }
});


router.get('/shapes', (req, res)=>{ // moved to things
  try{
    res.redirect('/things/shapes');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/speech', (req, res)=>{
  try{
    res.render('activities/speech');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/speak_spell', (req, res)=>{
  try{
    res.render('activities/speak_spell');
  }
  catch
  (err){
    res.status(500).render('error');
    console.error(err);
  }
});


// Redirects for edprecated routes /////////////////////////////////////////////

router.get('/New_Horizons', (req, res)=>{ // Because you borked it dude!
  try{
    res.redirect('/NH');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/abc', (req, res)=>{
  try{
    res.redirect('/letters');
  }
  catch(err){
    res.status(500).render('error');
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
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/:activity/:id', async(req, res)=>{
  try{
    console.log(req.params.activity);
    if ( ["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell", "penmanship", "printcards", "double", "write"].includes(req.params.activity) ){
      res.redirect(`/vocab/${req.params.activity}/${req.params.id}`);
    }
    else {
      console.log('404 redirect failed for activity:', req.params.activity);
      throw '404';
    }
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


module.exports = router;
