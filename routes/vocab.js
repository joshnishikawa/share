const express = require('express');
const router = express.Router();
const vocabulary = require('../public/vocabulary.js');
const creds = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
}
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);


router.post('/:activity', async(req, res)=>{
  try{
    if ( !valid(req.params.activity, req.body) ) throw '404';
    let activity = req.params.activity;

    let params = req.body;
    let deck = params.deck;
    delete params.deck;
    let deckType = params.deckType;
    delete params.deckType;
    if (deckType != 'text'){ delete params.deckName; }

    for (let p in params){ // use only last value of any repeated params
      params[p] = Array.isArray(params[p]) ? params[p][params[p].length - 1] : params[p];
    }

    let querystring = new URLSearchParams(params).toString();

    if (deckType == "nolink"){ // expect deck to be an array of objects
      deck = JSON.parse(deck);
      res.render(`activities/vocab/${activity}`, {deckType, deck, query: params});
      return;
    }

    let link = '';
    let [rows, schema] = await db.query(`SELECT id FROM links 
                                         WHERE deckType=? 
                                         AND activity=? 
                                         AND deck= BINARY ?`, 
                                        [deckType, 
                                         activity,
                                         deck]);
    if (rows.length > 0) {
      link = rows[0].id;
    }
    else {
      let newrow = await db.query(`INSERT INTO links (deckType, activity, deck) 
                                   VALUES (?, ?, ?)`, 
                                  [deckType, activity, deck]);
      link = newrow[0].insertId;
    }
    res.redirect(`/vocab/${activity}/${link}?${querystring}`);
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
    let query = req.query;
    let deck = [];

    var [rows, schema] = await db.query(`SELECT * FROM links
                                         WHERE activity = ?
                                         AND id = ?`, 
                                        [activity, id]);
    if (rows.length == 0) throw '404';
    let deckType = rows[0].deckType;

    if (["text", "images"].includes(deckType)){
      deck = JSON.parse(rows[0].deck);
    }
    else{
      let ids = JSON.parse(rows[0].deck);
      rows = vocabulary.filter(item => ids.includes(item.id));
      // convert to array of objects
      deck = await rows.map( row => {
        return {id: row.id, word: row.word, meaning: row.meaning, image: row.image};
      });
      // put deck in the right order
      deck = deck.sort( (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }

    res.render(`activities/vocab/${req.params.activity}`, {deckType, deck, query});
  }
  catch(err ){
    if (err == '404') res.render('404');
    else res.send(err);
    console.error(err);
  }
});


function valid(activity, params){
  if ( !["bingo", "flash", "grid", "match", "recall", "reveal", "type", "spell", "penmanship", "printcards", "double", "write"].includes(activity)) return false;
  if ( !params.deck ) {
    return false;
  }
  try{
    JSON.parse(params.deck);
  }
  catch(err){
    return false;
  }
  return true;
}


module.exports = router;