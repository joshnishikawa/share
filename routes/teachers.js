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
      "Orchid" : ["p4_5", "p14_15"],
      "PaleGreen" : ["p6_7", "p12_13", "p26_27", "p30_31"],
      "Gold" : ["p8_9", "p16_17", "p22_23"],
      "Pink" : ["p10_11", "p28_29"],
      "SkyBlue" : ["p18_19"],
      "Salmon" : ["p20_21", "p24_25"],
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
    res.render('activities/match');
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
