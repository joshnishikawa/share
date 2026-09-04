/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Frontend Lobby Activity Exit Button', () => {
  let $;
  let socketMock;
  let confirmSpy;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <script id="activitiesConfigData" type="application/json">
        [
          {"id":"choose","label":"Choose","group":"standard","enabled":true},
          {"id":"race","label":"Race","group":"standard","enabled":true},
          {"id":"match","label":"Match","group":"standard","enabled":true},
          {"id":"popquiz","label":"Pop Quiz","group":"host","enabled":true},
          {"id":"raffle","label":"Raffle","group":"host","enabled":true},
          {"id":"vote","label":"Vote","group":"host","enabled":true}
        ]
      </script>
      <div id="studentSideMenu"></div>
      <div id="lobbyColumn">
        <div id="myGroup">
          <div id="leaveGroup" style="display: none;"></div>
          <div id="group">
            <form id="roomSearchForm">
              <button id="join" disabled></button>
              <input id="roomSearch" />
            </form>
          </div>
        </div>
        <div id="otherPlayers"></div>
      </div>
      <div id="sideColumn"></div>
      <div id="activityColumn" class="col-sm-8">
        <div id="activityHeader">
          <button id="activityExit" class="btn btn-sm d-none"></button>
          <span id="activityHostBadge" class="d-none"></span>
          <div id="activityRoomName"></div>
          <div id="activityStatus"></div>
          <div id="activityControls"></div>
        </div>
        <div id="activityMenu">
          <div id="standardActivities" class="d-none">
            <button class="activity" id="race" data-group="standard"><span class="host-pawn"></span><span class="activity-pawns"></span></button>
          </div>
          <div id="hostActivities" class="d-none">
            <div class="host-activity-row" id="row-popquiz">
              <button class="activity" id="popquiz" data-group="host"><span class="host-pawn"></span><span class="activity-pawns"></span><span class="activity-count">0</span></button>
              <button class="start-activity-btn d-none" data-activity="popquiz">Start</button>
            </div>
            <div class="host-activity-row" id="row-raffle">
              <button class="activity" id="raffle" data-group="host"><span class="host-pawn"></span><span class="activity-pawns"></span><span class="activity-count">0</span></button>
              <button class="start-activity-btn d-none" data-activity="raffle">Start</button>
            </div>
          </div>
        </div>
        <div id="activityContent"></div>
      </div>
      <div id="hostBadge" class="d-none"></div>
    `;

    $ = require('jquery');
    global.$ = $;
    global.jQuery = $;

    socketMock = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };
    global.io = jest.fn(() => socketMock);

    // Mock localStorage
    const storage = {};
    global.localStorage = {
      getItem: jest.fn((k) => storage[k] || null),
      setItem: jest.fn((k, v) => { storage[k] = v; }),
      removeItem: jest.fn((k) => { delete storage[k]; }),
      clear: jest.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
    };

    confirmSpy = jest.spyOn(window, 'confirm');
  });

  afterEach(() => {
    confirmSpy.mockRestore();
    jest.resetModules();
  });

  test('hosted activity host clicking exit prompts confirm; if accepted emits activityComplete and stays in room', async () => {
    // Load lobby.js
    const lobbyCode = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/lobby.js'), 'utf8');
    eval(lobbyCode);

    // Wait for jQuery.ready (runs via setTimeout in complete readyState)
    await new Promise((r) => setTimeout(r, 20));

    // Simulate joined event as host
    const socketOnHandlers = {};
    socketMock.on.mock.calls.forEach(([evt, handler]) => {
      socketOnHandlers[evt] = handler;
    });

    const hostPlayer = {
      id: 'TeacherHost',
      number: 1,
      roomname: 'FunRoom',
      roomtype: 'private',
      color: '#0d6efd',
      activity: null,
    };

    const roomData = {
      roomname: 'FunRoom',
      roomtype: 'private',
      hostId: 'TeacherHost',
      players: [hostPlayer],
      activity: null,
      selectedHostActivity: null,
    };

    socketOnHandlers['setName']({ id: 'TeacherHost', number: 1 });
    socketOnHandlers['joined']({ room: roomData, playerNum: 1 });

    // Mock loading popquiz activity
    $.fn.load = function(url, cb) {
      cb && cb('', 'success');
    };

    window.hostedActivities = {
      popquiz: {
        mount: jest.fn(),
        teardown: jest.fn(),
      },
    };

    socketOnHandlers['loadActivity']('popquiz');

    // Exit button should now be visible and have updated title
    expect($('#activityExit').hasClass('d-none')).toBe(false);
    expect($('#activityExit').attr('title')).toBe('End activity and return to lobby');

    // Case 1: Host cancels confirmation
    confirmSpy.mockReturnValueOnce(false);
    $('#activityExit').trigger('click');

    expect(confirmSpy).toHaveBeenCalledWith('Do you want to end the activity and return to the lobby?');
    expect(socketMock.emit).not.toHaveBeenCalledWith('activityComplete', expect.anything());
    expect(socketMock.emit).not.toHaveBeenCalledWith('leave', expect.anything());

    // Case 2: Host accepts confirmation
    confirmSpy.mockReturnValueOnce(true);
    $('#activityExit').trigger('click');

    expect(confirmSpy).toHaveBeenCalledWith('Do you want to end the activity and return to the lobby?');
    expect(socketMock.emit).toHaveBeenCalledWith('activityComplete', {
      roomname: 'FunRoom',
      activity: 'popquiz',
    });
    // Crucial: host must NOT leave the room!
    expect(socketMock.emit).not.toHaveBeenCalledWith('leave', expect.anything());

    // Case 3: Server responds with returnToLobby
    socketOnHandlers['returnToLobby']({
      roomname: 'FunRoom',
      players: [hostPlayer],
      selectedHostActivity: null,
      roomtype: 'private',
    });

    // Teardown should have been called
    expect(window.hostedActivities.popquiz.teardown).toHaveBeenCalled();
    // Lobby menu should be visible again
    expect($('#activityMenu').hasClass('d-none')).toBe(false);
    // Exit button should be hidden
    expect($('#activityExit').hasClass('d-none')).toBe(true);
    // Host badge should be visible (still host in the room!)
    expect($('#hostBadge').hasClass('d-none')).toBe(false);
  });

  test('non-host player clicking exit in hosted activity leaves room directly without confirm', async () => {
    const lobbyCode = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/lobby.js'), 'utf8');
    eval(lobbyCode);

    await new Promise((r) => setTimeout(r, 20));

    const socketOnHandlers = {};
    socketMock.on.mock.calls.forEach(([evt, handler]) => {
      socketOnHandlers[evt] = handler;
    });

    const studentPlayer = {
      id: 'Student1',
      number: 2,
      roomname: 'FunRoom',
      roomtype: 'private',
      color: '#ff0000',
      activity: null,
    };

    const roomData = {
      roomname: 'FunRoom',
      roomtype: 'private',
      hostId: 'TeacherHost',
      players: [
        { id: 'TeacherHost', number: 1, color: '#0d6efd' },
        studentPlayer,
      ],
      activity: null,
      selectedHostActivity: 'popquiz',
    };

    socketOnHandlers['setName']({ id: 'Student1', number: 2 });
    socketOnHandlers['joined']({ room: roomData, playerNum: 2 });

    $.fn.load = function(url, cb) {
      cb && cb('', 'success');
    };

    window.hostedActivities = {
      popquiz: {
        mount: jest.fn(),
        teardown: jest.fn(),
      },
    };

    socketOnHandlers['loadActivity']('popquiz');

    $('#activityExit').trigger('click');

    // Non-host should NOT be prompted with confirm
    expect(confirmSpy).not.toHaveBeenCalled();
    // Non-host should emit leave
    expect(socketMock.emit).toHaveBeenCalledWith('leave', expect.objectContaining({ id: 'Student1' }));
  });

  test('host player clicking exit in standard activity leaves room directly without confirm', async () => {
    const lobbyCode = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/lobby.js'), 'utf8');
    eval(lobbyCode);

    await new Promise((r) => setTimeout(r, 20));

    const socketOnHandlers = {};
    socketMock.on.mock.calls.forEach(([evt, handler]) => {
      socketOnHandlers[evt] = handler;
    });

    const hostPlayer = {
      id: 'TeacherHost',
      number: 1,
      roomname: 'FunRoom',
      roomtype: 'private',
      color: '#0d6efd',
      activity: null,
    };

    const roomData = {
      roomname: 'FunRoom',
      roomtype: 'private',
      hostId: 'TeacherHost',
      players: [hostPlayer],
      activity: null,
      selectedHostActivity: null,
    };

    socketOnHandlers['setName']({ id: 'TeacherHost', number: 1 });
    socketOnHandlers['joined']({ room: roomData, playerNum: 1 });

    $.fn.load = function(url, cb) {
      cb && cb('', 'success');
    };

    window.multiplayerActivities = {
      race: {
        mount: jest.fn(),
        teardown: jest.fn(),
      },
    };

    socketOnHandlers['loadActivity']('race');

    $('#activityExit').trigger('click');

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(socketMock.emit).toHaveBeenCalledWith('leave', expect.objectContaining({ id: 'TeacherHost' }));
  });

  test('host returning to lobby can select and prepare another activity', async () => {
    const lobbyCode = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/lobby.js'), 'utf8');
    eval(lobbyCode);

    await new Promise((r) => setTimeout(r, 20));

    const socketOnHandlers = {};
    socketMock.on.mock.calls.forEach(([evt, handler]) => {
      socketOnHandlers[evt] = handler;
    });

    const hostPlayer = {
      id: 'TeacherHost',
      number: 1,
      roomname: 'FunRoom',
      roomtype: 'private',
      color: '#0d6efd',
      activity: null,
    };

    const roomData = {
      roomname: 'FunRoom',
      roomtype: 'private',
      hostId: 'TeacherHost',
      players: [hostPlayer],
      activity: null,
      selectedHostActivity: null,
    };

    socketOnHandlers['setName']({ id: 'TeacherHost', number: 1 });
    socketOnHandlers['joined']({ room: roomData, playerNum: 1 });

    $.fn.load = function(url, cb) {
      cb && cb('', 'success');
    };

    window.hostedActivities = {
      popquiz: { mount: jest.fn(), teardown: jest.fn() },
      raffle: { mount: jest.fn(), teardown: jest.fn() },
    };

    // Load popquiz
    socketOnHandlers['loadActivity']('popquiz');

    // Host confirms exit
    confirmSpy.mockReturnValueOnce(true);
    $('#activityExit').trigger('click');

    // Return to lobby
    socketOnHandlers['returnToLobby']({
      roomname: 'FunRoom',
      players: [hostPlayer],
      selectedHostActivity: null,
      roomtype: 'private',
    });

    // In lobby, host clicks 'raffle' activity button
    $('#raffle').trigger('click');
    expect(socketMock.emit).toHaveBeenCalledWith('chooseActivity', expect.objectContaining({
      activity: 'raffle',
    }));

    // Server acknowledges chosen activity
    socketOnHandlers['activityChosen']({
      players: [{ ...hostPlayer, activity: 'raffle' }],
      selectedHostActivity: 'raffle',
    });

    // Start button for raffle should now be visible to host
    expect($('.start-activity-btn[data-activity="raffle"]').hasClass('d-none')).toBe(false);
  });
});
