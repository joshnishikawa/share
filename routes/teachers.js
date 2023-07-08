const express = require('express');
const router = express.Router();
const items = require('../public/image/svg/_items.json');
const tags = require('../public/image/svg/_tags.json');
const fs = require('fs');
const path = require('path');

router.get('/', (req, res)=>{
  try{
    res.redirect('teachers/vocab');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/vocab', (req, res)=>{
  try{
    res.render('teachers/vocab');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/New_Horizons', (req, res)=>{
  try{
    res.render('teachers/NH');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/images', (req, res)=>{
  try{
    res.render('teachers/images', {items, tags});
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
    res.render('type');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/write', (req, res)=>{
  try{
    res.render('write');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/flash', (req, res)=>{
  try{
    res.render('flash');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/diagram', (req, res)=>{
  try{
    let diagram = `/image/diagrams/${req.query.diagram}`;
    res.render('diagram', {diagram});
  }
  catch(err){ console.error(err); }
});


router.get('/match', (req, res)=>{
  try{
    res.render('match');
  }
  catch(err){ 
    res.send(err);
    console.error(err);
  }
});


router.get('/wordle', (req, res)=>{
  try{
    res.render('wordle');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/bingo', (req, res)=>{
  try{
    res.render('bingo');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/recall', (req, res)=>{
  try{
    res.render('recall'); }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/reveal', (req, res)=>{
  try{
    res.render('reveal');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

module.exports = router;
