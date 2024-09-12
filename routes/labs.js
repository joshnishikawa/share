var Dictionary = require('japaneasy');
var dict = new Dictionary();

const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');
const path = require('path');
const creds = require('../../creds.js');
const mysql = require('mysql2/promise');
const db = mysql.createPool(creds);

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));

// EDIT SUBTITLES //////////////////////////////////////////////////////////////
function convertSRTtoOBJ(subs){
  var subobj = {};
  var subarr = subs.split("\n\n");
  for (var i = 0; i < subarr.length; i++){
    var sub = subarr[i].split("\n");
    var id = sub[0];
    var time = sub[1];
    var text = sub[2] ? sub.slice(2).join("\n") : '';
    subobj[id] = {time: time, text: text};
  }
  return subobj;
}

function convertOBJtoSRT(subs){
  var subarr = [];
  for (var id in subs){
    let str = id + '\n' + subs[id].time;
    if (subs[id].text != ''){
      str += '\n' + subs[id].text;
    }
    subarr.push(str);
  }
  return subarr.join("\n\n");
}


// router.get('/editsubs', (req, res)=>{
//   try{
//     const ENsubs = fs.readFileSync(path.join(__dirname, '../public/_EN.srt'));
//     const ENsubobj = convertSRTtoOBJ(ENsubs.toString());

//     const JAsubs = fs.readFileSync(path.join(__dirname, '../public/_JA.srt'));
//     const JAsubobj = convertSRTtoOBJ(JAsubs.toString());
//     res.render('labs/editsubs', {ENsubobj, JAsubobj});
//   }
//   catch(err){
//     res.send(err);
//     console.error(err);
//   }
// });

// router.post('/editsubs', (req, res)=>{
//   try{
//     const subs = JSON.parse(req.body.subs);
//     console.log(subs);

//     const JAsubs = fs.readFileSync(path.join(__dirname, '../public/_JA.srt'));
//     var JAsubobj = convertSRTtoOBJ(JAsubs.toString());

//     for (let key in subs){
//       JAsubobj[key].text = subs[key];
//     }
//     const newJAsubs = convertOBJtoSRT(JAsubobj);
//     fs.writeFileSync(path.join(__dirname, '../public/_JA.srt'), newJAsubs);
    
//     res.send('Saved');
//   }
//   catch(err){
//     res.send(err);
//     console.error(err);
//   }
// });






// LABS ////////////////////////////////////////////////////////////////////////
const download = (url, newfilepath) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(newfilepath);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(resolve);
    });
  }).on('error', (err) => {
    fs.unlink(newfilepath);
    reject(err.message);
  });
});


router.get('/:activity', (req, res)=>{
  try{
    const activity = req.params.activity;
    res.render('labs/' + activity);
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


module.exports = router;
