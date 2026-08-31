/**
 * multiplayer/activities/match.js — "Match" multiplayer activity (client)
 * ────────────────────────────────────────────────────────────────────────
 * STUB: Only emits a ready signal. The matching game logic is NOT yet
 * implemented on the client. Server-side counterpart is also a 7-line stub.
 *
 * Pattern: IIFE → registers on window.multiplayerActivities.match = { mount, teardown }.
 */
(function() {
  function mount(options) {
    const socket = options.socket;
    const player = options.player;

    // Signal the server that this player's client has loaded the activity
    socket.emit('match/state', {
      roomname: player.roomname,
      state: { ready: true }
    });
  }

  function teardown() { /* Nothing to clean up yet */ }

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.match = {
    mount: mount,
    teardown: teardown
  };
})();
