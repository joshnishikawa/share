const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res)=>{
  try{
    res.render('students/students');
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

module.exports = router;
