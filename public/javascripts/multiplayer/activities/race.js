(function() {
  function mount(options) {
    const socket = options.socket;
    const player = options.player;

    socket.emit('race/state', {
      roomname: player.roomname,
      state: { ready: true }
    });
  }

  function teardown() {}

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.race = {
    mount: mount,
    teardown: teardown
  };
})();
