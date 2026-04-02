const express = require('express');
const router = express.Router();
const activities = require('../../config/multiplayer_activities.js');
const choose = require('./choose.js');
const race = require('./race.js');
const match = require('./match.js');

const activityRoutes = {
  choose,
  race,
  match,
};

const enabledActivities = activities.filter((activity) => activity.enabled);

router.get('/', (req, res) => {
  try {
    res.render('students/multiplayer', { activities: enabledActivities });
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

enabledActivities.forEach((activity) => {
  if (activityRoutes[activity.id]) {
    router.use('/' + activity.id, activityRoutes[activity.id]);
  }
});

module.exports = router;
