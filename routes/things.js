const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
  try{
    res.render('students/things');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/shapes', (req, res)=>{
  try{
    res.render('activities/things/shapes');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/supplies', (req, res)=>{
  try{
    res.render('activities/things/supplies');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

router.get('/room', (req, res)=>{
  try{
    res.render('activities/things/room');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/dressup/:type', (req, res)=>{
  try{

    res.render(`activities/things/dressup_${req.params.type}.ejs`);
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
