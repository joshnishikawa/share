/**
 * hosted/activities/raffle.js — Raffle hosted activity (client)
 */

(function() {
  let currentSocket = null;
  let currentPlayer = null;
  let currentRoom = null;
  let isHost = false;
  let currentStage = 'numbers';
  let totalItemsCount = 0;
  let roomEmojis = [];
  let roomValues = [];
  let roomHostId = null;
  let mySelectedNumber = null;
  let mySelectedEmojiIndex = null;

  // Track players and pawn positions
  const playerTokensMap = {};
  const playerPositionsMap = {}; // playerId -> targetCardId (e.g. 'raffle-num-2', 'raffle-emoji-0', 'raffle-flip-0', or null for dock)
  let playersList = [];
  let claimedEmojiMap = {}; // emojiIndex -> playerId

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
      '<svg class="img-fluid raffle-token-pawn" width="32" height="64" viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">' +
      '<path transform="matrix(0.78482373,0,0,0.3410327,-40.6,58)" d="m 54.796244,189.05536 c -12.062025,-20.89204 13.56978,-65.28763 37.693831,-65.28763 24.124055,0 49.755855,44.39559 37.693825,65.28763 -12.06202,20.89204 -63.325631,20.89204 -75.387656,0 z" fill="' + safeColor + '" />' +
      '<path transform="matrix(0.45050681,0,0,0.62867557,3.2,35)" d="m 105,121.60049 c -11.851854,8.65104 -69.62828,8.77896 -81.518324,0.1805 C 11.591632,113.18252 -6.3839294,58.273407 -1.8805296,44.308232 2.6228701,30.343057 49.289789,-3.7205685 63.963086,-3.7530573 78.636384,-3.785546 125.45369,30.071092 130.01888,44.016188 134.58408,57.961284 116.85185,112.94946 105,121.60049 Z" fill="' + safeColor + '" />' +
      '<circle cx="32" cy="22" r="22" fill="' + safeColor + '" />' +
      '</svg>'
    );
  }

  function createPlayerToken(playerObj) {
    const safeColor = sanitizeColor(playerObj.color);
    const initials = getInitials(playerObj.id);

    const $token = $('<div>', {
      class: 'raffle-pawn-token',
      id: 'token-' + String(playerObj.id).replace(/[^a-zA-Z0-9_-]/g, '_'),
      'data-player-id': playerObj.id,
    });

    const $pawn = $(getPawnSvg(safeColor));

    const $initials = $('<div>', {
      class: 'raffle-token-initials',
      text: initials,
      css: { color: safeColor },
    });

    $token.append($pawn, $initials);
    return $token;
  }

  function syncPawnsForPlayers(rawPlayers) {
    const uniqueMap = new Map();
    (rawPlayers || []).forEach((p) => {
      if (p && p.id && !uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });

    if (currentPlayer && currentPlayer.id && !uniqueMap.has(currentPlayer.id)) {
      uniqueMap.set(currentPlayer.id, currentPlayer);
    }

    const uniquePlayers = Array.from(uniqueMap.values());
    const studentPlayers = uniquePlayers.filter((p) => p.id !== roomHostId);
    // Show student pawns if multiple exist, or show all pawns if testing alone
    const activePlayers = studentPlayers.length > 0 ? studentPlayers : uniquePlayers;

    const $pawnLayer = $('#raffle-pawn-layer');
    if (!$pawnLayer.length) return;

    // Remove tokens for inactive players
    Object.keys(playerTokensMap).forEach((pId) => {
      if (!activePlayers.some((p) => p.id === pId)) {
        if (playerTokensMap[pId]) {
          playerTokensMap[pId].remove();
        }
        delete playerTokensMap[pId];
        delete playerPositionsMap[pId];
      }
    });

    // Create tokens for active players
    activePlayers.forEach((p) => {
      if (!playerTokensMap[p.id]) {
        const $token = createPlayerToken(p);
        playerTokensMap[p.id] = $token;
        $pawnLayer.append($token);
      }
      if (playerPositionsMap[p.id] === undefined) {
        playerPositionsMap[p.id] = null;
      }
    });

    setTimeout(() => {
      updatePawnPositions();
    }, 50);
  }

  function updatePawnPositions(instant) {
    const $arena = $('#raffle-arena');
    if (!$arena.length || !$arena.is(':visible')) return;

    const arenaRect = $arena[0].getBoundingClientRect();
    const $dock = $('#raffle-staging-dock');
    if (!$dock.length) return;
    const dockRect = $dock[0].getBoundingClientRect();

    const dockPlayers = [];
    const cardPlayers = {}; // targetElementId -> [playerId]

    Object.keys(playerPositionsMap).forEach((pId) => {
      if (!playerTokensMap[pId]) return;
      const targetId = playerPositionsMap[pId];
      if (!targetId || !document.getElementById(targetId)) {
        dockPlayers.push(pId);
      } else {
        cardPlayers[targetId] = cardPlayers[targetId] || [];
        cardPlayers[targetId].push(pId);
      }
    });

    // 1. Position pawns in the staging dock
    const N = dockPlayers.length;
    const dockSpacing = 52;
    const dockTotalWidth = N * dockSpacing;
    const dockStartX = (dockRect.left - arenaRect.left) + Math.max(0, (dockRect.width - dockTotalWidth) / 2);
    const dockStartY = (dockRect.top - arenaRect.top) + (dockRect.height - 72) / 2;

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

    // 2. Position pawns in the bottom-right of target cards
    Object.keys(cardPlayers).forEach((targetId) => {
      const cardEl = document.getElementById(targetId);
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();
      const list = cardPlayers[targetId];
      const M = list.length;
      const pawnSpacing = 36;
      const pawnsWidth = M * pawnSpacing;
      const rightPadding = 6;
      const bottomPadding = 4;
      const cardStartX = (cardRect.right - arenaRect.left) - pawnsWidth - rightPadding;
      const cardStartY = (cardRect.bottom - arenaRect.top) - 72 - bottomPadding;

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

  function renderNumbersGrid(count) {
    const $container = $('#raffle-numbers-container');
    $container.empty();

    for (let i = 1; i <= count; i++) {
      const $card = $('<div>', {
        class: 'raffle-card raffle-number-card',
        id: `raffle-num-${i}`,
        'data-number': i,
      });

      const $numText = $('<div>', {
        class: 'raffle-card-number',
        text: i,
      });

      $card.append($numText);
      $container.append($card);
    }
  }

  function renderEmojisGrid(emojis) {
    const $container = $('#raffle-emojis-container');
    $container.empty();

    emojis.forEach((emoji, idx) => {
      const $card = $('<div>', {
        class: 'raffle-card raffle-emoji-card',
        id: `raffle-emoji-${idx}`,
        'data-index': idx,
      });

      const $emojiText = $('<div>', {
        class: 'raffle-card-emoji',
        text: emoji,
      });

      $card.append($emojiText);
      $container.append($card);
    });

    updateEmojiCardsUI();
  }

  function updateEmojiCardsUI() {
    $('.raffle-emoji-card').each(function() {
      const idx = $(this).data('index');
      const claimingPlayerId = claimedEmojiMap[idx];

      if (claimingPlayerId) {
        if (currentPlayer && claimingPlayerId === currentPlayer.id) {
          $(this).addClass('selected-by-me').removeClass('claimed-by-other');
        } else {
          $(this).addClass('claimed-by-other').removeClass('selected-by-me');
        }
      } else {
        $(this).removeClass('selected-by-me claimed-by-other');
        if (mySelectedEmojiIndex !== null) {
          $(this).addClass('locked');
        } else {
          $(this).removeClass('locked');
        }
      }
    });
  }

  function renderRevealedCards(shuffledValues, emojis) {
    const $container = $('#raffle-reveal-container');
    $container.empty();

    emojis.forEach((emoji, idx) => {
      const prizeValue = shuffledValues[idx] || '—';
      const claimingPlayerId = claimedEmojiMap[idx];

      const $flipCard = $('<div>', {
        class: 'raffle-flip-card',
        id: `raffle-flip-${idx}`,
      });

      const $inner = $('<div>', { class: 'raffle-flip-inner' });

      // Front face: Emoji
      const $front = $('<div>', { class: 'raffle-flip-front' });
      $front.append($('<div>', { class: 'raffle-card-emoji', text: emoji }));

      // Back face: Revealed Value / Prize
      const $back = $('<div>', {
        class: `raffle-flip-back ${claimingPlayerId ? 'has-winner' : ''}`,
      });
      $back.append($('<div>', { class: 'raffle-revealed-emoji', text: emoji }));
      $back.append($('<div>', { class: 'raffle-revealed-value', text: prizeValue }));

      $inner.append($front, $back);
      $flipCard.append($inner);
      $container.append($flipCard);
    });

    // 3D flip card cascade animation
    setTimeout(() => {
      $('.raffle-flip-card').each(function(i) {
        setTimeout(() => {
          $(this).addClass('is-flipped');
        }, i * 100);
      });
    }, 300);
  }

  function populatePrintTable(results) {
    const $tbody = $('#raffle-results-table-body');
    $tbody.empty();

    if (Array.isArray(results)) {
      results.forEach((row) => {
        const $tr = $('<tr>');
        $tr.append($('<td>', { text: row.playerId || '—' }));
        $tr.append($('<td>', { text: row.selectedNumber !== null ? row.selectedNumber : '—' }));
        $tr.append($('<td>', { text: row.revealedValue || '—' }));
        $tbody.append($tr);
      });
    }
  }

  function setStage(stage) {
    currentStage = stage;
    $('.raffle-screen').addClass('d-none');

    if (stage === 'numbers') {
      $('#raffle-stage-badge').removeClass('bg-warning bg-success').addClass('bg-primary').text('Phase 1: Numbers');
      $('#raffle-status').text(isHost ? 'Guests are choosing numbers. Tap "Set" when ready.' : 'Select a number card!');
      $('#raffle-numbers-screen').removeClass('d-none');

      if (isHost) {
        $('#raffle-top-host-actions').removeClass('d-none');
        $('#raffle-set-btn').removeClass('d-none');
        $('#raffle-go-btn, #raffle-print-btn').addClass('d-none');
      } else {
        $('#raffle-top-host-actions').addClass('d-none');
      }
    } else if (stage === 'emojis') {
      $('#raffle-stage-badge').removeClass('bg-primary bg-success').addClass('bg-warning text-dark').text('Phase 2: Emojis');
      $('#raffle-status').text(isHost ? 'Guests are picking emojis. Tap "GO!" to reveal prizes.' : (mySelectedEmojiIndex !== null ? 'Emoji selected! Waiting for reveal...' : 'Pick an emoji! (One per guest)'));
      $('#raffle-emojis-screen').removeClass('d-none');

      if (isHost) {
        $('#raffle-top-host-actions').removeClass('d-none');
        $('#raffle-go-btn').removeClass('d-none');
        $('#raffle-set-btn, #raffle-print-btn').addClass('d-none');
      } else {
        $('#raffle-top-host-actions').addClass('d-none');
      }
    } else if (stage === 'revealed') {
      $('#raffle-stage-badge').removeClass('bg-primary bg-warning text-dark').addClass('bg-success').text('Phase 3: Results');
      $('#raffle-status').text('🎉 Prizes Revealed!');
      $('#raffle-reveal-screen').removeClass('d-none');

      if (isHost) {
        $('#raffle-top-host-actions').removeClass('d-none');
        $('#raffle-print-btn').removeClass('d-none');
        $('#raffle-set-btn, #raffle-go-btn').addClass('d-none');
      } else {
        $('#raffle-top-host-actions').addClass('d-none');
      }
    }

    setTimeout(() => {
      updatePawnPositions();
    }, 50);
  }

  function mount(options) {
    currentSocket = options.socket;
    currentPlayer = options.player;
    currentRoom = options.room;
    roomHostId = (currentRoom && currentRoom.hostId) ? currentRoom.hostId : null;
    isHost = Boolean(
      (roomHostId && currentPlayer && currentPlayer.id === roomHostId) ||
      (currentRoom && Array.isArray(currentRoom.players) && currentRoom.players.length > 0 && currentRoom.players[0].id === (currentPlayer && currentPlayer.id)) ||
      (currentPlayer && currentPlayer.isHost)
    );

    currentStage = 'numbers';
    mySelectedNumber = null;
    mySelectedEmojiIndex = null;
    claimedEmojiMap = {};
    playersList = (currentRoom && Array.isArray(currentRoom.players)) ? currentRoom.players : [];

    // Clear pawn maps
    Object.keys(playerTokensMap).forEach((id) => {
      playerTokensMap[id].remove();
      delete playerTokensMap[id];
    });
    Object.keys(playerPositionsMap).forEach((id) => {
      delete playerPositionsMap[id];
    });

    if (isHost) {
      $('#raffle-host-badge').removeClass('d-none');
      $('#raffle-top-host-actions').removeClass('d-none');
    } else {
      $('#raffle-host-badge').addClass('d-none');
      $('#raffle-top-host-actions').addClass('d-none');
    }

    // Parse options.values
    let valuesArray = null;
    if (options.values) {
      if (Array.isArray(options.values)) {
        valuesArray = options.values;
      } else if (typeof options.values === 'string') {
        valuesArray = options.values.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Resize listener for pawn positions
    $(window).off('resize.raffle').on('resize.raffle', function() {
      updatePawnPositions(true);
    });

    // Socket Event Handlers
    currentSocket.on('raffle/sync', function(data) {
      if (!data) return;
      totalItemsCount = data.totalCount || 0;
      roomEmojis = data.emojis || [];
      if (data.hostId) {
        roomHostId = data.hostId;
      }
      if (roomHostId && currentPlayer) {
        isHost = Boolean(currentPlayer.id === roomHostId);
      } else if (currentRoom && Array.isArray(currentRoom.players) && currentRoom.players.length > 0 && currentRoom.players[0].id === (currentPlayer && currentPlayer.id)) {
        isHost = true;
      }

      playersList = data.players || playersList;
      claimedEmojiMap = data.claimedEmojis || {};

      if (isHost) {
        $('#raffle-host-badge').removeClass('d-none');
        $('#raffle-top-host-actions').removeClass('d-none');
      } else {
        $('#raffle-host-badge').addClass('d-none');
        $('#raffle-top-host-actions').addClass('d-none');
      }

      if (data.stage === 'numbers') {
        renderNumbersGrid(totalItemsCount);
        if (data.numberSelections) {
          Object.keys(data.numberSelections).forEach((pId) => {
            const num = data.numberSelections[pId];
            playerPositionsMap[pId] = num ? `raffle-num-${num}` : null;
          });
        }
      } else if (data.stage === 'emojis') {
        renderEmojisGrid(roomEmojis);
        if (data.claimedEmojis) {
          Object.keys(data.claimedEmojis).forEach((idx) => {
            const pId = data.claimedEmojis[idx];
            playerPositionsMap[pId] = `raffle-emoji-${idx}`;
          });
        }
      } else if (data.stage === 'revealed' && data.values) {
        roomValues = data.values;
        renderRevealedCards(data.values, roomEmojis);
        if (data.claimedEmojis) {
          Object.keys(data.claimedEmojis).forEach((idx) => {
            const pId = data.claimedEmojis[idx];
            playerPositionsMap[pId] = `raffle-flip-${idx}`;
          });
        }
      }

      syncPawnsForPlayers(playersList);
      setStage(data.stage);
    });

    currentSocket.on('raffle/numberSelected', function(data) {
      if (!data) return;
      playerPositionsMap[data.playerId] = data.number ? `raffle-num-${data.number}` : null;

      $('.raffle-number-card').removeClass('selected-by-me');
      if (currentPlayer && data.playerId === currentPlayer.id) {
        mySelectedNumber = data.number;
        $(`#raffle-num-${data.number}`).addClass('selected-by-me');
      }

      updatePawnPositions();
    });

    currentSocket.on('raffle/stageChanged', function(data) {
      if (!data) return;
      roomEmojis = data.emojis || roomEmojis;
      totalItemsCount = data.totalCount || totalItemsCount;

      if (data.stage === 'emojis') {
        // Reset all pawns to dock for phase 2
        Object.keys(playerPositionsMap).forEach((pId) => {
          playerPositionsMap[pId] = null;
        });
        renderEmojisGrid(roomEmojis);
      }

      setStage(data.stage);
    });

    currentSocket.on('raffle/emojiSelected', function(data) {
      if (!data) return;
      claimedEmojiMap[data.emojiIndex] = data.playerId;
      playerPositionsMap[data.playerId] = `raffle-emoji-${data.emojiIndex}`;

      if (data.player && !playersList.some((p) => p.id === data.playerId)) {
        playersList.push(data.player);
        syncPawnsForPlayers(playersList);
      }

      if (currentPlayer && data.playerId === currentPlayer.id) {
        mySelectedEmojiIndex = data.emojiIndex;
        $('#raffle-status').text('Emoji selected! Waiting for reveal...');
      }

      updateEmojiCardsUI();
      updatePawnPositions();
    });

    currentSocket.on('raffle/revealed', function(data) {
      if (!data) return;
      roomValues = data.shuffledValues;
      claimedEmojiMap = data.claimedEmojis || claimedEmojiMap;

      renderRevealedCards(data.shuffledValues, data.emojis || roomEmojis);

      // Move pawns to flip cards
      Object.keys(claimedEmojiMap).forEach((idx) => {
        const pId = claimedEmojiMap[idx];
        playerPositionsMap[pId] = `raffle-flip-${idx}`;
      });

      populatePrintTable(data.results);
      setStage('revealed');
    });

    // Emit ready signal
    currentSocket.emit('raffle/ready', {
      roomname: currentPlayer.roomname,
      playerId: currentPlayer.id,
      playerNumber: currentPlayer.number,
      color: currentPlayer.color,
      isHost: isHost,
      values: valuesArray,
      roomPlayers: currentRoom ? currentRoom.players : [],
    });

    // Initial pawn sync
    syncPawnsForPlayers(playersList);

    // DOM Handlers
    // 1. Select Number (Phase 1)
    $(document).off('click.raffle', '.raffle-number-card').on('click.raffle', '.raffle-number-card', function() {
      if (currentStage !== 'numbers') return;
      const num = $(this).data('number');
      mySelectedNumber = num;

      currentSocket.emit('raffle/selectNumber', {
        roomname: currentPlayer.roomname,
        playerId: currentPlayer.id,
        number: num,
      });
    });

    // 2. Set Numbers (Host Click at top)
    $(document).off('click.raffle', '#raffle-set-btn').on('click.raffle', '#raffle-set-btn', function() {
      if (!isHost || currentStage !== 'numbers') return;
      currentSocket.emit('raffle/setNumbers', {
        roomname: currentPlayer.roomname,
        id: currentPlayer.id,
      });
    });

    // 3. Select Emoji (Phase 2)
    $(document).off('click.raffle', '.raffle-emoji-card').on('click.raffle', '.raffle-emoji-card', function() {
      if (currentStage !== 'emojis') return;
      if (mySelectedEmojiIndex !== null) return;

      const idx = $(this).data('index');
      if (claimedEmojiMap[idx]) return;

      currentSocket.emit('raffle/selectEmoji', {
        roomname: currentPlayer.roomname,
        playerId: currentPlayer.id,
        playerNumber: currentPlayer.number,
        color: currentPlayer.color,
        emojiIndex: idx,
      });
    });

    // 4. GO! Reveal (Host Click at top)
    $(document).off('click.raffle', '#raffle-go-btn').on('click.raffle', '#raffle-go-btn', function() {
      if (!isHost || currentStage !== 'emojis') return;
      currentSocket.emit('raffle/reveal', {
        roomname: currentPlayer.roomname,
        id: currentPlayer.id,
      });
    });

    // 5. Print Results Table (Host Click at top)
    $(document).off('click.raffle', '#raffle-print-btn').on('click.raffle', '#raffle-print-btn', function() {
      window.print();
    });
  }

  function teardown(socket) {
    $(window).off('resize.raffle');
    $(document).off('.raffle');
    if (socket) {
      socket.off('raffle/sync');
      socket.off('raffle/numberSelected');
      socket.off('raffle/stageChanged');
      socket.off('raffle/emojiSelected');
      socket.off('raffle/revealed');
    }
  }

  window.hostedActivities = window.hostedActivities || {};
  window.hostedActivities.raffle = {
    mount,
    teardown,
  };

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.raffle = window.hostedActivities.raffle;
})();
