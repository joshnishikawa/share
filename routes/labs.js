var Dictionary = require('japaneasy');
var dict = new Dictionary();
const express = require('express');
const router = express.Router();
const fs = require('fs');
const https = require('https');
const path = require('path');

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

router.get('/pronunciation', (req, res)=>{
  try{
    res.render('labs/pronunciation');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/pairs', (req, res)=>{
  try{
    res.render('sockets/pairs');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/speak_spell', (req, res)=>{
  try{
    res.render('labs/speak_spell');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/japaneasy', (req, res)=>{
  try{
    dict('アバウト').then(function(result){
      res.render('labs/japaneasy', {result});
    });
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/shapes', (req, res)=>{
  try{
    res.render('labs/shapes');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/speech', (req, res)=>{
  try{
    res.render('labs/speech');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});




module.exports = router;