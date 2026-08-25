/**
 * sockets/multiplayer/activities/popquiz.js — Pop Quiz activity server socket handlers
 */
const defaultQuestions = [
  ['apples', 'bananas', 'pears'],
  ['red', 'yellow', 'green', 'blue'],
];

const popquizStates = new Map();

function getOrCreatePopquizState(roomname, initialQuestions, hostId) {
  if (!popquizStates.has(roomname)) {
    const questions = Array.isArray(initialQuestions) && initialQuestions.length > 0
      ? initialQuestions
      : defaultQuestions.map((arr) => [...arr]);

    popquizStates.set(roomname, {
      questions,
      currentQuestionIndex: 0,
      hostId: hostId || null,
      scores: {},
      selections: new Map(),
      readySockets: new Set(),
      players: new Map(),
      graded: false,
      started: false,
    });
  } else {
    const state = popquizStates.get(roomname);
    if (Array.isArray(initialQuestions) && initialQuestions.length > 0) {
      state.questions = initialQuestions;
    }
    if (hostId) {
      state.hostId = hostId;
    }
  }
  return popquizStates.get(roomname);
}

function removeSocketFromPopquiz(socketId, roomname) {
  const state = popquizStates.get(roomname);
  if (!state) return;

  state.readySockets.delete(socketId);
}

function emitRoundStart(io, roomname, state) {
  state.started = true;
  state.graded = false;
  state.selections.clear();

  const currentChoices = state.questions[state.currentQuestionIndex] || [];
  const playersList = Array.from(state.players.values());

  io.to(roomname).emit('popquiz/roundstart', {
    questionIndex: state.currentQuestionIndex,
    totalQuestions: state.questions.length,
    choices: currentChoices,
    scores: state.scores,
    players: playersList,
    hostId: state.hostId,
  });
}

const popquizEvents = (io, socket) => {
  socket.on('popquiz/ready', function(data) {
    if (!data || !data.roomname) return;
    socket.data.popquizRoomname = data.roomname;

    const state = getOrCreatePopquizState(data.roomname, data.questions, data.hostId);
    state.readySockets.add(socket.id);

    if (data.playerId) {
      state.players.set(data.playerId, {
        id: data.playerId,
        number: Number(data.playerNumber) || 1,
        color: data.color || '#0d6efd',
        socketId: socket.id,
      });
      if (state.scores[data.playerId] === undefined) {
        state.scores[data.playerId] = 0;
      }
    }

    if (Array.isArray(data.roomPlayers)) {
      data.roomPlayers.forEach((p) => {
        if (p && p.id && !state.players.has(p.id)) {
          state.players.set(p.id, {
            id: p.id,
            number: Number(p.number) || 1,
            color: p.color || '#0d6efd',
          });
          if (state.scores[p.id] === undefined) {
            state.scores[p.id] = 0;
          }
        }
      });
    }

    if (Array.isArray(data.questions) && data.questions.length > 0) {
      state.questions = data.questions;
    }

    if (data.isHost) {
      state.hostId = data.playerId;
    }

    const uniquePlayers = Array.from(state.players.values());

    // Broadcast player synchronization to all clients in the room
    io.to(data.roomname).emit('popquiz/playersync', {
      players: uniquePlayers,
      scores: state.scores,
      hostId: state.hostId,
    });

    if (data.isHost) {
      // When the host connects with questions, ensure all players start on the host's question set
      emitRoundStart(io, data.roomname, state);
      return;
    }

    if (state.isGameOver && state.gameOverData) {
      socket.emit('popquiz/gameover', state.gameOverData);
    } else if (state.started) {
      const currentChoices = state.questions[state.currentQuestionIndex] || [];
      socket.emit('popquiz/roundstart', {
        questionIndex: state.currentQuestionIndex,
        totalQuestions: state.questions.length,
        choices: currentChoices,
        scores: state.scores,
        players: uniquePlayers,
        hostId: state.hostId,
      });

      state.selections.forEach((choiceIndex, pId) => {
        const playerObj = state.players.get(pId);
        if (playerObj) {
          socket.emit('popquiz/playerselected', {
            playerId: pId,
            playerNumber: playerObj.number,
            color: playerObj.color,
            choiceIndex: choiceIndex,
          });
        }
      });
    } else {
      emitRoundStart(io, data.roomname, state);
    }
  });

  socket.on('popquiz/updateQuestions', function(data) {
    if (!data || !data.roomname) return;
    const state = popquizStates.get(data.roomname);
    if (!state) return;

    if (state.hostId && data.id !== state.hostId) return;

    if (Array.isArray(data.questions) && data.questions.length > 0) {
      state.questions = data.questions;
      if (state.started && !state.isGameOver) {
        const currentChoices = state.questions[state.currentQuestionIndex] || [];
        io.to(data.roomname).emit('popquiz/roundstart', {
          questionIndex: state.currentQuestionIndex,
          totalQuestions: state.questions.length,
          choices: currentChoices,
          scores: state.scores,
          players: Array.from(state.players.values()),
          hostId: state.hostId,
        });
      }
    }
  });

  socket.on('popquiz/select', function(data) {
    if (!data || !data.roomname) return;
    const state = popquizStates.get(data.roomname);
    if (!state || !state.started || state.graded || state.isGameOver) return;

    state.selections.set(data.playerId, data.choiceIndex);

    io.to(data.roomname).emit('popquiz/playerselected', {
      playerId: data.playerId,
      playerNumber: data.playerNumber,
      color: data.color,
      choiceIndex: data.choiceIndex,
    });
  });

  socket.on('popquiz/grade', function(data) {
    if (!data || !data.roomname) return;
    const state = popquizStates.get(data.roomname);
    if (!state || !state.started || state.graded || state.isGameOver) return;

    if (state.hostId && data.id !== state.hostId) {
      socket.emit('error', { message: 'Only the host can grade answers.' });
      return;
    }

    state.graded = true;
    const correctIndex = Number(data.correctChoiceIndex);

    const playersArray = Array.from(state.players.values());
    const studentPlayers = playersArray.filter((p) => p.id !== state.hostId);
    const targetPlayers = studentPlayers.length > 0 ? studentPlayers : playersArray;

    const results = targetPlayers.map((p) => {
      const selectedIndex = state.selections.has(p.id) ? state.selections.get(p.id) : null;
      const isCorrect = selectedIndex === correctIndex;
      if (isCorrect) {
        state.scores[p.id] = (state.scores[p.id] || 0) + 1;
      }
      return {
        playerId: p.id,
        playerNumber: p.number,
        color: p.color,
        choiceIndex: selectedIndex,
        correct: isCorrect,
        score: state.scores[p.id] || 0,
      };
    });

    const isGameOver = state.currentQuestionIndex + 1 >= state.questions.length;

    io.to(data.roomname).emit('popquiz/graded', {
      correctChoiceIndex: correctIndex,
      results,
      scores: state.scores,
      isGameOver,
    });

    const transitionTimer = setTimeout(() => {
      if (isGameOver) {
        state.isGameOver = true;
        const scoresArr = targetPlayers.map((p) => ({
          playerId: p.id,
          score: state.scores[p.id] || 0,
          player: p,
        }));

        scoresArr.sort((a, b) => b.score - a.score);
        const topScore = scoresArr.length > 0 ? scoresArr[0].score : 0;
        const winners = scoresArr.filter((s) => s.score === topScore && topScore > 0);

        state.gameOverData = {
          winners: winners.length > 0 ? winners : scoresArr,
          leaderboard: scoresArr,
          scores: state.scores,
        };

        io.to(data.roomname).emit('popquiz/gameover', state.gameOverData);
      } else {
        state.currentQuestionIndex += 1;
        emitRoundStart(io, data.roomname, state);
      }
    }, 2500);

    if (transitionTimer.unref) transitionTimer.unref();
  });

  socket.on('disconnect', function() {
    if (!socket.data.popquizRoomname) return;
    removeSocketFromPopquiz(socket.id, socket.data.popquizRoomname);
  });
};

module.exports = popquizEvents;
