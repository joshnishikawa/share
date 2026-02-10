const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/richtext', (req, res)=>{ 
  try{
    res.render('tools/richtext');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/names', (req, res)=>{ 
  try{
    res.render('tools/names');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/lp', (req, res)=>{ 
  try{
    res.render('tools/lp');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/interview', (req, res)=>{
  try{
    let book = req.query.book ?? 'brainbox';
    let page = req.query.page ?? 'airport.png';

    fs.readdir( path.join(__dirname, `../public/image/interview/${book}`), (err, pages)=>{
      if (err) throw err;
      res.render('tools/interview', {book, pages, page});
    });
  }
  catch(err){ console.error(err); }
});


module.exports = router;