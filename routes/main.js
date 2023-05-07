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
    fs.readdir( path.join(__dirname, '../public/image/svg'), (err, files)=>{
      if (err) throw err;
      let str = '';
      for (let f of files){
        if ( f.split('.')[0].length == 5 ){
          str += `"${f.split('.')[0]}", `;
        }
      }
    });

    fs.readdir( path.join(__dirname, '../public/image/diagrams'), (err, diagrams)=>{
      if (err) throw err;
      res.render('menu/main', {session: req.session, decks, diagrams, items, tags});
    });
  }catch(err){ console.error(err); }
});


// TYPE ////////////////////////////////////////////////////////////////////////
router.get('/type', (req, res)=>{ 
  res.render('type', {session: req.session});
});


// WRITE ///////////////////////////////////////////////////////////////////////
router.get('/write', (req, res)=>{
  res.render('write', {session: req.session});
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
  catch(err){ console.error(err); }
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
    var deck = [];
    var backContent = [];
    var backClass = [];
    
    switch(req.query.deck){
      case '1~4':
        deck = [1,2,3,4,1,2,3,4];
        backClass = FYshuffle( decks.colors.slice(0, 8) );
        break;

      case '5~10':
        deck = [5,6,7,8,9,10,5,6,7,8,9,10];
        backClass = FYshuffle( decks.colors.slice(0, 12) );
        break;

      case 'animals 1':
        for (let i = 0; i < 10; i++){
          deck.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${decks.animals[i]}.svg">`);
          deck.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${decks.animals[i]}.svg">`);
        }
        var nums1 = FYshuffle( [0,1,2,3,4,5,6,7,8,9] );
        var nums2 = FYshuffle( [0,1,2,3,4,5,6,7,8,9] );
        backContent = nums1.concat(nums2);
        var colors = decks.colors.slice(0, 10);
        for (let i = 0; i < colors.length; i++){
          colors[i] += 'Text alert-primary';//use .redText class instead of .red
          backClass.push(colors[i]);
          backClass.push(colors[i]);
        }
        parallelShuffle(backClass, backContent);
        break;

      case 'animals 2':
        for (let i = 10; i < 20; i++){
          deck.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${decks.animals[i]}.svg">`);
          deck.push(`<img class="img-flash mx-auto d-block" 
                          src="/image/svg/${decks.animals[i]}.svg">`);
        }
        var nums1 = FYshuffle( [1,2,3,4,5,6,7,8,9,10] );
        var nums2 = FYshuffle( [1,2,3,4,5,6,7,8,9,10] );
        backContent = nums1.concat(nums2);
        var colors = decks.colors.slice(0, 10);
        for (let i = 0; i < colors.length; i++){
          colors[i] += 'Text alert-primary'; // use .redText class instead of .red
          backClass.push(colors[i]);
          backClass.push(colors[i]);
        }
        parallelShuffle(backClass, backContent);
        break;

      case 'letters 1':
        for (let i = 0; i < 10; i++){
          deck.push(decks.lower_case_mix[i]);
          deck.push(decks.lower_case_mix[i]);
        }

        for (let i = 0; i < 10; i++){
          backContent.push(`<img class="img-flash" src="/image/svg/${decks.animals[i]}.svg">`);
          backContent.push(`<img class="img-flash" src="/image/svg/${decks.animals[i + 10]}.svg">`);
          backClass.push('alert-primary');
          backClass.push('alert-primary');
        }
        parallelShuffle(deck, backContent);
        break;

      case 'letters 2':
        for (let i = 10; i < 20; i++){
          deck.push(decks.lower_case_mix[i]);
          deck.push(decks.lower_case_mix[i]);
        }

        for (let i = 0; i < decks.vocab.length; i++){
          backContent.push(`<img class="img-flash" 
                                src="/image/svg/${decks.vocab[i]}.svg">`);
          backClass.push('alert-primary');
        }
        parallelShuffle(deck, backContent);
        break;

      case 'shapes':
        deck = decks.shapes.concat(decks.shapes);
        backClass = FYshuffle( decks.colors.slice(0, 16) );
        break;

      case 'weekdays':
        deck = decks.weekdays.concat(decks.weekdays);
        var shapes1 = FYshuffle(decks.shapes);
        var shapes2 = FYshuffle(decks.shapes);
        backContent = shapes1.concat(shapes2);
      
        var colors = decks.colors.slice(0, 8);
        for (let i = 0; i < colors.length; i++){
          colors[i] += 'Text alert-primary'; // use .redText class instead of .red
          backClass.push(colors[i]);
          backClass.push(colors[i]);
        }
        parallelShuffle(backClass, backContent);
    }

    // letters need to be shuffled in parallel with the objects they represent
    if ( !["letters 1", "letters 2"].includes(req.query.deck) ){
      deck = FYshuffle(deck);
    }

    res.render('match', {deck, backClass, backContent});
  }
  catch(err){ console.error(err); }
});


// WORDLE //////////////////////////////////////////////////////////////////////
router.get('/wordle', (req, res)=>{
  try{
    var words = FYshuffle( tags[req.query.tag] );
    words = words.filter(word => word.match(/^[a-z_\-']+$/)); // wordle can't handle capital letters
    res.render('wordle', {words});
  }
  catch(err){ console.error(err); }
});


// BINGO ///////////////////////////////////////////////////////////////////////
router.get('/bingo', (req, res)=>{
  try{
    let list = JSON.parse(req.query.words);
    list = FYshuffle( list );
    res.render('bingo', {list});
  }
  catch(err){ console.error(err); }
});

// RECALL //////////////////////////////////////////////////////////////////////
router.get('/recall', (req, res)=>{
  try{
    let list = JSON.parse(req.query.words);
    list = FYshuffle( list );
    res.render('recall', {list});
  } catch(err){ console.error(err); }
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
