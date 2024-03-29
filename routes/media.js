// uncomment the "app.use('/media', mediaRouter);" line in share.js to use
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());


router.get('/', (req, res)=>{
  try{
    res.render('labs/media');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/files', (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let filenames = fs.readdirSync( path.join(__dirname, `../public/image/svg`) );
    filenames = filenames.filter(v=> !["README.md", ".git", "_tags.json", "_synonyms.json"].includes(v) );
    let files = {};
    // create an object with the filename and the tags it's associated with
    for (let f of filenames){
      let filename = f.replace('.svg', '');
      files[filename] = [];
      for (let t in tags){
        if ( tags[t].includes(filename) ) files[filename].push(t);
      }
    }

    res.send({files, tags});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/addTags', (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let selectedTags = req.body.selectedTags;
    let selectedFiles = req.body.selectedFiles;

    for (let t of selectedTags){
      if ( !tags[t] ) tags[t] = [];
      for (let f of selectedFiles){
        if ( !tags[t] ) tags[t] = [];
        if ( !tags[t].includes(f) ) tags[t].push(f);
      }
    }

    fs.writeFileSync( path.join(__dirname, '../public/image/svg/_tags.json'), JSON.stringify(tags) );

    res.send('success');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/removeTags', (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let selectedTags = req.body.selectedTags;
    let selectedFiles = req.body.selectedFiles;

    for (let t of selectedTags){
      for (let f of selectedFiles){
        if ( tags[t].includes(f) ) tags[t].splice( tags[t].indexOf(f), 1 );
      }
    }

    fs.writeFileSync( path.join(__dirname, '../public/image/svg/_tags.json'), JSON.stringify(tags) );

    res.send('success');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.get('/findMissing', (req, res)=>{
  try{
    var needleList = getNeedleList(req.query.needleType, req.query.needle);
    var haystack = req.query.haystack;

    let haystackList = {};
    let files = fs.readdirSync( path.join(__dirname, `../public/${haystack}`) );
    files.filter(v=> !["README.md", ".git", "_tags.json", "_synonyms.json"].includes(v) );
    for (let i = 0; i < files.length; i++){ 
      let name = files[i].replace(`public/${haystack}/`, '');
      name = name.replace(/\.[^/.]+$/, "");
      let path = `/${haystack}/${files[i]}`;
      haystackList[name] = path;
    }

    var found = {};
    var missing = [];

    for (let i of needleList){
      if ( Object.keys(haystackList).includes(i) ) found[i] = haystackList[i];
      else missing.push(i);
    }
    res.send({found, missing});
  }
  catch(err){console.error(err);}
});


function getNeedleList(needleType, needle){
  let needleList = [];

  switch (needleType){
    case "dir":

      var files = fs.readdirSync( path.join(__dirname, `../public/${needle}`) );
      for (let i = 0; i < files.length; i++){
        let str = files[i].replace(`public/${needle}/`, '');

        // remove file extension
        str = str.replace(/\.[^/.]+$/, "");

        // find the first index of '_' in str
        let underscoreIndex = str.indexOf('_');
        // keep everything after the underscore
        if (underscoreIndex > -1) str = str.slice(underscoreIndex+1);

        needleList.push( str );
      }
      break;

    case "list":
      needleList = needle.split(/,|\n/).map(v=>v.trim());
      break;
  }
  return needleList;
}



module.exports = router;
