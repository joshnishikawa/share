/**
 * lobby/hosted/activities/shared.js
 * Shared helpers for hosted activities' Phase 1 (Number Selection) stage.
 */

function getSharedTotalCount(state, itemCount) {
  if (state.customTotalCount && state.customTotalCount > 0) {
    return state.customTotalCount;
  }
  const studentCount = Array.from(state.players.values()).filter((p) => p.id !== state.hostId).length;
  const userCount = studentCount > 0 ? studentCount : state.players.size;
  return Math.max(1, itemCount || 0, userCount);
}

function handleSetTotalCount(state, data, socket, io, activityName, serializeFn, touchRoom) {
  if (!data || !data.roomname) return;
  if (typeof touchRoom === 'function') touchRoom(data.roomname);
  if (!state || state.stage !== 'numbers') return;

  if (state.hostId && data.id !== state.hostId) {
    socket.emit('error', { message: 'Only the host can edit item count.' });
    return;
  }

  const count = parseInt(data.totalCount, 10);
  if (isNaN(count) || count < 1 || count > 200) return;

  state.customTotalCount = count;

  // Prune selections that are now out of bounds
  if (state.numberSelections) {
    state.numberSelections.forEach((num, pId) => {
      if (num > count) {
        state.numberSelections.delete(pId);
      }
    });
  }

  if (typeof serializeFn === 'function') {
    io.to(data.roomname).emit(`${activityName}/sync`, serializeFn(state));
  }
}

function handleSelectNumber(state, data, socket, io, activityName, getItemCountFn, touchRoom) {
  if (!data || !data.roomname || !data.playerId) return;
  if (typeof touchRoom === 'function') touchRoom(data.roomname);
  if (!state || state.stage !== 'numbers') return;
  if (state.hostId && data.playerId === state.hostId) return;

  const itemCount = typeof getItemCountFn === 'function' ? getItemCountFn(state) : 0;
  const totalCount = getSharedTotalCount(state, itemCount);
  const chosenNumber = parseInt(data.number, 10);
  if (isNaN(chosenNumber) || chosenNumber < 1 || chosenNumber > totalCount) return;

  state.numberSelections.set(data.playerId, chosenNumber);

  io.to(data.roomname).emit(`${activityName}/numberSelected`, {
    playerId: data.playerId,
    number: chosenNumber,
  });
}

module.exports = {
  getSharedTotalCount,
  handleSetTotalCount,
  handleSelectNumber,
};
