const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/richtext', (req, res)=>{ 
  try{
    res.render('tools/richtext');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/names', (req, res)=>{ 
  try{
    res.render('tools/names');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


router.get('/lp', (req, res)=>{ 
  try{
    res.render('tools/lp');
  }
  catch(err){
    res.status(500).render('error');
    console.error(err);
  }
});


module.exports = router;