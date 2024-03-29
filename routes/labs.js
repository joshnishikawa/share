var Dictionary = require('japaneasy');
var dict = new Dictionary();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');


router.get('/yearinreview', (req, res)=>{
  try{
    res.render('labs/yearinreview');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/pronunciation', (req, res)=>{
  try{
    res.render('labs/pronunciation');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/pairs', (req, res)=>{
  try{
    res.render('sockets/pairs');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/speak_spell', (req, res)=>{
  try{
    res.render('labs/speak_spell');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/japaneasy', (req, res)=>{
  try{
    dict('アバウト').then(function(result){
      res.render('labs/japaneasy', {result});
    });
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/shapes', (req, res)=>{
  try{
    res.render('labs/shapes');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/speech', (req, res)=>{
  try{
    res.render('labs/speech');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});




module.exports = router;