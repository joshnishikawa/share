const matchEvents = (io, socket, touchRoom) => {
  socket.on('match/state', function(data) {
    if (typeof touchRoom === 'function' && data && data.roomname) touchRoom(data.roomname);
    socket.broadcast.to(data.roomname).emit('match/state', data.state);
  });
};

module.exports = matchEvents;

