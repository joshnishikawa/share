const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());


router.get('/', (req, res)=>{
  try{
    let files = fs.readdirSync( path.join(__dirname, '../public/image/svg') );
    files = files.filter( file => 
      !['_tags.json', '_synonyms.json', 'README.md', '.git'].includes(file)
    );
    res.render('teachers/updateTags', {files});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/add', (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let newTags = req.body.newTags;
    let selectedFiles = req.body.selectedFiles;

    for (let t of newTags){
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


router.post('/remove', (req, res)=>{
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



module.exports = router;
