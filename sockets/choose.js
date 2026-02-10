// Handle choose-related socket events for group activities
const chooseEvents = (io, socket) => {

  // Handle image selection in choose activities
  socket.on('choose/selectimg', function(data){
    socket.broadcast.to(data.roomname).emit('choose/selectedimg', data.word);
  });

  // Handle word selection in choose activities  
  socket.on('choose/selectword', function(data){
    socket.broadcast.to(data.roomname).emit('choose/selectedword', data.word);
  });

  // Handle game state updates for choose activities
  socket.on('choose/gamestate', function(data){
    socket.broadcast.to(data.roomname).emit('choose/gamestate', data.state);
  });

  // Handle player ready status for choose activities
  socket.on('choose/playerready', function(data){
    socket.broadcast.to(data.roomname).emit('choose/playerready', data);
  });

  // Handle score updates for choose activities
  socket.on('choose/score', function(data){
    socket.broadcast.to(data.roomname).emit('choose/score', data);
  });

};

module.exports = chooseEvents;
