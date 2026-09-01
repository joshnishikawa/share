const express = require('express');
const router = express.Router();
const activities = require('../../config/multiplayer_activities.js');
const choose = require('./choose.js');
const race = require('./race.js');
const match = require('./match.js');
const hostedPopquiz = require('../hosted/popquiz.js');
const hostedRaffle = require('../hosted/raffle.js');
const hostedVote = require('../hosted/vote.js');

const activityRoutes = {
  choose,
  race,
  match,
  popquiz: hostedPopquiz,
  raffle: hostedRaffle,
  vote: hostedVote,
};

const enabledActivities = activities.filter((activity) => activity.enabled);

router.get('/', (req, res) => {
  try {
    res.render('lobby/lobby', { activities: enabledActivities });
  } catch (err) {
    res.status(500).render('error');
    console.error(err);
  }
});

enabledActivities.forEach((activity) => {
  if (activityRoutes[activity.id]) {
    router.use('/' + activity.id, activityRoutes[activity.id]);
  }
});

module.exports = router;
