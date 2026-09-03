/**
 * lobby/hosted/common.js — Shared utilities for hosted activities' Phase 1 (Number Selection Screen)
 */
(function() {
  window.hostedNumbers = {
    /**
     * Render responsive screen-filling numbers grid
     */
    renderGrid: function($container, count, options) {
      if (!$container || !$container.length) return;
      options = options || {};
      const idPrefix = options.idPrefix || 'hosted';
      const cardClass = options.cardClass || `${idPrefix}-card ${idPrefix}-number-card`;
      const textClass = options.textClass || `${idPrefix}-number-text`;

      $container.empty();

      if (count <= 6) {
        $container.css('grid-template-columns', 'repeat(auto-fit, minmax(140px, 1fr))');
      } else if (count <= 16) {
        $container.css('grid-template-columns', 'repeat(auto-fill, minmax(110px, 1fr))');
      } else {
        $container.css('grid-template-columns', 'repeat(auto-fill, minmax(88px, 1fr))');
      }

      for (let i = 1; i <= count; i++) {
        const $card = $('<div>', {
          class: `card hosted-card hosted-number-card ${cardClass} shadow-sm border-2 rounded-4 text-center d-flex align-items-center justify-content-center bg-white`,
          id: `${idPrefix}-num-${i}`,
          'data-number': i,
        });

        const $numText = $('<div>', {
          class: `hosted-number-text ${textClass}`,
          text: i,
        });

        $card.append($numText);
        $container.append($card);
      }

      this.updateCardsUI($container, options.numberSelectionsMap || {}, options);
    },

    /**
     * Update card muted appearance based on current selections
     */
    updateCardsUI: function($container, numberSelectionsMap, options) {
      if (!$container || !$container.length) return;
      options = options || {};
      const selector = options.cardSelector || '.hosted-number-card';

      const selectedNums = new Set();
      if (numberSelectionsMap && typeof numberSelectionsMap === 'object') {
        Object.keys(numberSelectionsMap).forEach((pId) => {
          const n = numberSelectionsMap[pId];
          if (n) selectedNums.add(n);
        });
      }

      $container.find(selector).each(function() {
        const num = $(this).data('number');
        if (selectedNums.has(num)) {
          $(this).addClass('card-muted');
        } else {
          $(this).removeClass('card-muted');
        }
      });
    },

    /**
     * Generate HTML for host's item count editor
     */
    renderHostCountControl: function(count, idPrefix) {
      const prefix = idPrefix || 'hosted';
      return `
        <div id="${prefix}-count-control" class="hosted-count-control d-flex align-items-center gap-1 me-1">
          <label for="${prefix}-total-count-input" class="small fw-bold text-secondary mb-0 text-nowrap">Items:</label>
          <input type="number" id="${prefix}-total-count-input" class="form-control form-control-sm text-center fw-bold shadow-sm hosted-total-count-input" style="width: 70px;" min="1" max="200" value="${count || 1}" title="Number of items to display" />
        </div>
      `;
    },

    /**
     * Bind input and change events for the host item count editor
     */
    bindHostCountInput: function(inputSelector, isHostFn, getStageFn, onCountChange) {
      let debounceTimer = null;
      $(document).off('input change', inputSelector).on('input change', inputSelector, function(e) {
        if (typeof isHostFn === 'function' && !isHostFn()) return;
        if (typeof getStageFn === 'function' && getStageFn() !== 'numbers') return;

        const val = parseInt($(this).val(), 10);
        if (isNaN(val) || val < 1) return;

        clearTimeout(debounceTimer);
        if (e.type === 'change') {
          if (typeof onCountChange === 'function') onCountChange(val);
        } else {
          debounceTimer = setTimeout(() => {
            if (typeof onCountChange === 'function') onCountChange(val);
          }, 400);
        }
      });
    },

    /**
     * Wrap pawns neatly in multiple rows inside the staging dock
     */
    positionDockPawns: function($arena, $dock, playerTokensMap, dockPlayers, instant) {
      if (!$arena || !$arena.length || !$dock || !$dock.length) return;
      const arenaRect = $arena[0].getBoundingClientRect();
      const dockRect = $dock[0].getBoundingClientRect();

      const N = dockPlayers.length;
      if (N === 0) return;

      const dockW = dockRect.width;
      const dockPawnW = N > 24 ? 34 : (N > 14 ? 38 : 44);
      const dockPawnH = 40;
      const maxDockCols = Math.max(1, Math.floor((dockW - 20) / dockPawnW));
      const dockCols = Math.min(maxDockCols, N);
      const dockRows = Math.ceil(N / (dockCols || 1));

      const neededDockHeight = Math.max(80, (dockRows - 1) * dockPawnH + 80);
      $dock.css('min-height', neededDockHeight + 'px');

      const dockStartY = (dockRect.top - arenaRect.top) + Math.max(4, (dockRect.height - ((dockRows - 1) * dockPawnH + 75)) / 2);

      dockPlayers.forEach((pId, i) => {
        const $token = playerTokensMap[pId];
        if ($token) {
          const rowIndex = Math.floor(i / (dockCols || 1));
          const colIndex = i % (dockCols || 1);
          const itemsInThisRow = Math.min(dockCols, N - rowIndex * dockCols);
          const rowWidth = (itemsInThisRow - 1) * dockPawnW + 44;
          const rowStartX = (dockRect.left - arenaRect.left) + (dockRect.width - rowWidth) / 2;

          const posX = rowStartX + colIndex * dockPawnW;
          const posY = dockStartY + rowIndex * dockPawnH;

          $token.css('z-index', 20 + rowIndex);
          if (instant) $token.css('transition', 'none');
          $token.css('transform', `translate3d(${posX}px, ${posY}px, 0)`);
          if (instant) {
            setTimeout(() => {
              $token.css('transition', '');
            }, 30);
          }
        }
      });
    },

    /**
     * Wrap / center pawns on number cards
     */
    positionNumberCardPawns: function(arenaRect, cardEl, list, playerTokensMap, instant) {
      if (!cardEl || !list || !list.length) return;
      const cardRect = cardEl.getBoundingClientRect();
      const M = list.length;
      const cardW = cardRect.width;
      const cardH = cardRect.height;
      const pawnSpacingX = 36;
      const maxCols = Math.max(1, Math.floor((cardW - 10) / pawnSpacingX));
      const cols = Math.min(maxCols, M);
      const rows = Math.ceil(M / (cols || 1));
      const pawnSpacingY = 36;

      const startY = (cardRect.top - arenaRect.top) + Math.max(2, (cardH - ((rows - 1) * pawnSpacingY + 70)) / 2);

      list.forEach((pId, j) => {
        const $token = playerTokensMap[pId];
        if (!$token) return;

        const rowIndex = Math.floor(j / (cols || 1));
        const colIndex = j % (cols || 1);
        const itemsInThisRow = Math.min(cols, M - rowIndex * cols);
        const rowWidth = (itemsInThisRow - 1) * pawnSpacingX + 44;
        const rowStartX = (cardRect.left - arenaRect.left) + (cardW - rowWidth) / 2;

        const posX = rowStartX + colIndex * pawnSpacingX;
        const posY = startY + rowIndex * pawnSpacingY;

        $token.css('z-index', 25 + rowIndex);
        if (instant) $token.css('transition', 'none');
        $token.css('transform', `translate3d(${posX}px, ${posY}px, 0)`);
        if (instant) {
          setTimeout(() => {
            $token.css('transition', '');
          }, 30);
        }
      });
    }
  };
})();
