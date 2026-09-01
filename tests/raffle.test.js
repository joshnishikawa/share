const raffleEvents = require('../lobby/hosted/activities/raffle');

describe('Raffle Hosted Activity Socket Handlers', () => {
  let ioMock;
  let socketHost;
  let socketGuest1;
  let socketGuest2;
  const roomname = 'test-raffle-room';

  beforeEach(() => {
    raffleEvents.clearRaffleState(roomname);

    ioMock = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    function createMockSocket(id) {
      const handlers = {};
      const s = {
        id,
        data: {},
        join: jest.fn(),
        emit: jest.fn(),
        on: jest.fn((event, handler) => {
          handlers[event] = handler;
        }),
        trigger: (event, data) => {
          if (handlers[event]) handlers[event](data);
        },
      };
      return s;
    }

    socketHost = createMockSocket('socket-host');
    socketGuest1 = createMockSocket('socket-guest-1');
    socketGuest2 = createMockSocket('socket-guest-2');

    const touchRoom = jest.fn();
    raffleEvents(ioMock, socketHost, touchRoom);
    raffleEvents(ioMock, socketGuest1, touchRoom);
    raffleEvents(ioMock, socketGuest2, touchRoom);
  });

  test('initializes state on raffle/ready and sends initial numbers stage sync', () => {
    socketHost.trigger('raffle/ready', {
      roomname,
      playerId: 'HostTeacher',
      playerNumber: 1,
      color: '#ff0000',
      isHost: true,
      values: ['Gold Star', 'Sticker', 'Eraser', 'High Five'],
    });

    expect(ioMock.to).toHaveBeenCalledWith(roomname);
    expect(ioMock.emit).toHaveBeenCalledWith('raffle/sync', expect.objectContaining({
      stage: 'numbers',
      totalCount: 4,
      hostId: 'HostTeacher',
    }));
  });

  test('allows guests to select numbers in Phase 1', () => {
    socketHost.trigger('raffle/ready', {
      roomname,
      playerId: 'HostTeacher',
      isHost: true,
      values: ['Prize A', 'Prize B', 'Prize C'],
    });

    socketGuest1.trigger('raffle/selectNumber', {
      roomname,
      playerId: 'Student1',
      number: 2,
    });

    expect(ioMock.emit).toHaveBeenCalledWith('raffle/numberSelected', {
      playerId: 'Student1',
      number: 2,
    });
  });

  test('host advances to Phase 2 (emojis) with raffle/setNumbers', () => {
    socketHost.trigger('raffle/ready', {
      roomname,
      playerId: 'HostTeacher',
      isHost: true,
      values: ['Prize A', 'Prize B', 'Prize C'],
    });

    socketGuest1.trigger('raffle/selectNumber', {
      roomname,
      playerId: 'Student1',
      number: 1,
    });

    socketHost.trigger('raffle/setNumbers', {
      roomname,
      id: 'HostTeacher',
    });

    expect(ioMock.emit).toHaveBeenCalledWith('raffle/stageChanged', expect.objectContaining({
      stage: 'emojis',
      totalCount: 3,
      numberSelections: expect.objectContaining({ Student1: 1 }),
    }));
  });

  test('guests select unique emojis and cannot duplicate or change in Phase 2', () => {
    socketHost.trigger('raffle/ready', {
      roomname,
      playerId: 'HostTeacher',
      isHost: true,
      values: ['Prize 1', 'Prize 2', 'Prize 3'],
    });

    socketHost.trigger('raffle/setNumbers', {
      roomname,
      id: 'HostTeacher',
    });

    // Guest 1 selects emoji at index 0
    socketGuest1.trigger('raffle/selectEmoji', {
      roomname,
      playerId: 'Student1',
      playerNumber: 2,
      color: '#00ff00',
      emojiIndex: 0,
    });

    expect(ioMock.emit).toHaveBeenCalledWith('raffle/emojiSelected', expect.objectContaining({
      playerId: 'Student1',
      emojiIndex: 0,
    }));

    // Guest 2 tries to select the same emoji at index 0 (should be rejected)
    socketGuest2.trigger('raffle/selectEmoji', {
      roomname,
      playerId: 'Student2',
      playerNumber: 3,
      color: '#0000ff',
      emojiIndex: 0,
    });

    expect(socketGuest2.emit).toHaveBeenCalledWith('error', expect.objectContaining({
      message: expect.stringContaining('already been chosen'),
    }));

    // Guest 1 tries to change their choice (should be rejected)
    socketGuest1.trigger('raffle/selectEmoji', {
      roomname,
      playerId: 'Student1',
      playerNumber: 2,
      color: '#00ff00',
      emojiIndex: 1,
    });

    expect(socketGuest1.emit).toHaveBeenCalledWith('error', expect.objectContaining({
      message: expect.stringContaining('already selected'),
    }));
  });

  test('host clicks GO! (raffle/reveal) to reveal values and results table', () => {
    socketHost.trigger('raffle/ready', {
      roomname,
      playerId: 'HostTeacher',
      isHost: true,
      values: ['Prize 1', 'Prize 2'],
    });

    socketGuest1.trigger('raffle/ready', {
      roomname,
      playerId: 'Student1',
      playerNumber: 2,
      color: '#00ff00',
      isHost: false,
    });

    socketGuest1.trigger('raffle/selectNumber', {
      roomname,
      playerId: 'Student1',
      number: 1,
    });

    socketHost.trigger('raffle/setNumbers', {
      roomname,
      id: 'HostTeacher',
    });

    socketGuest1.trigger('raffle/selectEmoji', {
      roomname,
      playerId: 'Student1',
      playerNumber: 2,
      color: '#00ff00',
      emojiIndex: 0,
    });

    socketHost.trigger('raffle/reveal', {
      roomname,
      id: 'HostTeacher',
    });

    expect(ioMock.emit).toHaveBeenCalledWith('raffle/revealed', expect.objectContaining({
      shuffledValues: expect.any(Array),
      results: expect.arrayContaining([
        expect.objectContaining({
          playerId: 'Student1',
          selectedNumber: 1,
          selectedEmojiIndex: 0,
          revealedValue: expect.any(String),
        }),
      ]),
    }));
  });
});
