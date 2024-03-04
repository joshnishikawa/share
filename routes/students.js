const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const abc = require('./abc.js');
const NH = require('./NH.js');

const creds = require('../../creds.js');
const mysql = require('mysql2/promise');
const { validateHeaderName } = require('http');
const db = mysql.createPool(creds);

router.use('/abc', abc);
router.use('/NH', NH);
router.use('/sockets', require('./sockets.js'));

router.get('/', (req, res)=>{
  try{
    res.redirect('/abc');
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


router.get('/speech', (req, res)=>{
  try{
    res.render('activities/speech');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


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


router.get('/brainbox', (req, res)=>{
  try{
    let selected = `/image/brainbox/${req.query.brainbox}`;

    fs.readdir( path.join(__dirname, '../public/image/brainbox'), (err, brainbox)=>{
      if (err) throw err;
      res.render('tools/brainbox', {brainbox, selected});
    });
  }
  catch(err){ console.error(err); }
});


router.get('/:activity', async(req, res)=>{
  try{
    if ( !valid(req.params.activity, req.query) ) throw '404';

    let activity = req.params.activity;
    let params = req.query;
    let deckType = params.deckType;
    delete params.deckType;
    let link = '';
    let [rows, schema] = await db.query(`SELECT id FROM links
                                         WHERE deckType=?
                                         AND activity=?
                                         AND params=?`, 
                                        [deckType, activity, JSON.stringify(params)]);
    if (rows.length > 0) {
      link = rows[0].id;
    }
    else {
      let newrow = await db.query(`INSERT INTO links (deckType, activity, params) 
                                   VALUES (?, ?, ?)`, 
                                  [deckType, activity, JSON.stringify(params)]);
      link = newrow[0].insertId;
    }

    res.redirect(`${activity}/${link}`);
  }
  catch (err){
    if (err == '404') res.render('404');
    else res.send(err);
    console.error(err);
  }
});


router.get('/:activity/:id', async (req, res)=>{
  try{
    let activity = req.params.activity;
    let id = req.params.id;

    var [rows, schema] = await db.query(`SELECT * FROM links
                                         WHERE activity = ?
                                         AND id = ?`, 
                                        [activity, id]);
    if (rows.length == 0) throw '404';
    let deckType = rows[0].deckType;
    let params = rows[0].params;
    res.render(`activities/${req.params.activity}`, {deckType, params});
  }
  catch(err ){
    if (err == '404') res.render('404');
    else res.send(err);
    console.error(err);
  }
});


function valid(activity, params){
  if ( !["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell"].includes(activity)) return false;
  if ( !["images", "text", "LT", "NH"].includes(params.deckType) ) return false;
  if ( !params.deck ) return false;
  try{
    JSON.parse(params.deck);
  }
  catch(err){
    return false;
  }
  return true;
}


module.exports = router;
