const express = require('express');
const router = express.Router();


router.get('/choose', (req, res)=>{
  console.log('GET /groups/choose');
  try {
    res.render('activities/groups/choose');
  }
  catch(err){
    res.send(err);
    console.error(err);
  }
});

module.exports = router;