const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const tagsRouter = require('./tags');
const NH_vocab = require('../public/NH_vocab.js');

// router.use('/tags', tagsRouter); // uncomment to update tags

router.get('/', (req, res)=>{
  try{
    res.redirect('/teachers/text');
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


router.get('/images', (req, res)=>{
  try{
    res.render('teachers/images');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/tools', (req, res)=>{
  try{
    fs.readdir( path.join(__dirname, '../public/image/diagrams'), (err, diagrams)=>{
      if (err) throw err;
      res.render('teachers/tools', {diagrams});
    });
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


router.get('/write', (req, res)=>{
  try{
    res.render('activities/write');
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


router.get('/diagram', (req, res)=>{
  try{
    let diagram = `/image/diagrams/${req.query.diagram}`;
    res.render('activities/diagram', {diagram});
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

module.exports = router;
