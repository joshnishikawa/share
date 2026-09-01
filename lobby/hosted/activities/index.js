const popquizEvents = require('./popquiz.js');
const raffleEvents = require('./raffle.js');

const registerHostedActivityEvents = (io, socket, touchRoom) => {
  popquizEvents(io, socket, touchRoom);
  raffleEvents(io, socket, touchRoom);
};

module.exports = registerHostedActivityEvents;
