const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const NH_vocab = require('../public/NH_vocab.js');

router.get('/pairs', (req, res)=>{
  try{
    res.render('sockets/pairs');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

module.exports = router;