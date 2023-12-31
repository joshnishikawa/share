const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const tagsRouter = require('./tags');
const NH_vocab = require('../public/NH_vocab.js');
const LT_vocab = require('../public/LT_vocab.js');

// router.use('/tags', tagsRouter); // uncomment to update tags


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


router.get('/Lets_Try', (req, res)=>{
  try{
    var colors = {
      "#c5b3e6" : ["fruit", "life", "time"],
      "#a3cfbb" : ["vegetable", "body", "supplies"],
      "#ffe69c" : ["food", "play", "town"],
      "#f1aeb5" : ["colors", "weather", "school"],
      "#9ec5fe" : ["shapes", "clothes", "daily"],
      "#fecba1" : ["adjectives", "weekdays"],
      }

    res.render('teachers/LT', {LT_vocab, colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/New_Horizons', (req, res)=>{
  try{
    var colors = {
      "#c5b3e6" : ["page_4_5", "page_14_15"],
      "#a3cfbb" : ["page_6_7", "page_12_13", "page_26_27", "page_30_31"],
      "#ffe69c" : ["page_8_9", "page_16_17", "page_22_23"],
      "#f1aeb5" : ["page_10_11", "page_28_29"],
      "#9ec5fe" : ["page_18_19"],
      "#fecba1" : ["page_20_21", "page_24_25"],
      }

    res.render('teachers/NH', {NH_vocab: NH_vocab, colors: colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/text', (req, res)=>{
  try{
    res.render('teachers/text');
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


router.get('/richtext', (req, res)=>{ 
  try{
    res.render('activities/richtext');
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


router.get('/flash', (req, res)=>{
  try{
    res.render('activities/flash');
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
      res.render('activities/brainbox', {brainbox, selected});
    });
  }
  catch(err){ console.error(err); }
});


router.get('/match', (req, res)=>{
  try{
    res.render('activities/match', {NH_vocab: NH_vocab});
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


router.get('/bingo', (req, res)=>{
  try{
    res.render('activities/bingo');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/recall', (req, res)=>{
  try{
    res.render('activities/recall'); }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/reveal', (req, res)=>{
  try{
    res.render('activities/reveal');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/test', (req, res)=>{
  try{
    res.render('teachers/test');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
