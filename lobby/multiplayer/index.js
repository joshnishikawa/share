const chooseEvents = require('./choose.js');
const raceEvents = require('./race.js');
const matchEvents = require('./match.js');

const registerMultiplayerActivityEvents = (io, socket, touchRoom) => {
  chooseEvents(io, socket, touchRoom);
  raceEvents(io, socket, touchRoom);
  matchEvents(io, socket, touchRoom);
};

module.exports = registerMultiplayerActivityEvents;

