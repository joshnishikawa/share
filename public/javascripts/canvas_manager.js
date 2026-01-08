/**
 * Canvas Manager - Modal UI for managing canvas snapshots
 * Handles grid display, add/delete/clone operations
 */

function CanvasManager(canvasBuilder) {
  const builder = canvasBuilder;

  // Open the canvas manager modal
  this.open = function() {
    const modal = $("#canvasManagerModal");
    const grid = $("#canvasGrid");
    grid.empty();

    const canvases = builder.getCanvases();
    const currentIndex = builder.getCurrentIndex();

    // Add button
    const addBtn = $(`
      <div class="canvas-grid-item canvas-action-btn ${canvases.length >= 10 ? 'disabled' : ''}" id="addCanvasBtn">
        <i class="material-icons" style="font-size:48px;color:green;">add_circle</i>
        <div>Add</div>
      </div>
    `);
    grid.append(addBtn);

    // Delete button - second item
    const deleteBtn = $(`
      <div class="canvas-grid-item canvas-action-btn" id="deleteCanvasBtn">
        <i class="material-icons" style="font-size:48px;color:red;">delete</i>
        <div>Delete</div>
      </div>
    `);
    grid.append(deleteBtn);

    // Render saved canvases
    canvases.forEach((canvas, index) => {
      const snapshot = $(`
        <div class="canvas-grid-item canvas-snapshot ${index === currentIndex ? 'active' : ''}" 
             data-index="${index}">
          <div class="canvas-thumbnail"></div>
        </div>
      `);
      
      // Create thumbnail - use saved thumbnail if available, otherwise generate from html
      const thumb = snapshot.find('.canvas-thumbnail');
      if (canvas.thumbnail) {
        thumb.html(canvas.thumbnail);
      } else {
        const tempDiv = $('<div>').html(canvas.html).css({
          transform: 'scale(0.1)',
          transformOrigin: 'top left',
          width: '1000%',
          height: '1000%',
          pointerEvents: 'none'
        });
        thumb.append(tempDiv);
      }
      
      grid.append(snapshot);
    });

    setupEventHandlers();
    modal.modal('show');
  };

  // Setup all modal event handlers
  function setupEventHandlers() {
    let draggedSnapshot = null;
    let draggedIndex = null;

    // Add canvas button
    $("#addCanvasBtn").on("click", function() {
      const canvases = builder.getCanvases();
      if (canvases.length < 10) {
        builder.addNewCanvas();
        $("#canvasManagerModal").modal('hide');
      }
    });

    // Click snapshot to load
    $(".canvas-snapshot").on("click", function() {
      const index = parseInt($(this).attr("data-index"));
      builder.switchToCanvas(index);
      $("#canvasManagerModal").modal('hide');
    });

    // Drag to clone or delete snapshots
    $(".canvas-snapshot").on("mousedown touchstart", function(e) {
      e.preventDefault();
      draggedSnapshot = $(this);
      draggedIndex = parseInt(draggedSnapshot.attr("data-index"));
      
      const touch = e.type === 'touchstart' ? e.originalEvent.touches[0] : e;
      const startX = touch.clientX;
      const startY = touch.clientY;
      const offset = draggedSnapshot.offset();
      const offsetX = startX - offset.left;
      const offsetY = startY - offset.top;
      
      let hasMoved = false;
      let clone = null;

      const moveHandler = function(e) {
        const touch = e.type === 'touchmove' ? e.originalEvent.touches[0] : e;
        const distance = Math.sqrt(Math.pow(touch.clientX - startX, 2) + Math.pow(touch.clientY - startY, 2));
        
        // Only start dragging if moved more than 10px
        if (!hasMoved && distance > 10) {
          hasMoved = true;
          draggedSnapshot.addClass('dragging');
          
          // Enable delete button during drag
          $("#deleteCanvasBtn").addClass('drag-active');
          
          // Disable hover on all snapshots during drag
          $(".canvas-snapshot").addClass('no-hover');
          
          // Create a visual copy for dragging
          clone = draggedSnapshot.clone().addClass('drag-clone').css({
            position: 'fixed',
            left: touch.clientX - offsetX,
            top: touch.clientY - offsetY,
            opacity: 0.8,
            zIndex: 10000
          });
          $('body').append(clone);
        }
        
        if (!hasMoved) return;
        
        clone.css({
          left: touch.clientX - offsetX,
          top: touch.clientY - offsetY
        });

        // Check if over add button
        const addBtn = $("#addCanvasBtn");
        const addBounds = addBtn[0].getBoundingClientRect();
        const canvases = builder.getCanvases();
        if (touch.clientX >= addBounds.left && touch.clientX <= addBounds.right &&
            touch.clientY >= addBounds.top && touch.clientY <= addBounds.bottom &&
            canvases.length < 10) {
          addBtn.addClass('add-active');
        } else {
          addBtn.removeClass('add-active');
        }

        // Check if over delete button
        const deleteBtn = $("#deleteCanvasBtn");
        const deleteBounds = deleteBtn[0].getBoundingClientRect();
        if (touch.clientX >= deleteBounds.left && touch.clientX <= deleteBounds.right &&
            touch.clientY >= deleteBounds.top && touch.clientY <= deleteBounds.bottom) {
          deleteBtn.addClass('delete-active');
        } else {
          deleteBtn.removeClass('delete-active');
        }
      };

      const upHandler = function(e) {
        $(document).off('mousemove touchmove', moveHandler);
        $(document).off('mouseup touchend', upHandler);
        
        // If it was just a tap (not dragged), trigger click to load canvas
        if (!hasMoved) {
          const index = parseInt(draggedSnapshot.attr("data-index"));
          builder.switchToCanvas(index);
          $("#canvasManagerModal").modal('hide');
          draggedSnapshot = null;
          draggedIndex = null;
          return;
        }
        
        const touch = e.type === 'touchend' ? e.originalEvent.changedTouches[0] : e;
        
        // Check if dropped on add button to clone
        const addBtn = $("#addCanvasBtn");
        const addBounds = addBtn[0].getBoundingClientRect();
        const canvases = builder.getCanvases();
        if (touch.clientX >= addBounds.left && touch.clientX <= addBounds.right &&
            touch.clientY >= addBounds.top && touch.clientY <= addBounds.bottom &&
            canvases.length < 10) {
          // Clone the canvas
          builder.cloneCanvas(draggedIndex);
          
          // Clean up drag state
          if (clone) clone.remove();
          draggedSnapshot.removeClass('dragging');
          const deleteBtn = $("#deleteCanvasBtn");
          deleteBtn.removeClass('delete-active');
          deleteBtn.removeClass('drag-active');
          addBtn.removeClass('add-active');
          $(".canvas-snapshot").removeClass('no-hover');
          
          // Add the new snapshot to the grid immediately
          const newCanvases = builder.getCanvases();
          const clonedCanvas = newCanvases[newCanvases.length - 1];
          const newSnapshot = $(`
            <div class="canvas-grid-item canvas-snapshot" data-index="${newCanvases.length - 1}">
              <div class="canvas-thumbnail"></div>
            </div>
          `);
          
          // Create thumbnail - use saved thumbnail if available
          const thumb = newSnapshot.find('.canvas-thumbnail');
          if (clonedCanvas.thumbnail) {
            thumb.html(clonedCanvas.thumbnail);
          } else {
            const tempDiv = $('<div>').html(clonedCanvas.html).css({
              transform: 'scale(0.1)',
              transformOrigin: 'top left',
              width: '1000%',
              height: '1000%',
              pointerEvents: 'none'
            });
            thumb.append(tempDiv);
          }
          
          $("#canvasGrid").append(newSnapshot);
          
          // Re-setup handlers for the new snapshot
          setupEventHandlers();
          
          draggedSnapshot = null;
          draggedIndex = null;
          return;
        }
        
        // Check if dropped on delete button
        const deleteBtn = $("#deleteCanvasBtn");
        const deleteBounds = deleteBtn[0].getBoundingClientRect();
        if (touch.clientX >= deleteBounds.left && touch.clientX <= deleteBounds.right &&
            touch.clientY >= deleteBounds.top && touch.clientY <= deleteBounds.bottom &&
            canvases.length > 1) {
          // Delete the canvas
          builder.deleteCanvas(draggedIndex);
        }

        if (clone) clone.remove();
        draggedSnapshot.removeClass('dragging');
        deleteBtn.removeClass('delete-active');
        deleteBtn.removeClass('drag-active');
        $("#addCanvasBtn").removeClass('add-active');
        $(".canvas-snapshot").removeClass('no-hover');
        draggedSnapshot = null;
        draggedIndex = null;
        
        // Refresh modal after delete
        const manager = new CanvasManager(builder);
        manager.open();
      };

      $(document).on('mousemove touchmove', moveHandler);
      $(document).on('mouseup touchend', upHandler);
    });
  }
}
