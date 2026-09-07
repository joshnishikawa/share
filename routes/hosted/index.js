const express = require('express');
const router = express.Router();
const activities = require('../../config/multiplayer_activities.js');

const enabledHostedActivities = activities.filter((activity) => activity.enabled && activity.group === 'host');

router.get('/:activity', (req, res, next) => {
  const activity = enabledHostedActivities.find((a) => a.id === req.params.activity);
  if (!activity) {
    return next();
  }
  try {
    res.render(`lobby/hosted/${activity.id}/index`);
  } catch (err) {
    res.status(500).render('error', { message: err.message || String(err), error: err });
    console.error(err);
  }
});

module.exports = router;
