const matchEvents = (io, socket) => {
  socket.on('match/state', function(data) {
    socket.broadcast.to(data.roomname).emit('match/state', data.state);
  });
};

module.exports = matchEvents;
