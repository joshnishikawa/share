/**
 * lobby/hosted/vote.js — Vote hosted activity (client)
 */

(function() {
  let currentSocket = null;
  let currentPlayer = null;
  let currentRoom = null;
  let isHost = false;
  let currentStage = 'numbers';
  let totalItemsCount = 0;
  let roomValues = [];
  let roomHostId = null;
  let mySelectedNumber = null;
  let aggregateTotals = [];
  let resultsMatrix = [];

  // Track players and pawn positions for Phase 1
  const playerTokensMap = {};
  const playerPositionsMap = {}; // playerId -> targetCardId (e.g. 'vote-num-2', or null for dock)
  let playersList = [];
  let numberSelectionsMap = {}; // playerId -> number

  // Phase 2: 5 Big Stars for Guest
  // starAssignments: array of length 5, each element is either null (in dock) or itemIndex (0..N-1)
  const starAssignments = [null, null, null, null, null];
  const starElements = [];

  // Chart instance
  let hostChartInstance = null;

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
      '<svg class="img-fluid vote-token-pawn" width="32" height="64" viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">' +
      '<path transform="matrix(0.78482373,0,0,0.3410327,-40.6,58)" d="m 54.796244,189.05536 c -12.062025,-20.89204 13.56978,-65.28763 37.693831,-65.28763 24.124055,0 49.755855,44.39559 37.693825,65.28763 -12.06202,20.89204 -63.325631,20.89204 -75.387656,0 z" fill="' + safeColor + '" />' +
      '<path transform="matrix(0.45050681,0,0,0.62867557,3.2,35)" d="m 105,121.60049 c -11.851854,8.65104 -69.62828,8.77896 -81.518324,0.1805 C 11.591632,113.18252 -6.3839294,58.273407 -1.8805296,44.308232 2.6228701,30.343057 49.289789,-3.7205685 63.963086,-3.7530573 78.636384,-3.785546 125.45369,30.071092 130.01888,44.016188 134.58408,57.961284 116.85185,112.94946 105,121.60049 Z" fill="' + safeColor + '" />' +
      '<circle cx="32" cy="22" r="22" fill="' + safeColor + '" />' +
      '</svg>'
    );
  }

  function getBigStarSvg() {
    return (
      '<svg class="vote-big-star" width="48" height="48" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" stroke-width="1" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
      '</svg>'
    );
  }

  function createPlayerToken(playerObj) {
    const safeColor = sanitizeColor(playerObj.color);
    const initials = getInitials(playerObj.id);

    const $token = $('<div>', {
      class: 'vote-pawn-token',
      id: 'token-' + String(playerObj.id).replace(/[^a-zA-Z0-9_-]/g, '_'),
      'data-player-id': playerObj.id,
    });

    const $pawn = $(getPawnSvg(safeColor));

    const $initials = $('<div>', {
      class: 'vote-token-initials',
      text: initials,
      css: { color: safeColor },
    });

    $token.append($pawn, $initials);
    return $token;
  }

  function syncPawnsForPlayers(rawPlayers) {
    if (currentStage !== 'numbers') {
      $('#vote-pawn-layer').empty();
      return;
    }

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
    const activePlayers = studentPlayers;

    const $pawnLayer = $('#vote-pawn-layer');
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
    if (currentStage !== 'numbers') return;
    const $arena = $('#vote-arena');
    if (!$arena.length || !$arena.is(':visible')) return;

    const arenaRect = $arena[0].getBoundingClientRect();
    const $dock = $('#vote-staging-dock');
    if (!$dock.length) return;
    const dockRect = $dock[0].getBoundingClientRect();

    const dockPlayers = [];
    const cardPlayers = {};

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

    // 2. Position pawns in target cards
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
    const $container = $('#vote-numbers-container');
    $container.empty();

    for (let i = 1; i <= count; i++) {
      const $col = $('<div>', { class: 'col' });
      const $card = $('<div>', {
        class: 'card vote-card vote-number-card h-100 shadow-sm border-2 rounded-4 text-center d-flex align-items-center justify-content-center bg-white',
        id: `vote-num-${i}`,
        'data-number': i,
      });

      const $numText = $('<div>', {
        class: 'fs-1 fw-bold text-dark lh-1',
        text: i,
      });

      $card.append($numText);
      $col.append($card);
      $container.append($col);
    }

    updateNumberCardsUI();
  }

  function updateNumberCardsUI() {
    const selectedNums = new Set();
    Object.keys(numberSelectionsMap).forEach((pId) => {
      const n = numberSelectionsMap[pId];
      if (n) selectedNums.add(n);
    });

    $('.vote-number-card').each(function() {
      const num = $(this).data('number');
      if (selectedNums.has(num)) {
        $(this).addClass('card-muted');
      } else {
        $(this).removeClass('card-muted');
      }
    });
  }

  // --- Phase 2: Star Token Management & Smooth Gliding ---
  function initStarTokens() {
    const $starLayer = $('#vote-star-layer');
    $starLayer.empty();
    starElements.length = 0;

    for (let i = 0; i < 5; i++) {
      const $star = $('<div>', {
        class: 'vote-star-token',
        id: `vote-star-${i}`,
        'data-star-index': i,
        html: getBigStarSvg(),
      });
      $starLayer.append($star);
      starElements.push($star);
    }
  }

  function updateStarPositions(instant) {
    if (isHost || currentStage !== 'voting') return;
    const $arena = $('#vote-arena');
    if (!$arena.length || !$arena.is(':visible')) return;

    const arenaRect = $arena[0].getBoundingClientRect();
    const $dock = $('#vote-star-dock');
    if (!$dock.length) return;
    const dockRect = $dock[0].getBoundingClientRect();

    const dockStars = [];
    const cardStars = {}; // itemIndex -> [starIndex]

    starAssignments.forEach((itemIdx, starIdx) => {
      if (itemIdx === null || !document.getElementById(`vote-item-${itemIdx}`)) {
        dockStars.push(starIdx);
      } else {
        cardStars[itemIdx] = cardStars[itemIdx] || [];
        cardStars[itemIdx].push(starIdx);
      }
    });

    // 1. Position stars in the reserve dock
    const N = dockStars.length;
    const starWidth = 50;
    const dockSpacing = 64;
    const dockTotalWidth = N * dockSpacing;
    const dockStartX = (dockRect.left - arenaRect.left) + Math.max(0, (dockRect.width - dockTotalWidth) / 2);
    const dockStartY = (dockRect.top - arenaRect.top) + (dockRect.height - starWidth) / 2;

    dockStars.forEach((starIdx, i) => {
      const $token = starElements[starIdx];
      if ($token) {
        if (instant) $token.css('transition', 'none');
        $token.css('transform', `translate3d(${dockStartX + i * dockSpacing + 7}px, ${dockStartY}px, 0)`);
        if (instant) {
          setTimeout(() => {
            $token.css('transition', '');
          }, 30);
        }
      }
    });

    // 2. Position stars inside target item cards
    Object.keys(cardStars).forEach((itemIdx) => {
      const cardEl = document.getElementById(`vote-item-${itemIdx}`);
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();
      const starsOnThisCard = cardStars[itemIdx];
      const M = starsOnThisCard.length;
      const itemStarSpacing = 40;
      const totalStarsWidth = (M - 1) * itemStarSpacing + starWidth;
      const cardStartX = (cardRect.left - arenaRect.left) + Math.max(0, (cardRect.width - totalStarsWidth) / 2);
      const cardStartY = (cardRect.bottom - arenaRect.top) - starWidth - 14;

      starsOnThisCard.forEach((starIdx, j) => {
        const $token = starElements[starIdx];
        if ($token) {
          if (instant) $token.css('transition', 'none');
          $token.css('transform', `translate3d(${cardStartX + j * itemStarSpacing}px, ${cardStartY}px, 0)`);
          if (instant) {
            setTimeout(() => {
              $token.css('transition', '');
            }, 30);
          }
        }
      });
    });
  }

  function renderGuestVotingGrid() {
    const $container = $('#vote-items-container');
    $container.empty();

    roomValues.forEach((val, idx) => {
      const $col = $('<div>', { class: 'col' });
      const $card = $('<div>', {
        class: 'card vote-card vote-item-card h-100 shadow-sm border-2 rounded-4 p-3 d-flex flex-column align-items-center justify-content-start bg-white',
        id: `vote-item-${idx}`,
        'data-item-index': idx,
      });

      const $title = $('<div>', {
        class: 'fs-4 fw-bold text-dark text-center text-break mt-2',
        text: val,
      });

      $card.append($title);
      $col.append($card);
      $container.append($col);
    });

    setTimeout(() => {
      updateStarPositions();
    }, 50);
  }

  function getVotesObject() {
    const votesObj = {};
    starAssignments.forEach((itemIdx) => {
      if (itemIdx !== null && itemIdx >= 0) {
        votesObj[itemIdx] = (votesObj[itemIdx] || 0) + 1;
      }
    });
    return votesObj;
  }

  /**
   * Syncs star assignments with incoming target votes.
   * INVARIANT: Stars only ever move from reserve to item (null -> item)
   * or from item to reserve (item -> null). Stars NEVER move item to item.
   */
  function syncStarsFromUserVotes(userVotesObj) {
    const targetCounts = {};
    roomValues.forEach((_, idx) => {
      targetCounts[idx] = (userVotesObj && parseInt(userVotesObj[idx], 10)) || 0;
    });

    const currentCounts = {};
    roomValues.forEach((_, idx) => {
      currentCounts[idx] = 0;
    });
    starAssignments.forEach((assignedItem) => {
      if (assignedItem !== null && currentCounts[assignedItem] !== undefined) {
        currentCounts[assignedItem]++;
      }
    });

    // 1. Return excess stars to reserve (item -> null)
    roomValues.forEach((_, itemIdx) => {
      while (currentCounts[itemIdx] > targetCounts[itemIdx]) {
        const s = starAssignments.findIndex((assigned) => assigned === itemIdx);
        if (s !== -1) {
          starAssignments[s] = null;
          currentCounts[itemIdx]--;
        } else {
          break;
        }
      }
    });

    // 2. Move needed stars from reserve to item (null -> item)
    roomValues.forEach((_, itemIdx) => {
      while (currentCounts[itemIdx] < targetCounts[itemIdx]) {
        const s = starAssignments.findIndex((assigned) => assigned === null);
        if (s !== -1) {
          starAssignments[s] = itemIdx;
          currentCounts[itemIdx]++;
        } else {
          break;
        }
      }
    });

    updateStarPositions();
  }

  function moveStarToItem(itemIdx) {
    if (isHost || currentStage !== 'voting') return;
    // Strictly find a star currently in the reserve dock
    const freeStarIdx = starAssignments.indexOf(null);
    if (freeStarIdx === -1) return; // No stars in reserve; do not move stars between items

    starAssignments[freeStarIdx] = itemIdx;
    updateStarPositions();

    currentSocket.emit('vote/setPlayerVotes', {
      roomname: currentPlayer.roomname,
      playerId: currentPlayer.id,
      votes: getVotesObject(),
    });
  }

  function returnStarToReserve(starIdx) {
    if (isHost || currentStage !== 'voting') return;
    if (starAssignments[starIdx] === null) return; // Already in reserve

    starAssignments[starIdx] = null;
    updateStarPositions();

    currentSocket.emit('vote/setPlayerVotes', {
      roomname: currentPlayer.roomname,
      playerId: currentPlayer.id,
      votes: getVotesObject(),
    });
  }

  // --- Phase 2: Host Chart View ---
  function updateHostVotingView() {
    renderHostChart();
    populatePrintReport();
  }

  function renderHostChart() {
    const canvas = document.getElementById('vote-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = roomValues;
    const data = roomValues.map((_, idx) => (aggregateTotals && aggregateTotals[idx]) || 0);

    if (hostChartInstance) {
      hostChartInstance.data.labels = labels;
      hostChartInstance.data.datasets[0].data = data;
      hostChartInstance.update();
    } else {
      const ctx = canvas.getContext('2d');
      hostChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Stars',
            data: data,
            backgroundColor: 'rgba(13, 110, 253, 0.8)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 2,
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  return `${val} ${val === 1 ? 'star' : 'stars'}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                stepSize: 1,
                font: { size: 14, weight: 'bold' },
              },
              grid: {
                color: 'rgba(0,0,0,0.06)',
              },
            },
            x: {
              ticks: {
                font: { size: 14, weight: 'bold' },
              },
              grid: { display: false },
            },
          },
        },
      });
    }
  }

  function generatePrintChartSvg(values, totals) {
    const width = 640;
    const height = 240;
    const paddingBottom = 45;
    const paddingTop = 35;
    const paddingLeft = 35;
    const paddingRight = 35;
    const chartHeight = height - paddingTop - paddingBottom;
    const chartWidth = width - paddingLeft - paddingRight;

    const maxVal = Math.max(1, ...totals);
    const n = (values && values.length > 0) ? values.length : 1;
    const slotWidth = chartWidth / n;
    const barWidth = Math.min(64, slotWidth * 0.65);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="240" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">`;
    svg += `<rect width="${width}" height="${height}" fill="#f8fafc" rx="8"/>`;

    const baselineY = height - paddingBottom;
    svg += `<line x1="${paddingLeft}" y1="${baselineY}" x2="${width - paddingRight}" y2="${baselineY}" stroke="#94a3b8" stroke-width="2"/>`;

    values.forEach((val, i) => {
      const count = (totals && totals[i]) || 0;
      const barH = count > 0 ? Math.max(8, (count / maxVal) * chartHeight) : 4;
      const barX = paddingLeft + i * slotWidth + (slotWidth - barWidth) / 2;
      const barY = baselineY - barH;
      const label = val.length > 16 ? val.substring(0, 14) + '…' : val;

      svg += `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barH}" fill="${count > 0 ? '#2563eb' : '#cbd5e1'}" rx="5"/>`;

      if (count > 0) {
        svg += `<text x="${barX + barWidth / 2}" y="${barY - 8}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">★ ${count}</text>`;
      } else {
        svg += `<text x="${barX + barWidth / 2}" y="${barY - 8}" text-anchor="middle" font-size="12" fill="#94a3b8">0</text>`;
      }

      svg += `<text x="${barX + barWidth / 2}" y="${baselineY + 22}" text-anchor="middle" font-size="13" font-weight="600" fill="#334155">${escapeHtml(label)}</text>`;
    });

    svg += `</svg>`;
    return svg;
  }

  function populatePrintReport() {
    $('#vote-print-meta').text(`Room: ${currentPlayer ? currentPlayer.roomname : ''} | Generated: ${new Date().toLocaleString()}`);

    // Render standalone vector SVG chart into print container
    const printSvgHtml = generatePrintChartSvg(roomValues, aggregateTotals);
    $('#vote-print-chart-container').html(printSvgHtml);

    // Print Results Matrix Table
    const $thead = $('#vote-results-table-head');
    const $tbody = $('#vote-results-table-body');
    $thead.empty();
    $tbody.empty();

    const $headerRow = $('<tr>');
    $headerRow.append($('<th>', { text: 'Student / Player', class: 'text-start' }));
    roomValues.forEach((val) => {
      $headerRow.append($('<th>', { text: val, class: 'text-center' }));
    });
    $headerRow.append($('<th>', { text: 'Total Stars', class: 'text-center' }));
    $thead.append($headerRow);

    if (Array.isArray(resultsMatrix)) {
      resultsMatrix.forEach((row) => {
        const $tr = $('<tr>');
        $tr.append($('<td>', { text: row.playerId || '—', class: 'fw-bold text-start' }));
        roomValues.forEach((_, idx) => {
          const stars = (row.itemVotes && row.itemVotes[idx]) ? row.itemVotes[idx] : 0;
          $tr.append($('<td>', {
            text: stars > 0 ? `${stars} ⭐` : '—',
            class: 'text-center',
          }));
        });
        $tr.append($('<td>', {
          text: row.totalStars || 0,
          class: 'fw-bold text-center',
        }));
        $tbody.append($tr);
      });
    }
  }

  function setStatus(text) {
    $('#activityStatus, #vote-status').text(text);
  }

  function renderTopControls() {
    $('#activityControls').html(`
      <div id="vote-top-host-actions" class="${isHost ? 'd-flex' : 'd-none'} align-items-center gap-2">
        <button id="vote-set-btn" class="btn btn-primary btn-sm px-4 fw-bold shadow-sm" style="min-width: 80px;">
          Next
        </button>
        <button id="vote-print-btn" class="btn btn-dark btn-sm px-4 fw-bold shadow-sm d-none d-inline-flex align-items-center justify-content-center gap-1" style="min-width: 80px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="align-middle">
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
          </svg>
          <span>Print</span>
        </button>
      </div>
    `);
  }

  function setStage(stage) {
    currentStage = stage;
    $('.vote-screen').addClass('d-none');

    if (stage === 'numbers') {
      setStatus(isHost ? 'Guests are choosing numbers. Tap "Next" when ready to start voting.' : 'Select a number card!');
      $('#vote-numbers-screen').removeClass('d-none');
      $('#vote-voting-screen').addClass('d-none');

      if (isHost) {
        $('#vote-arena').addClass('host-view');
        if ($('#vote-top-host-actions').length === 0) renderTopControls();
        $('#vote-top-host-actions').removeClass('d-none').addClass('d-flex');
        $('#vote-set-btn').removeClass('d-none');
        $('#vote-print-btn').addClass('d-none');
      } else {
        $('#vote-arena').removeClass('host-view');
        $('#vote-top-host-actions').addClass('d-none').removeClass('d-flex');
      }
    } else if (stage === 'voting') {
      setStatus(isHost ? 'Live Vote Distribution' : 'Place your stars!');
      $('#vote-numbers-screen').addClass('d-none');
      $('#vote-voting-screen').removeClass('d-none');
      $('#vote-pawn-layer').empty();

      if (isHost) {
        $('#vote-guest-view').addClass('d-none');
        $('#vote-host-view').removeClass('d-none');
        $('#vote-star-layer').empty();
        if ($('#vote-top-host-actions').length === 0) renderTopControls();
        $('#vote-top-host-actions').removeClass('d-none').addClass('d-flex');
        $('#vote-set-btn').addClass('d-none');
        $('#vote-print-btn').removeClass('d-none');
        updateHostVotingView();
      } else {
        $('#vote-host-view').addClass('d-none');
        $('#vote-guest-view').removeClass('d-none');
        $('#vote-top-host-actions').addClass('d-none').removeClass('d-flex');
        if (starElements.length === 0) initStarTokens();
        renderGuestVotingGrid();
      }
    }

    setTimeout(() => {
      if (currentStage === 'numbers') updatePawnPositions();
      if (currentStage === 'voting' && !isHost) updateStarPositions();
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
    for (let i = 0; i < 5; i++) starAssignments[i] = null;
    aggregateTotals = [];
    resultsMatrix = [];
    playersList = (currentRoom && Array.isArray(currentRoom.players)) ? currentRoom.players : [];

    renderTopControls();
    setStage('numbers');

    // Clear pawn maps and star elements
    Object.keys(playerTokensMap).forEach((id) => {
      playerTokensMap[id].remove();
      delete playerTokensMap[id];
    });
    Object.keys(playerPositionsMap).forEach((id) => {
      delete playerPositionsMap[id];
    });
    starElements.length = 0;

    // Parse options.values
    let valuesArray = null;
    if (options.values) {
      if (Array.isArray(options.values)) {
        valuesArray = options.values;
      } else if (typeof options.values === 'string') {
        valuesArray = options.values.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (valuesArray && valuesArray.length > 0) {
      roomValues = valuesArray;
    }

    // Resize and print listeners
    $(window).off('resize.vote').on('resize.vote', function() {
      if (currentStage === 'numbers') {
        updatePawnPositions(true);
      } else if (currentStage === 'voting' && !isHost) {
        updateStarPositions(true);
      }
    });

    window.addEventListener('beforeprint', populatePrintReport);

    // Socket Event Handlers
    currentSocket.on('setColor', function(data) {
      if (!data) return;
      if (currentPlayer && (data.number === currentPlayer.number || data.id === currentPlayer.id)) {
        currentPlayer.color = data.color;
      }
    });

    currentSocket.on('vote/sync', function(data) {
      if (!data) return;
      totalItemsCount = data.totalCount || (data.values ? data.values.length : 0);
      roomValues = data.values || roomValues;
      if (data.hostId) {
        roomHostId = data.hostId;
      }
      if (roomHostId && currentPlayer) {
        isHost = Boolean(currentPlayer.id === roomHostId);
      } else if (currentRoom && Array.isArray(currentRoom.players) && currentRoom.players.length > 0 && currentRoom.players[0].id === (currentPlayer && currentPlayer.id)) {
        isHost = true;
      }

      playersList = data.players || playersList;
      aggregateTotals = data.totals || new Array(roomValues.length).fill(0);
      resultsMatrix = data.results || resultsMatrix;

      if (isHost) {
        $('#vote-arena').addClass('host-view');
        if ($('#vote-top-host-actions').length === 0) renderTopControls();
        $('#vote-top-host-actions').removeClass('d-none').addClass('d-flex');
      } else {
        $('#vote-arena').removeClass('host-view');
        $('#vote-top-host-actions').addClass('d-none').removeClass('d-flex');
      }

      if (data.stage === 'numbers') {
        if (data.numberSelections) {
          numberSelectionsMap = data.numberSelections;
          Object.keys(data.numberSelections).forEach((pId) => {
            const num = data.numberSelections[pId];
            playerPositionsMap[pId] = num ? `vote-num-${num}` : null;
          });
        }
        renderNumbersGrid(totalItemsCount);
        syncPawnsForPlayers(playersList);
      } else if (data.stage === 'voting') {
        if (isHost) {
          updateHostVotingView();
        } else {
          if (starElements.length === 0) initStarTokens();
          renderGuestVotingGrid();
          if (data.userVotes && currentPlayer && data.userVotes[currentPlayer.id]) {
            syncStarsFromUserVotes(data.userVotes[currentPlayer.id]);
          }
        }
      }

      setStage(data.stage);
    });

    currentSocket.on('vote/numberSelected', function(data) {
      if (!data) return;
      numberSelectionsMap[data.playerId] = data.number;
      playerPositionsMap[data.playerId] = data.number ? `vote-num-${data.number}` : null;

      if (currentPlayer && data.playerId === currentPlayer.id) {
        mySelectedNumber = data.number;
      }

      updateNumberCardsUI();
      updatePawnPositions();
    });

    currentSocket.on('vote/stageChanged', function(data) {
      if (!data) return;
      roomValues = data.values || roomValues;
      totalItemsCount = data.totalCount || totalItemsCount;
      aggregateTotals = data.totals || new Array(roomValues.length).fill(0);
      setStage(data.stage);
    });

    currentSocket.on('vote/votesUpdated', function(data) {
      if (!data) return;
      aggregateTotals = data.totals || aggregateTotals;
      resultsMatrix = data.results || resultsMatrix;

      if (isHost) {
        updateHostVotingView();
      } else {
        if (data.userVotes && currentPlayer && data.userVotes[currentPlayer.id]) {
          syncStarsFromUserVotes(data.userVotes[currentPlayer.id]);
        }
      }
    });

    // Emit ready signal
    currentSocket.emit('vote/ready', {
      roomname: currentPlayer.roomname,
      playerId: currentPlayer.id,
      playerNumber: currentPlayer.number,
      color: currentPlayer.color,
      isHost: isHost,
      values: valuesArray || (window.voteValues || null),
      roomPlayers: currentRoom ? currentRoom.players : [],
    });

    if (currentStage === 'numbers') {
      syncPawnsForPlayers(playersList);
    }

    // DOM Handlers
    // 1. Select Number (Phase 1)
    $(document).off('click.vote', '.vote-number-card').on('click.vote', '.vote-number-card', function() {
      if (isHost || currentStage !== 'numbers') return;
      const num = $(this).data('number');
      mySelectedNumber = num;

      currentSocket.emit('vote/selectNumber', {
        roomname: currentPlayer.roomname,
        playerId: currentPlayer.id,
        number: num,
      });
    });

    // 2. Set Numbers (Host Click Next)
    $(document).off('click.vote', '#vote-set-btn').on('click.vote', '#vote-set-btn', function() {
      if (!isHost || currentStage !== 'numbers') return;
      currentSocket.emit('vote/setNumbers', {
        roomname: currentPlayer.roomname,
        id: currentPlayer.id,
      });
    });

    // 3. Guest Voting Click Handlers (Phase 2)
    // Clicking an item card moves an available star from reserve to that item
    $(document).off('click.vote', '.vote-item-card').on('click.vote', '.vote-item-card', function() {
      const idx = $(this).data('item-index');
      moveStarToItem(idx);
    });

    // Clicking directly on a star moves it back to the reserve dock
    $(document).off('click.vote', '.vote-star-token').on('click.vote', '.vote-star-token', function(e) {
      e.stopPropagation();
      const starIdx = $(this).data('star-index');
      returnStarToReserve(starIdx);
    });

    // 4. Print Results Button
    $(document).off('click.vote', '#vote-print-btn').on('click.vote', '#vote-print-btn', function() {
      populatePrintReport();
      setTimeout(() => {
        window.print();
      }, 50);
    });
  }

  function teardown(socket) {
    $(window).off('resize.vote');
    window.removeEventListener('beforeprint', populatePrintReport);
    $(document).off('.vote');
    $('#activityStatus').empty();
    $('#activityControls').empty();
    if (hostChartInstance) {
      hostChartInstance.destroy();
      hostChartInstance = null;
    }
    if (socket) {
      socket.off('setColor');
      socket.off('vote/sync');
      socket.off('vote/numberSelected');
      socket.off('vote/stageChanged');
      socket.off('vote/votesUpdated');
    }
  }

  window.hostedActivities = window.hostedActivities || {};
  window.hostedActivities.vote = {
    mount,
    teardown,
  };

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.vote = window.hostedActivities.vote;
})();
