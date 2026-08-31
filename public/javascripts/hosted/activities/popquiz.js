/**
 * hosted/activities/popquiz.js — Pop Quiz hosted activity (client)
 * ────────────────────────────────────────────────────────────────────────────
 * Features:
 *   1. Fixed answer dimensions — pawns sit ON answers, not inside them.
 *   2. Absolute overlay coordinates for smooth, continuous pawn gliding.
 *   3. Host pawn is hidden (host acts strictly as judge/grader).
 *   4. Real-time answer selection, host grading (+1 point reveal), and winner podium.
 */
(function() {
  let currentSocket = null;
  let currentPlayer = null;
  let currentRoom = null;
  let isHost = false;
  let roundChoices = [];
  let isRoundGraded = false;
  let scoresMap = {};
  let roomHostId = null;

  // Track active student players and positions
  const playerTokensMap = {};
  const playerPositionsMap = {};

  function sanitizeColor(color) {
    if (!color || typeof color !== 'string') return '#0d6efd';
    const trimmed = color.trim();
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
      return '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
    }
    return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : '#0d6efd';
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return parts.map((p) => p[0]).join('').toUpperCase();
  }

  function getPawnSvg(color) {
    const safeColor = sanitizeColor(color);
    return (
      '<svg class="img-fluid popquiz-token-pawn" width="32" height="64" viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">' +
      '<path transform="matrix(0.78482373,0,0,0.3410327,-40.6,58)" d="m 54.796244,189.05536 c -12.062025,-20.89204 13.56978,-65.28763 37.693831,-65.28763 24.124055,0 49.755855,44.39559 37.693825,65.28763 -12.06202,20.89204 -63.325631,20.89204 -75.387656,0 z" fill="' + safeColor + '" />' +
      '<path transform="matrix(0.45050681,0,0,0.62867557,3.2,35)" d="m 105,121.60049 c -11.851854,8.65104 -69.62828,8.77896 -81.518324,0.1805 C 11.591632,113.18252 -6.3839294,58.273407 -1.8805296,44.308232 2.6228701,30.343057 49.289789,-3.7205685 63.963086,-3.7530573 78.636384,-3.785546 125.45369,30.071092 130.01888,44.016188 134.58408,57.961284 116.85185,112.94946 105,121.60049 Z" fill="' + safeColor + '" />' +
      '<circle cx="32" cy="22" r="22" fill="' + safeColor + '" />' +
      '</svg>'
    );
  }

  function getLargePawnSvg(color) {
    const safeColor = sanitizeColor(color);
    return (
      '<svg class="img-fluid" width="56" height="112" viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">' +
      '<path transform="matrix(0.78482373,0,0,0.3410327,-40.6,58)" d="m 54.796244,189.05536 c -12.062025,-20.89204 13.56978,-65.28763 37.693831,-65.28763 24.124055,0 49.755855,44.39559 37.693825,65.28763 -12.06202,20.89204 -63.325631,20.89204 -75.387656,0 z" fill="' + safeColor + '" />' +
      '<path transform="matrix(0.45050681,0,0,0.62867557,3.2,35)" d="m 105,121.60049 c -11.851854,8.65104 -69.62828,8.77896 -81.518324,0.1805 C 11.591632,113.18252 -6.3839294,58.273407 -1.8805296,44.308232 2.6228701,30.343057 49.289789,-3.7205685 63.963086,-3.7530573 78.636384,-3.785546 125.45369,30.071092 130.01888,44.016188 134.58408,57.961284 116.85185,112.94946 105,121.60049 Z" fill="' + safeColor + '" />' +
      '<circle cx="32" cy="22" r="22" fill="' + safeColor + '" />' +
      '</svg>'
    );
  }

  function createPlayerToken(playerObj, score) {
    const safeColor = sanitizeColor(playerObj.color);
    const initials = getInitials(playerObj.id);
    const safeScore = score !== undefined ? score : 0;

    const $token = $('<div>', {
      class: 'popquiz-pawn-token',
      id: 'token-' + playerObj.id.replace(/[^a-zA-Z0-9_-]/g, '_'),
      'data-player-id': playerObj.id,
    });

    const $score = $('<div>', {
      class: 'popquiz-token-score',
      text: safeScore,
    });

    const $pawn = $(getPawnSvg(safeColor));

    const $initials = $('<div>', {
      class: 'popquiz-token-initials',
      text: initials,
      css: { color: safeColor },
    });

    $token.append($score, $pawn, $initials);
    return $token;
  }

  function updatePawnPositions(instant) {
    const $arena = $('#popquiz-arena');
    if (!$arena.length || !$arena.is(':visible')) return;

    const arenaRect = $arena[0].getBoundingClientRect();
    const $dock = $('#popquiz-staging-dock');
    if (!$dock.length) return;
    const dockRect = $dock[0].getBoundingClientRect();

    // Group players by target location: null = dock, index = choice card
    const dockPlayers = [];
    const choicePlayers = {};

    Object.keys(playerPositionsMap).forEach((pId) => {
      const choiceIdx = playerPositionsMap[pId];
      if (choiceIdx === null || choiceIdx === undefined || choiceIdx < 0) {
        dockPlayers.push(pId);
      } else {
        choicePlayers[choiceIdx] = choicePlayers[choiceIdx] || [];
        choicePlayers[choiceIdx].push(pId);
      }
    });

    // Position pawns in the dock
    const N = dockPlayers.length;
    const dockSpacing = 52;
    const dockTotalWidth = N * dockSpacing;
    const dockStartX = (dockRect.left - arenaRect.left) + Math.max(0, (dockRect.width - dockTotalWidth) / 2);
    const dockStartY = (dockRect.top - arenaRect.top) + (dockRect.height - 84) / 2;

    dockPlayers.forEach((pId, i) => {
      const $token = playerTokensMap[pId];
      if ($token) {
        if (instant) $token.css('transition', 'none');
        $token.css('transform', `translate3d(${dockStartX + i * dockSpacing + 4}px, ${dockStartY}px, 0)`);
        if (instant) {
          setTimeout(() => {
            $token.css('transition', '');
          }, 30);
        }
      }
    });

    // Position pawns on top of answer cards
    Object.keys(choicePlayers).forEach((choiceIdx) => {
      const cardEl = document.getElementById('choice-' + choiceIdx);
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();
      const list = choicePlayers[choiceIdx];
      const M = list.length;
      const pawnSpacing = 44;
      const pawnsWidth = M * pawnSpacing;
      const cardStartX = (cardRect.left - arenaRect.left) + (cardRect.width - pawnsWidth) / 2;
      const cardStartY = (cardRect.top - arenaRect.top) + (cardRect.height - 84) / 2;

      list.forEach((pId, j) => {
        const $token = playerTokensMap[pId];
        if ($token) {
          if (instant) $token.css('transition', 'none');
          $token.css('transform', `translate3d(${cardStartX + j * pawnSpacing}px, ${cardStartY}px, 0)`);
          if (instant) {
            setTimeout(() => {
              $token.css('transition', '');
            }, 30);
          }
        }
      });
    });
  }

  function syncPawnsForPlayers(rawPlayers, instant) {
    const uniqueMap = new Map();
    (rawPlayers || []).forEach((p) => {
      if (p && p.id && !uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });

    const uniquePlayers = Array.from(uniqueMap.values());
    const studentPlayers = uniquePlayers.filter((p) => p.id !== roomHostId);
    const activePlayers = studentPlayers.length > 0 ? studentPlayers : (isHost ? [] : uniquePlayers);

    const $pawnLayer = $('#popquiz-pawn-layer');
    if (!$pawnLayer.length) return;

    // Remove any stale tokens not present in activePlayers
    Object.keys(playerTokensMap).forEach((pId) => {
      if (!activePlayers.some((p) => p.id === pId)) {
        if (playerTokensMap[pId]) {
          playerTokensMap[pId].remove();
        }
        delete playerTokensMap[pId];
        delete playerPositionsMap[pId];
      }
    });

    activePlayers.forEach((p) => {
      if (!playerTokensMap[p.id]) {
        const $token = createPlayerToken(p, scoresMap[p.id] || 0);
        $pawnLayer.append($token);
        playerTokensMap[p.id] = $token;
        if (playerPositionsMap[p.id] === undefined) {
          playerPositionsMap[p.id] = null;
        }
      } else {
        const $score = playerTokensMap[p.id].find('.popquiz-token-score');
        if ($score.length && scoresMap[p.id] !== undefined) {
          $score.text(scoresMap[p.id]);
        }
      }
    });

    setTimeout(() => {
      updatePawnPositions(Boolean(instant));
    }, 30);
  }

  function mount(options) {
    currentSocket = options.socket;
    currentPlayer = options.player;
    currentRoom = options.room;
    roomHostId = (currentRoom && currentRoom.hostId) ? currentRoom.hostId : null;
    isHost = Boolean(roomHostId && currentPlayer.id === roomHostId);
    isRoundGraded = false;
    scoresMap = {};

    // Clear previous state
    Object.keys(playerTokensMap).forEach((k) => delete playerTokensMap[k]);
    Object.keys(playerPositionsMap).forEach((k) => delete playerPositionsMap[k]);

    $('#popquiz-game-screen').removeClass('d-none');
    $('#popquiz-gameover-screen').addClass('d-none');
    $('#popquiz-round-badge').addClass('d-none').text('');
    $('#popquiz-status').text('Waiting for host to start.');
    $('#popquiz-host-indicator').addClass('d-none');
    $('#popquiz-choices-container').empty();
    $('#popquiz-pawn-layer').empty();

    // Resize listener for keeping pawns perfectly aligned on viewport changes
    $(window).off('resize.popquiz').on('resize.popquiz', function() {
      updatePawnPositions(true);
    });

    // Notify server that player is ready
    currentSocket.emit('popquiz/ready', {
      roomname: currentPlayer.roomname,
      playerId: currentPlayer.id,
      playerNumber: currentPlayer.number,
      color: currentPlayer.color,
      isHost,
      hostId: roomHostId,
      roomPlayers: currentRoom ? currentRoom.players : [currentPlayer],
      questions: options.questions || window.popquizQuestions || null,
    });

    // Handle dynamic player sync when other players connect/ready
    currentSocket.on('popquiz/playersync', function(data) {
      if (data.hostId) roomHostId = data.hostId;
      if (data.scores) scoresMap = data.scores;
      const rawPlayers = data.players || (currentRoom ? currentRoom.players : [currentPlayer]);
      syncPawnsForPlayers(rawPlayers, false);
    });

    // Handle new round
    currentSocket.on('popquiz/roundstart', function(data) {
      isRoundGraded = false;
      roundChoices = data.choices || [];
      scoresMap = data.scores || {};
      if (data.hostId) roomHostId = data.hostId;
      isHost = Boolean(roomHostId && currentPlayer.id === roomHostId);

      const qIndex = (data.questionIndex || 0) + 1;
      const totalQ = data.totalQuestions || 1;

      $('#popquiz-round-badge').removeClass('d-none').text(`Question ${qIndex} of ${totalQ}`);
      $('#popquiz-status').text(isHost ? 'You are the Host: tap the correct answer to grade!' : 'Tap an answer to move your pawn!');

      if (isHost) {
        $('#popquiz-host-indicator').removeClass('d-none');
      } else {
        $('#popquiz-host-indicator').addClass('d-none');
      }

      // Render fixed-size choice cards (text centered, no inner shifting)
      const $container = $('#popquiz-choices-container');
      $container.empty();

      const colClass = roundChoices.length <= 2 ? 'col-sm-6 col-12' : (roundChoices.length <= 4 ? 'col-sm-6 col-md-3 col-12' : 'col-sm-4 col-12');

      roundChoices.forEach((choiceText, index) => {
        const $col = $('<div>', { class: colClass });
        const $card = $('<div>', {
          class: 'popquiz-choice-card w-100',
          id: `choice-${index}`,
          'data-index': index,
        });

        const $text = $('<div>', {
          class: 'popquiz-choice-text',
          text: choiceText,
        });

        $card.append($text);
        $col.append($card);
        $container.append($col);
      });

      // Reset positions to dock for all players on new round start
      Object.keys(playerPositionsMap).forEach((k) => {
        playerPositionsMap[k] = null;
      });

      const rawPlayers = data.players || (currentRoom ? currentRoom.players : [currentPlayer]);
      syncPawnsForPlayers(rawPlayers, true);
    });

    // Handle player choice selection — smooth pawn glide
    currentSocket.on('popquiz/playerselected', function(data) {
      if (data.playerId === roomHostId) return; // Ignore host selections

      playerPositionsMap[data.playerId] = data.choiceIndex;
      updatePawnPositions(false);

      if (data.playerId === currentPlayer.id) {
        $('.popquiz-choice-card').removeClass('popquiz-choice-selected');
        $(`#choice-${data.choiceIndex}`).addClass('popquiz-choice-selected');
      }
    });

    // Handle host grading results
    currentSocket.on('popquiz/graded', function(data) {
      isRoundGraded = true;
      scoresMap = data.scores || {};

      const correctIndex = data.correctChoiceIndex;
      const correctWord = roundChoices[correctIndex] || '';

      $('.popquiz-choice-card').each(function() {
        const idx = Number($(this).data('index'));
        if (idx === correctIndex) {
          $(this).addClass('popquiz-choice-correct');
        } else {
          $(this).addClass('popquiz-choice-incorrect');
        }
      });

      // Update scores and trigger visual +1 pulse
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((res) => {
          const $token = playerTokensMap[res.playerId];
          if ($token && $token.length) {
            const $score = $token.find('.popquiz-token-score');
            $score.text(res.score);
            if (res.correct) {
              $score.addClass('score-plus');
            }
          }
        });
      }

      const safeWord = escapeHtml(correctWord);
      $('#popquiz-status').html(`<span class="text-success fw-extrabold">Correct: ${safeWord}!</span> Loading next question...`);
    });

    // Handle game over / winner podium
    currentSocket.on('popquiz/gameover', function(data) {
      $('#popquiz-game-screen').addClass('d-none');
      $('#popquiz-gameover-screen').removeClass('d-none');
      $('#popquiz-pawn-layer').empty();

      const $winnersContainer = $('#popquiz-winners-container');
      $winnersContainer.empty();

      const winners = data.winners || [];
      const rawLeaderboard = data.leaderboard || [];

      // Deduplicate leaderboard strictly by playerId
      const uniqueLeaderboardMap = new Map();
      rawLeaderboard.forEach((entry) => {
        if (entry && entry.playerId && !uniqueLeaderboardMap.has(entry.playerId) && entry.playerId !== roomHostId) {
          uniqueLeaderboardMap.set(entry.playerId, entry);
        }
      });

      const displayList = Array.from(uniqueLeaderboardMap.values());

      displayList.forEach((entry, i) => {
        const isWinner = winners.some((w) => w.playerId === entry.playerId);
        const playerObj = entry.player || { id: entry.playerId, color: '#0d6efd' };
        const safeColor = sanitizeColor(playerObj.color);
        const initials = getInitials(playerObj.id);

        const $col = $('<div>', { class: 'col-md-3 col-sm-6 col-12' });
        const $card = $('<div>', {
          class: `popquiz-podium-card ${isWinner ? 'popquiz-winner-card' : ''}`,
        });

        const trophyIcon = isWinner ? '<div class="fs-1 mb-2">👑</div>' : `<div class="badge bg-secondary mb-2">#${i + 1}</div>`;
        const pawnSvg = getLargePawnSvg(safeColor);
        const safeId = escapeHtml(playerObj.id);
        const safeInitials = escapeHtml(initials);
        const safeScore = parseInt(entry.score, 10) || 0;

        $card.html(`
          ${trophyIcon}
          <div class="mb-2">${pawnSvg}</div>
          <div class="fs-4 fw-bold mb-1" style="color: ${safeColor}">${safeInitials}</div>
          <div class="small text-muted mb-2">${safeId}</div>
          <div class="fs-5 fw-extrabold text-primary">Score: ${safeScore}</div>
        `);

        $col.append($card);
        $winnersContainer.append($col);
      });
    });

    // Interactive Choice Click
    $(document).on('click', '.popquiz-choice-card', function() {
      if (isRoundGraded) return;
      const choiceIndex = Number($(this).data('index'));

      if (isHost) {
        // Host clicks the correct answer to grade
        currentSocket.emit('popquiz/grade', {
          roomname: currentPlayer.roomname,
          id: currentPlayer.id,
          correctChoiceIndex: choiceIndex,
        });
      } else {
        // Student player selects answer
        currentSocket.emit('popquiz/select', {
          roomname: currentPlayer.roomname,
          playerId: currentPlayer.id,
          playerNumber: currentPlayer.number,
          color: currentPlayer.color,
          choiceIndex,
        });
      }
    });

    // Return to Lobby Button
    $(document).on('click', '#popquiz-finish-btn', function() {
      if (isHost) {
        currentSocket.emit('activityComplete', {
          roomname: currentPlayer.roomname,
          activity: 'popquiz',
        });
      } else {
        currentSocket.emit('leave', currentPlayer);
      }
    });
  }

  function teardown(socket) {
    $(window).off('resize.popquiz');
    $(document).off('click', '.popquiz-choice-card');
    $(document).off('click', '#popquiz-finish-btn');
    if (socket) {
      socket.off('popquiz/roundstart');
      socket.off('popquiz/playerselected');
      socket.off('popquiz/graded');
      socket.off('popquiz/gameover');
      socket.off('popquiz/playersync');
    }
  }

  window.hostedActivities = window.hostedActivities || {};
  window.hostedActivities.popquiz = {
    mount,
    teardown,
  };

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.popquiz = window.hostedActivities.popquiz;
})();
