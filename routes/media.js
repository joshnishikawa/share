// uncomment the "app.use('/media', mediaRouter);" line in share.js to use
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Helper to ensure target directory remains within the public folder
function getSafePublicPath(subpath) {
  if (!subpath || typeof subpath !== 'string') return null;
  const baseDir = path.resolve(__dirname, '../public');
  const resolvedPath = path.resolve(baseDir, subpath);
  if (!resolvedPath.startsWith(baseDir)) {
    return null;
  }
  return resolvedPath;
}

// Authentication guard for modifying media metadata
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).send('Unauthorized');
}

router.get('/', (req, res)=>{
  res.render('labs/media');
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
    res.status(500).render('error', { message: err.message || String(err), error: err });
    console.error(err);
  }
});


router.post('/addTags', requireAuth, (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let selectedTags = Array.isArray(req.body.selectedTags) ? req.body.selectedTags : [];
    let selectedFiles = Array.isArray(req.body.selectedFiles) ? req.body.selectedFiles : [];

    for (let t of selectedTags){
      if (typeof t !== 'string') continue;
      if ( !tags[t] ) tags[t] = [];
      for (let f of selectedFiles){
        if (typeof f !== 'string') continue;
        if ( !tags[t] ) tags[t] = [];
        if ( !tags[t].includes(f) ) tags[t].push(f);
      }
    }

    fs.writeFileSync( path.join(__dirname, '../public/image/svg/_tags.json'), JSON.stringify(tags) );

    res.send('success');
  }
  catch(err){
    res.status(500).render('error', { message: err.message || String(err), error: err });
    console.error(err);
  }
});


router.post('/removeTags', requireAuth, (req, res)=>{
  try{
    let tags = JSON.parse( fs.readFileSync( path.join(__dirname, '../public/image/svg/_tags.json') ) );
    let selectedTags = Array.isArray(req.body.selectedTags) ? req.body.selectedTags : [];
    let selectedFiles = Array.isArray(req.body.selectedFiles) ? req.body.selectedFiles : [];

    for (let t of selectedTags){
      if (typeof t !== 'string') continue;
      for (let f of selectedFiles){
        if (typeof f !== 'string') continue;
        if ( tags[t].includes(f) ) tags[t].splice( tags[t].indexOf(f), 1 );
      }
    }

    fs.writeFileSync( path.join(__dirname, '../public/image/svg/_tags.json'), JSON.stringify(tags) );

    res.send('success');
  }
  catch(err){
    res.status(500).render('error', { message: err.message || String(err), error: err });
    console.error(err);
  }
});


router.get('/findMissing', (req, res)=>{
  try{
    var haystack = req.query.haystack;
    const safeHaystack = getSafePublicPath(haystack);
    if (!safeHaystack || !fs.existsSync(safeHaystack) || !fs.statSync(safeHaystack).isDirectory()) {
      return res.status(400).send('Invalid haystack directory');
    }

    var needleList = getNeedleList(req.query.needleType, req.query.needle);

    let haystackList = {};
    let files = fs.readdirSync( safeHaystack );
    files.filter(v=> !["README.md", ".git", "_tags.json", "_synonyms.json"].includes(v) );
    for (let i = 0; i < files.length; i++){ 
      let name = files[i].replace(/\.[^/.]+$/, "");
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
  catch(err){console.error(err); res.status(500).send('Error searching media');}
});


function getNeedleList(needleType, needle){
  let needleList = [];

  switch (needleType){
    case "dir": {
      const safeNeedle = getSafePublicPath(needle);
      if (!safeNeedle || !fs.existsSync(safeNeedle) || !fs.statSync(safeNeedle).isDirectory()) {
        return [];
      }
      var files = fs.readdirSync( safeNeedle );
      for (let i = 0; i < files.length; i++){
        let str = files[i];

        // remove file extension
        str = str.replace(/\.[^/.]+$/, "");

        // find the first index of '_' in str
        let underscoreIndex = str.indexOf('_');
        // keep everything after the underscore
        if (underscoreIndex > -1) str = str.slice(underscoreIndex+1);

        needleList.push( str );
      }
      break;
    }
    case "list":
      if (typeof needle === 'string') {
        needleList = needle.split(/,|\n/).map(v=>v.trim()).filter(Boolean);
      }
      break;
  }
  return needleList;
}



router.get('/findAudio', (req, res) => {
  try {
    let file = req.query.file;
    if (!file || typeof file !== 'string' || file.includes('..') || file.includes('/') || file.includes('\\')) {
      return res.send('');
    }

    const dirs = ['words', 'sounds', 'letters', 'phrases', 'sentences', 'uploads'];
    const extensions = ['.mp3', '.wav', '.m4a', ''];

    for (let d of dirs) {
      for (let ext of extensions) {
        let relativePath = `/audio/${d}/${file}${ext}`;
        let fullPath = path.join(__dirname, `../public${relativePath}`);
        if (fs.existsSync(fullPath)) {
          return res.send(relativePath);
        }
      }
    }

    res.send('');
  } catch (err) {
    console.error(err);
    res.send('');
  }
});


module.exports = router;
