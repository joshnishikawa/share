const express = require('express');
const router = express.Router();
const activities = require('../../config/multiplayer_activities.js');

const enabledActivities = activities.filter((activity) => activity.enabled);

router.get('/', (req, res) => {
  try {
    res.render('lobby/lobby', { activities: enabledActivities });
  } catch (err) {
    res.status(500).render('error');
    console.error(err);
  }
});

router.get('/:activity', (req, res, next) => {
  const activity = enabledActivities.find((a) => a.id === req.params.activity);
  if (!activity) {
    return next();
  }
  const groupDir = activity.group === 'host' ? 'hosted' : 'multiplayer';
  try {
    res.render(`lobby/${groupDir}/${activity.id}/index`);
  } catch (err) {
    res.status(500).render('error');
    console.error(err);
  }
});

module.exports = router;
