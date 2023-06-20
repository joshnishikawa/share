// THIS ROUTE SHOULD BE AVAILABLE TO ANYONE, EVEN IF NOT LOGGED IN.

const express = require('express');
const router = express.Router();
const decks = require('../public/SHARE_DECKS.js');
const items = require('../public/image/svg/items.json');
const tags = require('../public/image/svg/tags.json');
const fs = require('fs');
const path = require('path');


////////////////////////////////////////////////////////////////////////////////
router.get('/', (req, res)=>{
  try{
    fs.readdir( path.join(__dirname, '../public/image/diagrams'), (err, diagrams)=>{
      if (err) throw err;
      res.render('menu/main', {decks, diagrams, items, tags});
    });
  }catch(err){
    res.send(err);
    console.error(err);
  }
});


// TYPE ////////////////////////////////////////////////////////////////////////
router.get('/type', (req, res)=>{ 
  try{
    res.render('type', {session: req.session});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


// WRITE ///////////////////////////////////////////////////////////////////////
router.get('/write', (req, res)=>{
  try{
    res.render('write', {session: req.session});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


// FLASH ///////////////////////////////////////////////////////////////////////
router.get('/flash', (req, res)=>{
  try{
    var deck = [];

    if (req.query.deck == 'colors'){                                            //TODO: this could be applied to any set of pictures too.
      for (let i of decks[req.query.deck]){
        deck.push(
          `<div class="border shadow color ${i}" 
                style="margin-top:10vh;height:50vh;width:50vw;">&nbsp;</div>`);
      }
    }
    else{
      deck = decks[req.query.deck];
    }

    res.render('flash', {deck: JSON.stringify(deck), 
                                        deckName: req.query.deck, 
                                        session: req.session});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


// DIAGRAMS ////////////////////////////////////////////////////////////////////
router.get('/diagram', (req, res)=>{
  try{
    let diagram = `/image/diagrams/${req.query.diagram}`;
    res.render('diagram', {session: req.session, diagram});
  }
  catch(err){ console.error(err); }
});


// MATCH ///////////////////////////////////////////////////////////////////////
router.get('/match', (req, res)=>{
  try{
    let deck = req.query.deck;
    let backs = req.query.back;
    var cards = [];
    var backContent = [];
    var backClass = [];
    
    switch(deck){
      case 'list':
        let list = JSON.parse(req.query.list);
        for (let i = 0; i < list.length; i++){
          cards.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${list[i]}.svg">`);
          cards.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${list[i]}.svg">`);
        }
        break;

      case '1~4':
        cards = [1,2,3,4,1,2,3,4];
        break;

      case '5~10':
        cards = [5,6,7,8,9,10,5,6,7,8,9,10];
        break;

      case '11~16':
        cards = [11,12,13,14,15,16,11,12,13,14,15,16];
        break;

      case 'animals 1':
        for (let i = 0; i < 10; i++){
          cards.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${decks.animals[i]}.svg">`);
          cards.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${decks.animals[i]}.svg">`);
        }
        break;

      case 'animals 2':
        for (let i = 10; i < 20; i++){
          cards.push(`<img class="img-flash mx-auto d-block" src="/image/svg/${decks.animals[i]}.svg">`);
          cards.push(`<img class="img-flash mx-auto d-block" src="/image/svg/${decks.animals[i]}.svg">`);
        }
        break;

      case 'letters 1':
        for (let i = 0; i < 10; i++){
          cards.push(decks.lower_case_mix[i]);
          cards.push(decks.lower_case_mix[i]);
        }
        break;

      case 'letters 2':
        for (let i = 10; i < 20; i++){
          cards.push(decks.lower_case_mix[i]);
          cards.push(decks.lower_case_mix[i]);
        }
        break;

      case 'shapes':
        cards = decks.shapes.concat(decks.shapes);
        break;

      case 'weekdays':
        cards = decks.weekdays.concat(decks.weekdays);
        break;

      default:
        throw 'ERROR: invalid deck type.'
    }

    var len = cards.length;

    switch(backs){
      case 'colors':
        if (len > decks.colors.length) throw 'ERROR: not enough colors for this deck.'
        else backClass = FYshuffle( decks.colors.slice(0, len) );
        break;

      case 'colorsNumbers':
        console.log(decks.colors.length);
        console.log(len);
        if (len > decks.colors.length * 2) throw 'ERROR: not enough colors for this deck.'
        let nums = [];
        for (let i = 0; i < len / 2; i++){
          nums.push(i);
        }

        nums = FYshuffle(nums);
        backContent = nums.concat( FYshuffle(nums) );

        var colors = decks.colors.slice(0, len / 2);
        for (let i = 0; i < colors.length; i++){
          colors[i] += 'Text alert-primary';//use .redText class instead of .red
          backClass.push(colors[i]);
          backClass.push(colors[i]);
        }
        parallelShuffle(backClass, backContent);
        break;

      case 'colorsShapes':
        var shapes = FYshuffle(decks.shapes.slice(0, len / 2));
        backContent = shapes.concat( FYshuffle(shapes) );
      
        var colors = decks.colors.slice(0, len / 2);
        for (let i = 0; i < colors.length; i++){
          colors[i] += 'Text alert-primary'; // use .redText class instead of .red
          backClass.push(colors[i]);
          backClass.push(colors[i]);
        }
        break;

      case 'animals':
        for (let i = 0; i < len; i++){
          backContent.push(`<img class="img-flash" src="/image/svg/${decks.animals[i]}.svg">`);
          backContent.push(`<img class="img-flash" src="/image/svg/${decks.animals[i + 10]}.svg">`);
          backClass.push('alert-primary');
          backClass.push('alert-primary');
        }
        break;

      case 'objects':
        for (let i = 0; i < len; i++){
          backContent.push(`<img class="img-flash" src="/image/svg/${decks.vocab[i]}.svg">`);
          backClass.push('alert-primary');
        }
        break;

      default:
        throw 'ERROR: invalid back type.'
    }

    // letters need to be shuffled in parallel with the objects they represent
    if ( ["letters 1", "letters 2"].includes(req.query.deck) ){
      parallelShuffle(cards, backContent);
    }
    else{
      cards = FYshuffle(cards);
    }
    res.render('match', {cards, backClass, backContent});
  }
  catch(err){ 
    res.send(err);
    console.error(err);
  }
});


// WORDLE //////////////////////////////////////////////////////////////////////
router.get('/wordle', (req, res)=>{
  try{
    let list = JSON.parse(req.query.words);
    list = FYshuffle( list );
    list = list.filter(word => word.match(/^[a-z_\-']+$/)); // wordle can't handle capital letters
    res.render('wordle', {list});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


// BINGO ///////////////////////////////////////////////////////////////////////
router.get('/bingo', (req, res)=>{
  try{
    let list = JSON.parse(req.query.words);
    list = FYshuffle( list );
    res.render('bingo', {list});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

// RECALL //////////////////////////////////////////////////////////////////////
router.get('/recall', (req, res)=>{
  try{
    res.render('recall'); }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

// apply the exact same shuffle to two arrays of the same length (in place)
parallelShuffle = (a, b)=>{
  var i, j, k, l;
  for ( i = a.length -1; i > 0; i--) {
    j = Math.floor(Math.random() * i)

    k = a[i]
    a[i] = a[j]
    a[j] = k

    l = b[i]
    b[i] = b[j]
    b[j] = l
  }
}

module.exports = router;
