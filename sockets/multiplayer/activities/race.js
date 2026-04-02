const raceEvents = (io, socket) => {
  socket.on('race/state', function(data) {
    socket.broadcast.to(data.roomname).emit('race/state', data.state);
  });
};

module.exports = raceEvents;
