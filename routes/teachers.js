const express = require('express');
const router = express.Router();
const vocabulary = require('../public/vocabulary.js');
const creds = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
};
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);
const text_decks = require('../public/javascripts/text_decks.json');


router.get('/', (req, res)=>{
  try{
    res.redirect('/teachers/NH');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/images', (req, res)=>{
  try{
    res.render('teachers/images');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/LT', async (req, res)=>{
  try{
    let rows = vocabulary.filter(item => item.book === 'LT');
    let LT_vocab = {};
    for (let row of rows){
      if ( !LT_vocab[row.theme] ) LT_vocab[row.theme] = {};
      LT_vocab[row.theme][row.word] = row.id;
    }

    res.render('teachers/LT', {LT_vocab});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/NH', async(req, res)=>{
  try{
    var colors = {
      "#ffa9a0" : ["page_8_9", "page_22_23"],   // red
      "#ddefb7" : ["page_10_11", "page_24_25"], // green
      "#cdaed2" : ["page_12_13", "page_34_35"], // purple
      "#ffd3b5" : ["page_14_15", "page_26_27"], // orange
      "#bfe0fa" : ["page_16_17", "page_28_29"], // blue
      "#c4bd9a" : ["page_18_19", "page_30_31"], // olive
      "#ffcbda" : ["page_20_21", "page_32_33"]  // pink
    }

    let rows = vocabulary.filter(item => item.book === 'NH');
    let NH_vocab = {};
    for (let row of rows){
      if ( !NH_vocab[row.page] ) NH_vocab[row.page] = {};
      if ( !NH_vocab[row.page][row.theme] ) NH_vocab[row.page][row.theme] = {};
      NH_vocab[row.page][row.theme][row.word] = row.id;
    }

    NH_vocab['+'] = {};
    for (let p in NH_vocab){
      for (let t in NH_vocab[p]){
        if (t.indexOf('+') > -1){ // try 'include'
          let plus = NH_vocab[p][t];
          delete NH_vocab[p][t];
          NH_vocab['+'][t] = plus;
        }
      }
    }

    res.render('teachers/NH', {NH_vocab, colors});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/text', (req, res)=>{
  try{
    res.render('teachers/text', {text_decks});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/tools', (req, res)=>{
  try{
    res.render('teachers/tools');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


// router.get('/dlpicdic', async(req, res)=>{
     // this is a one-time use route to download all the images from New Horizon
//   try{
//     let s = 1;

//     for (let i = 1; i <= 987; i++){
//       if ( [15, 54, 69, 80, 115, 152, 164, 179, 216, 222, 240, 251, 297, 334,
//             346, 360, 372, 386, 418, 427, 432, 442, 455, 464, 477, 556, 564,
//             568, 592, 613, 633, 693, 701, 706, 720, 732, 750, 760, 818, 841,
//             858, 870, 887, 915, 965].includes(i) ) s++;

//       let section = s.toString().padStart(2, '0');
//       let name = i.toString().padStart(4, '0');
//       let newfilepath = path.join(__dirname, `../public/image/picdic/${name}.png`);
//       let url = `https://sw31.tsho.jp/06pk/e/pd/w${section}/assets/${name}.png`;

//       await download(url, newfilepath);
//     }
//     console.log("Downloads Completed");
//     res.send('ok');
//   }
//   catch(err){
//     res.send(err);
//     console.error(err);
//   }
// });


module.exports = router;
