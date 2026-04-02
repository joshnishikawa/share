const chooseCatalog = [
  { word: 'apple', image: 'fruit_apple.jpg' },
  { word: 'banana', image: 'fruit_banana.jpg' },
  { word: 'cherry', image: 'fruit_cherry.jpg' },
  { word: 'orange', image: 'fruit_orange.jpg' },
  { word: 'peach', image: 'fruit_peach.jpg' },
  { word: 'strawberry', image: 'fruit_strawberry.jpg' },
];

const roomStates = new Map();

function cloneCatalog() {
  return chooseCatalog.map((item) => ({ ...item }));
}

function getOrCreateRoomState(roomname) {
  if (!roomStates.has(roomname)) {
    roomStates.set(roomname, {
      items: cloneCatalog(),
      players: new Map(),
      readySockets: new Set(),
      chooserNumber: null,
      selectedWord: null,
      guesses: new Map(),
      started: false,
    });
  }
  return roomStates.get(roomname);
}

function getReadyPlayers(state) {
  return Array.from(state.readySockets)
    .map((socketId) => ({ socketId, player: state.players.get(socketId) }))
    .filter((entry) => entry.player)
    .sort((a, b) => Number(a.player.number) - Number(b.player.number));
}

function emitWaiting(io, roomname, state) {
  const expected = io.sockets.adapter.rooms.get(roomname)?.size || state.readySockets.size;
  io.to(roomname).emit('choose/waiting', {
    ready: state.readySockets.size,
    expected,
  });
}

function emitRoundStart(io, roomname, state) {
  const readyPlayers = getReadyPlayers(state);
  if (readyPlayers.length === 0) return;

  if (!state.chooserNumber || !readyPlayers.some((entry) => Number(entry.player.number) === Number(state.chooserNumber))) {
    state.chooserNumber = Number(readyPlayers[0].player.number);
  }

  state.started = true;
  state.selectedWord = null;
  state.guesses.clear();

  io.to(roomname).emit('choose/roundstart', {
    items: state.items,
    chooserNumber: state.chooserNumber,
  });
}

function moveChooserToNext(state) {
  const readyPlayers = getReadyPlayers(state);
  if (readyPlayers.length === 0) {
    state.chooserNumber = null;
    return;
  }

  const currentIndex = readyPlayers.findIndex((entry) => Number(entry.player.number) === Number(state.chooserNumber));
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % readyPlayers.length;
  state.chooserNumber = Number(readyPlayers[nextIndex].player.number);
}

function maybeStart(io, roomname, state) {
  const expected = io.sockets.adapter.rooms.get(roomname)?.size || state.readySockets.size;
  if (!state.started && state.readySockets.size > 0 && state.readySockets.size >= expected) {
    emitRoundStart(io, roomname, state);
  } else {
    emitWaiting(io, roomname, state);
  }
}

function removeSocketFromRoom(socketId, roomname) {
  const state = roomStates.get(roomname);
  if (!state) return;

  state.players.delete(socketId);
  state.readySockets.delete(socketId);
  state.guesses.delete(socketId);

  if (state.readySockets.size === 0) {
    roomStates.delete(roomname);
  }
}

const chooseEvents = (io, socket) => {
  socket.on('choose/playerready', function(data) {
    if (!data || !data.roomname) return;

    if (socket.data.chooseRoomname && socket.data.chooseRoomname !== data.roomname) {
      removeSocketFromRoom(socket.id, socket.data.chooseRoomname);
    }

    socket.data.chooseRoomname = data.roomname;

    const state = getOrCreateRoomState(data.roomname);
    state.readySockets.add(socket.id);
    state.players.set(socket.id, {
      id: data.playerId,
      number: Number(data.playerNumber),
    });

    maybeStart(io, data.roomname, state);
  });

  socket.on('choose/selectimg', function(data) {
    if (!data || !data.roomname) return;
    const state = roomStates.get(data.roomname);
    if (!state || !state.started) return;

    const player = state.players.get(socket.id);
    if (!player) return;
    if (Number(player.number) !== Number(state.chooserNumber)) return;
    if (state.selectedWord) return;

    const selected = state.items.find((item) => item.word === data.word);
    if (!selected) return;

    state.selectedWord = selected.word;
    state.guesses.clear();

    io.to(data.roomname).emit('choose/imageselected', {
      word: selected.word,
      chooserNumber: state.chooserNumber,
    });
  });

  socket.on('choose/selectword', function(data) {
    if (!data || !data.roomname) return;
    const state = roomStates.get(data.roomname);
    if (!state || !state.started || !state.selectedWord) return;

    const player = state.players.get(socket.id);
    if (!player) return;
    if (Number(player.number) === Number(state.chooserNumber)) return;
    if (state.guesses.has(socket.id)) return;

    const selected = state.items.find((item) => item.word === data.word);
    if (!selected) return;

    state.guesses.set(socket.id, selected.word);

    const guessers = getReadyPlayers(state).filter((entry) => Number(entry.player.number) !== Number(state.chooserNumber));
    io.to(data.roomname).emit('choose/guesscount', {
      guessed: state.guesses.size,
      expected: guessers.length,
    });

    if (state.guesses.size >= guessers.length) {
      const results = guessers.map((entry) => {
        const guessedWord = state.guesses.get(entry.socketId);
        return {
          playerId: entry.player.id,
          playerNumber: entry.player.number,
          word: guessedWord,
          correct: guessedWord === state.selectedWord,
        };
      });

      io.to(data.roomname).emit('choose/reveal', {
        correctWord: state.selectedWord,
        results,
      });

      state.items = state.items.filter((item) => item.word !== state.selectedWord);

      if (state.items.length === 0) {
        io.to(data.roomname).emit('choose/gameover');
        io.to(data.roomname).emit('choose/completed', { roomname: data.roomname });
        roomStates.delete(data.roomname);
        return;
      }

      moveChooserToNext(state);
      setTimeout(() => {
        emitRoundStart(io, data.roomname, state);
      }, 1500);
    }
  });

  socket.on('disconnect', function() {
    if (!socket.data.chooseRoomname) return;
    removeSocketFromRoom(socket.id, socket.data.chooseRoomname);
  });
};

module.exports = chooseEvents;
