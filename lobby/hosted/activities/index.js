const popquizEvents = require('./popquiz.js');
const raffleEvents = require('./raffle.js');
const voteEvents = require('./vote.js');

const registerHostedActivityEvents = (io, socket, touchRoom) => {
  popquizEvents(io, socket, touchRoom);
  raffleEvents(io, socket, touchRoom);
  voteEvents(io, socket, touchRoom);
};

module.exports = registerHostedActivityEvents;
