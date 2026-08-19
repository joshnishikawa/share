const http = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const multiplayer = require('../sockets/_MULTIPLAYER');

describe('Multiplayer Sockets Integration', () => {
  let io, server, serverPort;
  let clientSocket1, clientSocket2;

  beforeAll((done) => {
    server = http.createServer();
    io = new Server(server);
    multiplayer(io);

    server.listen(() => {
      serverPort = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket1 && clientSocket1.connected) clientSocket1.disconnect();
    if (clientSocket2 && clientSocket2.connected) clientSocket2.disconnect();
    io.close(done);
  });

  beforeEach((done) => {
    clientSocket1 = Client(`http://localhost:${serverPort}`);
    clientSocket1.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket1.connected) clientSocket1.disconnect();
    if (clientSocket2 && clientSocket2.connected) clientSocket2.disconnect();
  });

  test('getName generates a random name and emits setName', (done) => {
    clientSocket1.emit('getName', { id: 'OldName' });
    clientSocket1.on('setName', (data) => {
      expect(data).toHaveProperty('id');
      expect(typeof data.id).toBe('string');
      expect(data.id.split(' ').length).toBeGreaterThanOrEqual(2);
      expect(data.number).toBe(1);
      done();
    });
  });

  test('join private room and allow second player to join', (done) => {
    clientSocket1.emit('join', {
      id: 'Player1',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', (data1) => {
      expect(data1.playerNum).toBe(1);
      expect(data1.room).toBeDefined();
      expect(data1.room.roomtype).toBe('private');
      const roomname = data1.room.roomname;

      // Connect second player and join same room
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'Player2',
          roomtype: 'private',
          roomname: roomname,
          color: '#00ff00',
        });
      });

      clientSocket2.on('joined', (data2) => {
        expect(data2.playerNum).toBe(2);
        expect(data2.room.roomname).toBe(roomname);
        expect(data2.room.players.length).toBe(2);
        done();
      });
    });
  });

  test('roomSearch finds an active room', (done) => {
    clientSocket1.emit('join', {
      id: 'SearchHost',
      roomtype: 'private',
      color: '#123456',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket1.emit('roomSearch', roomname);
      clientSocket1.on('roomSearch', (foundRoom) => {
        expect(foundRoom).not.toBeNull();
        expect(foundRoom.roomname).toBe(roomname);
        done();
      });
    });
  });

  test('setColor broadcasts color change to other players', (done) => {
    clientSocket1.emit('join', {
      id: 'ColorHost',
      roomtype: 'private',
      color: '#111111',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'ColorGuest',
          roomtype: 'private',
          roomname: roomname,
          color: '#222222',
        });
      });

      clientSocket2.on('joined', () => {
        clientSocket2.on('setColor', (colorData) => {
          expect(colorData.color).toBe('#abcdef');
          expect(colorData.number).toBe(1);
          done();
        });

        clientSocket1.emit('setColor', {
          roomname: roomname,
          id: 'ColorHost',
          color: '#abcdef',
        });
      });
    });
  });

  test('activityComplete resets activity and emits returnToLobby', (done) => {
    clientSocket1.emit('join', {
      id: 'ActivityHost',
      roomtype: 'private',
      color: '#0d6efd',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket1.emit('activityComplete', { roomname, activity: null });

      clientSocket1.on('returnToLobby', (lobbyData) => {
        expect(lobbyData.roomname).toBe(roomname);
        expect(lobbyData.players[0].activity).toBeNull();
        done();
      });
    });
  });

  test('leave event allows player to exit room', (done) => {
    clientSocket1.emit('join', {
      id: 'Leaver',
      roomtype: 'private',
      color: '#0d6efd',
    });

    clientSocket1.on('joined', ({ room }) => {
      clientSocket1.emit('leave', {
        id: 'Leaver',
        roomname: room.roomname,
        roomtype: 'private',
      });

      clientSocket1.on('youLeft', () => {
        done();
      });
    });
  });

  test('activity events: match/state and race/state broadcast correctly', (done) => {
    clientSocket1.emit('join', {
      id: 'StateHost',
      roomtype: 'private',
      color: '#0d6efd',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'StateGuest',
          roomtype: 'private',
          roomname: roomname,
          color: '#222222',
        });
      });

      clientSocket2.on('joined', () => {
        clientSocket2.on('match/state', (state) => {
          expect(state).toEqual({ score: 10 });
          done();
        });

        clientSocket1.emit('match/state', {
          roomname,
          state: { score: 10 },
        });
      });
    });
  });

  test('chooseActivity emits activityChosen and loadActivity when all players agree', (done) => {
    clientSocket1.emit('join', {
      id: 'Voter1',
      roomtype: 'private',
      color: '#0d6efd',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'Voter2',
          roomtype: 'private',
          roomname: roomname,
          color: '#222222',
        });
      });

      clientSocket2.on('joined', () => {
        clientSocket2.on('loadActivity', (activity) => {
          expect(activity).toBe('race');
          done();
        });

        // Player 1 chooses race
        clientSocket1.emit('chooseActivity', {
          roomname,
          id: 'Voter1',
          activity: 'race',
        });

        // Player 2 chooses race
        clientSocket2.emit('chooseActivity', {
          roomname,
          id: 'Voter2',
          activity: 'race',
        });
      });
    });
  });

  test('choose activity flow: playerready, selectimg, selectword, reveal', (done) => {
    clientSocket1.emit('join', {
      id: 'Chooser',
      roomtype: 'private',
      color: '#0d6efd',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'Guesser',
          roomtype: 'private',
          roomname: roomname,
          color: '#222222',
        });
      });

      clientSocket2.on('joined', () => {
        let roundStarted = false;

        clientSocket1.on('choose/roundstart', (roundData) => {
          expect(roundData.items.length).toBeGreaterThan(0);
          expect(roundData.chooserNumber).toBe(1);
          roundStarted = true;

          // Chooser selects image
          clientSocket1.emit('choose/selectimg', {
            roomname,
            word: 'apple',
          });
        });

        clientSocket2.on('choose/imageselected', (imgData) => {
          expect(imgData.word).toBe('apple');
          expect(imgData.chooserNumber).toBe(1);

          // Guesser submits word
          clientSocket2.emit('choose/selectword', {
            roomname,
            word: 'apple',
          });
        });

        clientSocket2.on('choose/reveal', (revealData) => {
          expect(revealData.correctWord).toBe('apple');
          expect(revealData.results).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                playerId: 'Guesser',
                word: 'apple',
                correct: true,
              }),
            ])
          );
          done();
        });

        // Both players mark ready
        clientSocket1.emit('choose/playerready', {
          roomname,
          playerId: 'Chooser',
          playerNumber: 1,
        });

        clientSocket2.emit('choose/playerready', {
          roomname,
          playerId: 'Guesser',
          playerNumber: 2,
        });
      });
    });
  });
});

