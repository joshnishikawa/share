const express = require('express');
const router = express.Router();
const activities = require('../../config/multiplayer_activities.js');
const popquiz = require('./popquiz.js');
const raffle = require('./raffle.js');

const hostedRoutes = {
  popquiz,
  raffle,
};

const enabledHostedActivities = activities.filter((activity) => activity.enabled && activity.group === 'host');

enabledHostedActivities.forEach((activity) => {
  if (hostedRoutes[activity.id]) {
    router.use('/' + activity.id, hostedRoutes[activity.id]);
  }
});

module.exports = router;
