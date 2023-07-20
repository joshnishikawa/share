const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get('/', (req, res)=>{
  try{
    // get list of files in public/image/svg
    let files = fs.readdirSync( path.join(__dirname, '../public/image/svg') );
    // remove _items.json and _tags.json
    files = files.filter( file => 
      !['_items.json', '_tags.json', 'README.md', '.git'].includes(file)
    );
    res.render('teachers/updateTags', {files});
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});


router.post('/', (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let selectedTags = req.body.selectedTags;
    let selectedFiles = req.body.selectedFiles;
    console.log(selectedTags);
    console.log(selectedFiles);
    
    for (let t of selectedTags){
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

module.exports = router;
