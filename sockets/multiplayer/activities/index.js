const chooseEvents = require('./choose.js');
const raceEvents = require('./race.js');
const matchEvents = require('./match.js');

const registerMultiplayerActivityEvents = (io, socket) => {
  chooseEvents(io, socket);
  raceEvents(io, socket);
  matchEvents(io, socket);
};

module.exports = registerMultiplayerActivityEvents;
