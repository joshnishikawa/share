(function() {
  function mount(options) {
    const socket = options.socket;
    const player = options.player;

    socket.emit('match/state', {
      roomname: player.roomname,
      state: { ready: true }
    });
  }

  function teardown() {}

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.match = {
    mount: mount,
    teardown: teardown
  };
})();
