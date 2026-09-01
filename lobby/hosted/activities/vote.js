/**
 * sockets/hosted/activities/vote.js — Vote hosted activity server socket handlers
 */

const defaultValues = [
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'Option E'
];

const voteStates = new Map();

function calculateTotals(state) {
  const count = state.values ? state.values.length : 0;
  const totals = new Array(count).fill(0);
  if (!state.userVotes) return totals;

  state.userVotes.forEach((votesMap) => {
    if (!votesMap || typeof votesMap !== 'object') return;
    for (const [idxStr, numStars] of Object.entries(votesMap)) {
      const idx = parseInt(idxStr, 10);
      const stars = parseInt(numStars, 10);
      if (!isNaN(idx) && idx >= 0 && idx < count && !isNaN(stars) && stars > 0) {
        totals[idx] += stars;
      }
    }
  });
  return totals;
}

function serializeUserVotes(userVotesMap) {
  const result = {};
  if (!userVotesMap) return result;
  userVotesMap.forEach((votes, playerId) => {
    result[playerId] = { ...votes };
  });
  return result;
}

function buildResultsMatrix(state) {
  const playersList = Array.from(state.players.values()).filter((p) => p.id !== state.hostId);
  const targetPlayers = playersList.length > 0 ? playersList : Array.from(state.players.values());

  return targetPlayers.map((p) => {
    const chosenNumber = state.numberSelections.get(p.id) || null;
    const votesObj = state.userVotes.get(p.id) || {};
    let totalStars = 0;
    const itemVotes = state.values.map((val, idx) => {
      const stars = parseInt(votesObj[idx], 10) || 0;
      totalStars += stars;
      return stars;
    });

    return {
      playerId: p.id,
      playerNumber: p.number,
      color: p.color,
      selectedNumber: chosenNumber,
      itemVotes: itemVotes, // array matching state.values length
      totalStars: totalStars,
    };
  });
}

function getOrCreateVoteState(roomname, initialValues, hostId) {
  if (!voteStates.has(roomname)) {
    let values = [];
    if (Array.isArray(initialValues) && initialValues.length > 0) {
      values = initialValues.filter((v) => typeof v === 'string' && v.trim().length > 0);
    }
    if (values.length === 0) {
      values = [...defaultValues];
    }

    voteStates.set(roomname, {
      values,
      stage: 'numbers', // 'numbers' | 'voting'
      hostId: hostId || null,
      numberSelections: new Map(), // playerId -> number (1..N)
      userVotes: new Map(),        // playerId -> { [itemIndex]: count } (sum <= 5)
      readySockets: new Set(),
      players: new Map(),
      started: false,
    });
  } else {
    const state = voteStates.get(roomname);
    if (Array.isArray(initialValues) && initialValues.length > 0) {
      const cleanValues = initialValues.filter((v) => typeof v === 'string' && v.trim().length > 0);
      if (cleanValues.length > 0) {
        state.values = cleanValues;
      }
    }
    if (hostId) {
      state.hostId = hostId;
    }
  }
  return voteStates.get(roomname);
}

function removeSocketFromVote(socketId, roomname) {
  const state = voteStates.get(roomname);
  if (!state) return;
  state.readySockets.delete(socketId);
}

function clearVoteState(roomname) {
  voteStates.delete(roomname);
}

function serializeVoteState(state) {
  const numberSelectionsObj = {};
  state.numberSelections.forEach((num, pId) => {
    numberSelectionsObj[pId] = num;
  });

  return {
    stage: state.stage,
    totalCount: state.values.length,
    values: state.values,
    hostId: state.hostId,
    players: Array.from(state.players.values()),
    numberSelections: numberSelectionsObj,
    userVotes: serializeUserVotes(state.userVotes),
    totals: calculateTotals(state),
    results: buildResultsMatrix(state),
    started: state.started,
  };
}

const voteEvents = (io, socket, touchRoom) => {
  socket.on('vote/ready', function(data) {
    if (!data || !data.roomname) return;
    if (typeof touchRoom === 'function') touchRoom(data.roomname);

    socket.join(data.roomname);
    socket.data.voteRoomname = data.roomname;

    const state = getOrCreateVoteState(
      data.roomname,
      data.values || data.questions,
      data.hostId || (data.isHost ? data.playerId : null)
    );
    state.readySockets.add(socket.id);

    if (data.playerId) {
      state.players.set(data.playerId, {
        id: data.playerId,
        number: Number(data.playerNumber) || 1,
        color: data.color || '#0d6efd',
        socketId: socket.id,
      });
    }

    if (Array.isArray(data.roomPlayers)) {
      data.roomPlayers.forEach((p) => {
        if (p && p.id && !state.players.has(p.id)) {
          state.players.set(p.id, {
            id: p.id,
            number: Number(p.number) || 1,
            color: p.color || '#0d6efd',
          });
        }
      });
    }

    if (data.isHost) {
      state.hostId = data.playerId;
      state.started = true;
      if (Array.isArray(data.values) && data.values.length > 0) {
        const cleanValues = data.values.filter((v) => typeof v === 'string' && v.trim().length > 0);
        if (cleanValues.length > 0) {
          state.values = cleanValues;
        }
      }
    }

    io.to(data.roomname).emit('vote/sync', serializeVoteState(state));
  });

  socket.on('vote/updateValues', function(data) {
    if (!data || !data.roomname) return;
    if (typeof touchRoom === 'function') touchRoom(data.roomname);
    const state = voteStates.get(data.roomname);
    if (!state) return;

    if (state.hostId && data.id !== state.hostId) return;

    if (Array.isArray(data.values) && data.values.length > 0) {
      const cleanValues = data.values.filter((v) => typeof v === 'string' && v.trim().length > 0);
      if (cleanValues.length > 0) {
        state.values = cleanValues;
        io.to(data.roomname).emit('vote/sync', serializeVoteState(state));
      }
    }
  });

  socket.on('vote/selectNumber', function(data) {
    if (!data || !data.roomname || !data.playerId) return;
    if (typeof touchRoom === 'function') touchRoom(data.roomname);
    const state = voteStates.get(data.roomname);
    if (!state || state.stage !== 'numbers') return;
    if (state.hostId && data.playerId === state.hostId) return;

    const chosenNumber = parseInt(data.number, 10);
    if (isNaN(chosenNumber) || chosenNumber < 1 || chosenNumber > state.values.length) return;

    state.numberSelections.set(data.playerId, chosenNumber);

    io.to(data.roomname).emit('vote/numberSelected', {
      playerId: data.playerId,
      number: chosenNumber,
    });
  });

  socket.on('vote/setNumbers', function(data) {
    if (!data || !data.roomname) return;
    if (typeof touchRoom === 'function') touchRoom(data.roomname);
    const state = voteStates.get(data.roomname);
    if (!state || state.stage !== 'numbers') return;

    if (state.hostId && data.id !== state.hostId) {
      socket.emit('error', { message: 'Only the host can advance to voting.' });
      return;
    }

    state.stage = 'voting';
    io.to(data.roomname).emit('vote/stageChanged', {
      stage: 'voting',
      values: state.values,
      totalCount: state.values.length,
      numberSelections: Object.fromEntries(state.numberSelections),
      totals: calculateTotals(state),
    });
  });

  socket.on('vote/setPlayerVotes', function(data) {
    if (!data || !data.roomname || !data.playerId) return;
    if (typeof touchRoom === 'function') touchRoom(data.roomname);
    const state = voteStates.get(data.roomname);
    if (!state || state.stage !== 'voting') return;
    if (state.hostId && data.playerId === state.hostId) return;

    const rawVotes = (data.votes && typeof data.votes === 'object') ? data.votes : {};
    const cleanVotes = {};
    let totalStars = 0;

    for (const [key, val] of Object.entries(rawVotes)) {
      const itemIdx = parseInt(key, 10);
      const count = parseInt(val, 10);
      if (!isNaN(itemIdx) && itemIdx >= 0 && itemIdx < state.values.length) {
        if (!isNaN(count) && count > 0) {
          cleanVotes[itemIdx] = count;
          totalStars += count;
        }
      }
    }

    // A user can use at most 5 stars
    if (totalStars > 5) {
      socket.emit('error', { message: 'You cannot place more than 5 stars.' });
      return;
    }

    state.userVotes.set(data.playerId, cleanVotes);

    const totals = calculateTotals(state);
    const results = buildResultsMatrix(state);

    io.to(data.roomname).emit('vote/votesUpdated', {
      playerId: data.playerId,
      userVotes: serializeUserVotes(state.userVotes),
      totals: totals,
      results: results,
    });
  });

  socket.on('disconnect', function() {
    if (!socket.data.voteRoomname) return;
    removeSocketFromVote(socket.id, socket.data.voteRoomname);
  });
};

voteEvents.getOrCreateVoteState = getOrCreateVoteState;
voteEvents.clearVoteState = clearVoteState;
voteEvents.calculateTotals = calculateTotals;
voteEvents.buildResultsMatrix = buildResultsMatrix;

module.exports = voteEvents;
