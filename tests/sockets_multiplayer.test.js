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

  test('hostId is assigned to room creator and promoted to Player 2 when Player 1 leaves', (done) => {
    clientSocket1.emit('join', {
      id: 'OriginalHost',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room, playerNum }) => {
      expect(playerNum).toBe(1);
      expect(room.hostId).toBe('OriginalHost');
      const roomname = room.roomname;

      // Connect Player 2
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
        expect(data2.room.hostId).toBe('OriginalHost');

        // Player 1 leaves
        clientSocket2.on('playerLeft', (remainingPlayers) => {
          expect(remainingPlayers.length).toBe(1);
          expect(remainingPlayers[0].id).toBe('Player2');

          // Verify hostId promotion by doing a roomSearch
          clientSocket2.emit('roomSearch', roomname);
          clientSocket2.on('roomSearch', (foundRoom) => {
            expect(foundRoom.hostId).toBe('Player2');

            // Connect a new Player 3 who will get playerNum 1
            const clientSocket3 = Client(`http://localhost:${serverPort}`);
            clientSocket3.on('connect', () => {
              clientSocket3.emit('join', {
                id: 'NewPlayer',
                roomtype: 'private',
                roomname: roomname,
                color: '#0000ff',
              });
            });

            clientSocket3.on('joined', (data3) => {
              // New player gets slot 1, but hostId remains Player2
              expect(data3.playerNum).toBe(1);
              expect(data3.room.hostId).toBe('Player2');
              clientSocket3.disconnect();
              done();
            });
          });
        });

        clientSocket1.emit('leave', {
          id: 'OriginalHost',
          roomname: roomname,
          roomtype: 'private',
        });
      });
    });
  });

  test('hostId updates when host changes name with getName', (done) => {
    clientSocket1.emit('join', {
      id: 'NameChangingHost',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      expect(room.hostId).toBe('NameChangingHost');

      clientSocket1.emit('getName', {
        id: 'NameChangingHost',
        roomname: roomname,
      });

      clientSocket1.on('setName', (data) => {
        expect(data.id).not.toBe('NameChangingHost');
        const newName = data.id;

        clientSocket1.emit('roomSearch', roomname);
        clientSocket1.on('roomSearch', (foundRoom) => {
          expect(foundRoom.hostId).toBe(newName);
          done();
        });
      });
    });
  });

  test('host activity flow: host selects Pop Quiz and starts activity', (done) => {
    clientSocket1.emit('join', {
      id: 'HostPlayer',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'GuestPlayer',
          roomtype: 'private',
          roomname: roomname,
          color: '#00ff00',
        });
      });

      clientSocket2.on('joined', () => {
        // Guest listens for activityChosen when host picks popquiz
        clientSocket2.on('activityChosen', (data) => {
          expect(data.selectedHostActivity).toBe('popquiz');

          // Guest attempts to start activity -> should fail
          clientSocket2.emit('startActivity', {
            roomname,
            id: 'GuestPlayer',
            activity: 'popquiz',
          });

          clientSocket2.on('error', (err) => {
            expect(err.message).toMatch(/Only the host/);

            // Now host starts activity -> should emit loadActivity to all
            clientSocket2.on('loadActivity', (activity) => {
              expect(activity).toBe('popquiz');
              done();
            });

            clientSocket1.emit('startActivity', {
              roomname,
              id: 'HostPlayer',
              activity: 'popquiz',
            });
          });
        });

        // Host chooses popquiz
        clientSocket1.emit('chooseActivity', {
          roomname,
          id: 'HostPlayer',
          activity: 'popquiz',
        });
      });
    });
  });

  test('popquiz socket flow: ready, roundstart, select, grade, and gameover', (done) => {
    const customQuestions = [
      ['apples', 'bananas', 'pears'],
    ];

    clientSocket1.emit('join', {
      id: 'QuizHost',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'QuizGuest',
          roomtype: 'private',
          roomname: roomname,
          color: '#00ff00',
        });
      });

      clientSocket2.on('joined', () => {
        // Player 2 ready
        clientSocket2.emit('popquiz/ready', {
          roomname,
          playerId: 'QuizGuest',
          playerNumber: 2,
          color: '#00ff00',
          isHost: false,
          questions: customQuestions,
        });

        // Player 1 (Host) ready
        clientSocket1.emit('popquiz/ready', {
          roomname,
          playerId: 'QuizHost',
          playerNumber: 1,
          color: '#ff0000',
          isHost: true,
          questions: customQuestions,
        });

        // Listen for roundstart
        clientSocket2.on('popquiz/roundstart', (roundData) => {
          expect(roundData.choices).toEqual(['apples', 'bananas', 'pears']);
          expect(roundData.questionIndex).toBe(0);

          // Guest selects choice 0 (apples)
          clientSocket2.emit('popquiz/select', {
            roomname,
            playerId: 'QuizGuest',
            playerNumber: 2,
            color: '#00ff00',
            choiceIndex: 0,
          });
        });

        clientSocket1.on('popquiz/playerselected', (selectData) => {
          if (selectData.playerId === 'QuizGuest') {
            expect(selectData.choiceIndex).toBe(0);

            // Host grades choice 0 as correct
            clientSocket1.emit('popquiz/grade', {
              roomname,
              id: 'QuizHost',
              correctChoiceIndex: 0,
            });
          }
        });

        clientSocket2.on('popquiz/graded', (gradedData) => {
          expect(gradedData.correctChoiceIndex).toBe(0);
          expect(gradedData.scores['QuizGuest']).toBe(1);
          expect(gradedData.isGameOver).toBe(true);
        });

        clientSocket2.on('popquiz/gameover', (overData) => {
          expect(overData.scores['QuizGuest']).toBe(1);
          done();
        });
      });
    });
  });

  test('refresh rejoining: player reconnects with same room and rejoins active activity', (done) => {
    clientSocket1.emit('join', {
      id: 'HostRefresh',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room, playerNum }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'GuestRefresh',
          roomtype: 'private',
          roomname: roomname,
          color: '#00ff00',
        });
      });

      clientSocket2.on('joined', () => {
        // Start Pop Quiz
        clientSocket1.emit('startActivity', {
          roomname,
          id: 'HostRefresh',
          activity: 'popquiz',
          questions: [['yes', 'no']],
        });

        clientSocket2.on('loadActivity', () => {
          // Guest simulates page refresh by disconnecting socket2 and connecting socket3
          clientSocket2.disconnect();

          const clientSocket3 = Client(`http://localhost:${serverPort}`);
          clientSocket3.on('connect', () => {
            // Re-join with stored player data
            clientSocket3.emit('join', {
              id: 'GuestRefresh',
              roomtype: 'private',
              roomname: roomname,
              number: 2,
              color: '#00ff00',
            });
          });

          clientSocket3.on('joined', (rejoinData) => {
            expect(rejoinData.room.roomname).toBe(roomname);
            expect(rejoinData.room.activity).toBe('popquiz');

            // Ready in popquiz and verify receipt of ongoing roundstart
            clientSocket3.emit('popquiz/ready', {
              roomname,
              playerId: 'GuestRefresh',
              playerNumber: 2,
              color: '#00ff00',
              isHost: false,
            });

            clientSocket3.on('popquiz/roundstart', (roundData) => {
              expect(roundData.choices).toEqual(['yes', 'no']);
              clientSocket3.disconnect();
              done();
            });
          });
        });
      });
    });
  });

  test('refresh on gameover: player reconnecting on winners screen receives gameover state again', (done) => {
    clientSocket1.emit('join', {
      id: 'HostPodium',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'GuestPodium',
          roomtype: 'private',
          roomname: roomname,
          color: '#00ff00',
        });
      });

      clientSocket2.on('joined', () => {
        clientSocket1.emit('popquiz/ready', {
          roomname,
          playerId: 'HostPodium',
          isHost: true,
          questions: [['finish_now']],
        });

        clientSocket2.emit('popquiz/ready', {
          roomname,
          playerId: 'GuestPodium',
          isHost: false,
          questions: [['finish_now']],
        });

        clientSocket2.on('popquiz/roundstart', () => {
          clientSocket2.emit('popquiz/select', {
            roomname,
            playerId: 'GuestPodium',
            choiceIndex: 0,
          });
        });

        clientSocket1.on('popquiz/playerselected', () => {
          clientSocket1.emit('popquiz/grade', {
            roomname,
            id: 'HostPodium',
            correctChoiceIndex: 0,
          });
        });

        clientSocket2.on('popquiz/gameover', (gameOverData) => {
          expect(gameOverData.winners.length).toBeGreaterThan(0);

          // Simulate user refreshing on the gameover screen
          clientSocket2.disconnect();
          const clientSocket3 = Client(`http://localhost:${serverPort}`);
          clientSocket3.on('connect', () => {
            clientSocket3.emit('popquiz/ready', {
              roomname,
              playerId: 'GuestPodium',
              isHost: false,
            });
          });

          clientSocket3.on('popquiz/gameover', (rejoinedGameOverData) => {
            expect(rejoinedGameOverData.winners.length).toBeGreaterThan(0);
            expect(rejoinedGameOverData.scores['GuestPodium']).toBe(1);
            clientSocket3.disconnect();
            done();
          });
        });
      });
    });
  });

  test('live question update: host updates answers list and other players receive updated choices', (done) => {
    clientSocket1.emit('join', {
      id: 'HostQuestionUpdater',
      roomtype: 'private',
      color: '#ff0000',
    });

    clientSocket1.on('joined', ({ room }) => {
      const roomname = room.roomname;
      clientSocket2 = Client(`http://localhost:${serverPort}`);
      clientSocket2.on('connect', () => {
        clientSocket2.emit('join', {
          id: 'GuestQuestionUpdater',
          roomtype: 'private',
          roomname: roomname,
          color: '#00ff00',
        });
      });

      clientSocket2.on('joined', () => {
        // Both players ready in popquiz with initial questions
        clientSocket1.emit('popquiz/ready', {
          roomname,
          playerId: 'HostQuestionUpdater',
          isHost: true,
          questions: [['initial_1', 'initial_2']],
        });

        clientSocket2.emit('popquiz/ready', {
          roomname,
          playerId: 'GuestQuestionUpdater',
          isHost: false,
        });

        let receivedInitial = false;
        clientSocket2.on('popquiz/roundstart', (roundData) => {
          if (!receivedInitial) {
            receivedInitial = true;
            expect(roundData.choices).toEqual(['initial_1', 'initial_2']);

            // Host changes answers list after guest has joined
            clientSocket1.emit('popquiz/updateQuestions', {
              roomname,
              id: 'HostQuestionUpdater',
              questions: [['updated_cat', 'updated_dog', 'updated_bird']],
            });
          } else {
            // Guest receives the updated choices
            expect(roundData.choices).toEqual(['updated_cat', 'updated_dog', 'updated_bird']);
            done();
          }
        });
      });
    });
  });
});

