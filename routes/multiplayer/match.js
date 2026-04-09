const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.render('activities/multiplayer/match/index');
  } catch (err) {
    res.status(500).render('error');
    console.error(err);
  }
});

module.exports = router;
