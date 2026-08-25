const raceEvents = (io, socket, touchRoom) => {
  socket.on('race/state', function(data) {
    if (typeof touchRoom === 'function' && data && data.roomname) touchRoom(data.roomname);
    socket.broadcast.to(data.roomname).emit('race/state', data.state);
  });
};

module.exports = raceEvents;

