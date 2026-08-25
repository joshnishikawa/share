const chooseEvents = require('./choose.js');
const raceEvents = require('./race.js');
const matchEvents = require('./match.js');
const popquizEvents = require('./popquiz.js');

const registerMultiplayerActivityEvents = (io, socket, touchRoom) => {
  chooseEvents(io, socket, touchRoom);
  raceEvents(io, socket, touchRoom);
  matchEvents(io, socket, touchRoom);
  popquizEvents(io, socket, touchRoom);
};

module.exports = registerMultiplayerActivityEvents;

