const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.render('activities/multiplayer/match/index');
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

module.exports = router;
