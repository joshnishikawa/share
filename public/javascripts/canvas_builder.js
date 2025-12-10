/**
 * Canvas Builder - Reusable drag-and-drop canvas system
 * Supports pinch/rotate, z-index management, delete-by-drag, and save/load
 */

function CanvasBuilder(options) {
  // Configuration with defaults
  const config = {
    storageKey: options.storageKey || 'canvas',
    itemSelector: options.itemSelector || '.item',
    menuContainerId: options.menuContainerId || 'itemMenu',
    canvasId: options.canvasId || 'canvas',
    canvasItemClass: options.canvasItemClass || 'canvas-item',
    colorableSelector: options.colorableSelector || null, // SVG elements to recolor
    minScale: options.minScale || 0.5,
    maxScale: options.maxScale || 3.0,
    onItemAdded: options.onItemAdded || null, // Callback when item added to canvas
    savePromptText: options.savePromptText || 'Enter a name for this canvas:',
    enableScale: options.enableScale !== undefined ? options.enableScale : true,
    enableRotate: options.enableRotate !== undefined ? options.enableRotate : true,
    enableDragHandles: options.enableDragHandles !== undefined ? options.enableDragHandles : false,
    dragHandleShapes: options.dragHandleShapes || [] // Array of shape types that get drag handles
  };

  // Internal state
  let canvases = {};
  let workingCanvas = "";
  let z = 1; // Z-index counter
  let isDraggingHandle = false;
  let tapHandlerActive = false;

  // Initialize
  this.init = function() {
    loadFromStorage();
    setupEventHandlers();
    setupMenuDragging();
  };

  // Load canvases from localStorage
  function loadFromStorage() {
    if (localStorage.getItem(config.storageKey)) {
      canvases = JSON.parse(localStorage.getItem(config.storageKey));
      if (canvases.default) {
        workingCanvas = "default";
        $(`#${config.canvasId}`).html(canvases.default);
        $(`#${config.canvasId} .${config.canvasItemClass}`).each(function () {
          makeTouchable($(this));
          // Ensure drag handles are properly scaled after loading
          const handle = $(this).find('.drag-handle');
          if (handle.length > 0) {
            const currentScale = getScale($(this));
            handle.css('transform', `scale(${1 / currentScale})`);
          }
        });
      } else {
        $(`#${config.canvasId}`).html("");
      }
    } else {
      canvases.default = "";
      workingCanvas = "default";
      localStorage.setItem(config.storageKey, JSON.stringify(canvases));
    }

    // Populate load canvas dropdown
    for (let canvas in canvases) {
      $("#loadCanvas").append(`<option value="${canvas}">${canvas}</option>`);
    }
  }

  // Save current canvas to localStorage
  function saveToStorage() {
    if (workingCanvas === "default") {
      canvases.default = $(`#${config.canvasId}`).html();
      localStorage.setItem(config.storageKey, JSON.stringify(canvases));
    }
  }

  // Setup event handlers
  function setupEventHandlers() {
    // Load canvas
    $("#loadCanvas").on("change", function () {
      workingCanvas = $(this).val();
      $(`#${config.canvasId}`).html(canvases[workingCanvas]);
      $(`#${config.canvasId} .${config.canvasItemClass}`).each(function () {
        makeTouchable($(this));
        // Ensure drag handles are properly scaled after loading
        const handle = $(this).find('.drag-handle');
        if (handle.length > 0) {
          const currentScale = getScale($(this));
          handle.css('transform', `scale(${1 / currentScale})`);
        }
      });
    });

    // Save canvas
    $("#saveCanvas").on("click", function () {
      let name = prompt(config.savePromptText);
      if (name) {
        workingCanvas = name;
        canvases["default"] = "";
        canvases[workingCanvas] = $(`#${config.canvasId}`).html();
        localStorage.setItem(config.storageKey, JSON.stringify(canvases));
        $("#loadCanvas").append(`<option value="${name}">${name}</option>`);
        $("#loadCanvas").val(name);
      }
    });

    // Clear canvas
    $("#clearCanvas").on("click", function () {
      $("#clearCanvasModal").modal("show");
    });

    $("#clearCanvasConfirm").on("click", function () {
      if (workingCanvas === "default") {
        canvases.default = "";
      } else {
        delete canvases[workingCanvas];
        $(`#loadCanvas option[value="${workingCanvas}"]`).remove();
        workingCanvas = "default";
        $("#loadCanvas").val("default");
      }

      $(`#${config.canvasId}`).empty();
      localStorage.setItem(config.storageKey, JSON.stringify(canvases));
      z = 1;
      $("#clearCanvasModal").modal("hide");
    });

    // Delete key
    $(document).on("keydown", function (event) {
      if (event.key === "Delete") {
        $(`.${config.canvasItemClass}.selected`).remove();
        saveToStorage();
      }
    });

    // Tap vs drag detection for selection
    $(`#${config.canvasId}`).on("mousedown touchstart", `.${config.canvasItemClass}`, function(e) {
      if (tapHandlerActive) return;
      tapHandlerActive = true;

      const item = $(this);
      const startX = e.clientX || (e.originalEvent.touches && e.originalEvent.touches[0].clientX);
      const startY = e.clientY || (e.originalEvent.touches && e.originalEvent.touches[0].clientY);
      let hasMoved = false;

      const moveHandler = function(e) {
        const currentX = e.clientX || (e.originalEvent.touches && e.originalEvent.touches[0].clientX);
        const currentY = e.clientY || (e.originalEvent.touches && e.originalEvent.touches[0].clientY);
        const distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        if (distance > 5) {
          hasMoved = true;
        }
      };

      const upHandler = function() {
        $(document).off('mousemove touchmove', moveHandler);
        $(document).off('mouseup touchend', upHandler);

        setSelected.call(item[0], !hasMoved);

        setTimeout(function() {
          tapHandlerActive = false;
        }, 100);
      };

      $(document).on('mousemove touchmove', moveHandler);
      $(document).on('mouseup touchend', upHandler);
    });

    // Deselect when clicking canvas background
    $(`#${config.canvasId}`).on("mousedown", function (event) {
      if (event.target.id === config.canvasId && !isDraggingHandle) {
        $(`.${config.canvasItemClass}`).removeClass("selected");
        $(".drag-handle").remove();
      }
    });

    // Prevent context menu
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  }

  // Setup menu dragging
  function setupMenuDragging() {
    const menuElement = document.getElementById(config.menuContainerId);
    if (!menuElement) return;

    let activeClone = null;
    let isDraggingFromMenu = false;

    // Use direct touch/mouse events for immediate response
    $(menuElement).on('mousedown touchstart', config.itemSelector, function(e) {
      e.preventDefault();
      
      const item = $(this);
      const touch = e.type === 'touchstart' ? e.originalEvent.touches[0] : e;
      
      // Create clone immediately
      $(`.${config.canvasItemClass}`).removeClass("selected");
      const clone = item.clone().removeClass(config.itemSelector.substring(1)).addClass(`${config.canvasItemClass} selected`);
      
      // Remove colorable class from cloned elements to prevent color changes on canvas
      if (config.colorableSelector) {
        const className = config.colorableSelector.startsWith('.') 
          ? config.colorableSelector.substring(1) 
          : config.colorableSelector;
        clone.find('*').removeClass(className);
      }
      
      $(`#${config.canvasId}`).append(clone);
      makeTouchable(clone);
      activeClone = clone;
      isDraggingFromMenu = true;

      const canvasOffset = $(`#${config.canvasId}`).offset();
      const menuOffset = $(menuElement).offset();
      
      // Calculate the touch position relative to the menu item
      const itemOffset = item.offset();
      const touchOffsetX = touch.clientX - itemOffset.left;
      const touchOffsetY = touch.clientY - itemOffset.top;

      clone.css({
        position: 'absolute',
        left: touch.clientX - canvasOffset.left - touchOffsetX,
        top: touch.clientY - canvasOffset.top - touchOffsetY,
        'z-index': z++
      });

      // Call onItemAdded callback if provided
      if (config.onItemAdded) {
        config.onItemAdded(clone);
      }

      $(".drag-handle").remove();

      // Handle move
      const moveHandler = function(e) {
        if (!activeClone) return;
        const touch = e.type === 'touchmove' ? e.originalEvent.touches[0] : e;
        
        const canvasOffset = $(`#${config.canvasId}`).offset();

        activeClone.css({
          left: touch.clientX - canvasOffset.left - touchOffsetX,
          top: touch.clientY - canvasOffset.top - touchOffsetY,
          transform: `scale(1) rotate(0deg)`
        });
      };

      // Handle end
      const endHandler = function() {
        $(document).off('mousemove touchmove', moveHandler);
        $(document).off('mouseup touchend', endHandler);
        activeClone = null;
        isDraggingFromMenu = false;
        saveToStorage();
      };

      $(document).on('mousemove touchmove', moveHandler);
      $(document).on('mouseup touchend', endHandler);
    });
  }

  // Set item as selected
  function setSelected(reorderZIndex) {
    $(`.${config.canvasItemClass}`).removeClass("selected");
    $(this).addClass("selected");
    $(".drag-handle").remove();

    // Add drag handle back to selected shape if applicable
    if (config.enableDragHandles) {
      const selectedShape = $(this);
      const shapeType = selectedShape.attr("data-shape");
      if (config.dragHandleShapes.includes(shapeType)) {
        if (selectedShape.find('.drag-handle').length === 0) {
          const currentScale = getScale(selectedShape);
          const handle = $('<div class="drag-handle"></div>');
          handle.css('transform', `scale(${1 / currentScale})`);
          selectedShape.append(handle);
        }
      }
    }

    // Only reorder z-index if this is a tap
    if (reorderZIndex) {
      const currentZ = parseInt($(this).css("z-index")) || 0;
      const maxZ = Math.max(...$(`.${config.canvasItemClass}`).map(function() { 
        return parseInt($(this).css("z-index")) || 0; 
      }).get());

      if (currentZ === maxZ && maxZ > 1) {
        // Already on top, move to bottom
        $(this).css("z-index", 1);
        $(`.${config.canvasItemClass}`).not(this).each(function() {
          const itemZ = parseInt($(this).css("z-index")) || 0;
          if (itemZ > 0) {
            $(this).css("z-index", itemZ + 1);
          }
        });
        z = maxZ + 1;
      } else {
        // Move to top
        $(this).css("z-index", z++);
      }
    }
  }

  // Utility functions
  function getRotationAngle(element) {
    const matrix = element.css('transform');
    if (matrix !== 'none') {
      const values = matrix.split('(')[1].split(')')[0].split(',');
      const a = values[0];
      const b = values[1];
      return Math.round(Math.atan2(b, a) * (180 / Math.PI));
    }
    return 0;
  }

  function getScale(element) {
    const matrix = element.css('transform');
    if (matrix !== 'none') {
      const values = matrix.split('(')[1].split(')')[0].split(',');
      const a = values[0];
      const b = values[1];
      return Math.sqrt(a * a + b * b);
    }
    return 1;
  }

  function touchToDegrees(initial, current) {
    let delta = current - initial;
    return (delta + 180) % 360 - 180;
  }

  // Make item draggable and pinchable
  function makeTouchable(item) {
    const mc = new Hammer(item[0]);
    let scale = 1;
    let lastScale = 1;
    let itemRotation = 0;
    let startingTouchRotation = 0;
    let initialLeft = 0;
    let initialTop = 0;

    mc.get('pinch').set({ enable: config.enableScale });
    mc.get('rotate').set({ enable: false });

    mc.on("panstart", function (e) {
      if (isDraggingHandle) return;
      initialLeft = parseInt(item.css("left"), 10) || 0;
      initialTop = parseInt(item.css("top"), 10) || 0;
    });

    mc.on("panmove", function (e) {
      if (isDraggingHandle) return;
      const dx = e.deltaX;
      const dy = e.deltaY;
      item.css({
        left: `${initialLeft + dx}px`,
        top: `${initialTop + dy}px`,
      });
    });

    mc.on("panend", function () {
      if (isDraggingHandle) return;

      // Remove if dragged off left edge
      if (parseInt(item.css("left")) <= 0) {
        item.remove();
        saveToStorage();
      }
    });

    if (config.enableScale || config.enableRotate) {
      mc.on("pinchstart", function (ev) {
        startingTouchRotation = ev.rotation;
        itemRotation = getRotationAngle(item);
      });

      mc.on("pinchmove", function (ev) {
        let transformParts = [];
        
        if (config.enableScale) {
          scale = Math.max(config.minScale, Math.min(lastScale * ev.scale, config.maxScale));
          transformParts.push(`scale(${scale})`);
        }
        
        if (config.enableRotate) {
          let newItemRotation = touchToDegrees(startingTouchRotation, ev.rotation) + itemRotation;
          newItemRotation = parseInt(newItemRotation);
          transformParts.push(`rotate(${newItemRotation}deg)`);
        }
        
        item.css({
          transform: transformParts.join(' '),
        });

        // Counter-scale drag handle if present
        if (config.enableDragHandles) {
          const dragHandle = item.find('.drag-handle');
          if (dragHandle.length > 0) {
            dragHandle.css({
              transform: `scale(${1 / scale})`
            });
          }
        }
      });

      mc.on("pinchend", function (ev) {
        if (config.enableScale) {
          lastScale *= ev.scale;
        }
        saveToStorage();
      });
    }
  }

  // Public methods
  this.setColorableElements = function(color) {
    if (config.colorableSelector) {
      // Split the selector and scope each part to the menu
      const selectors = config.colorableSelector.split(',').map(s => 
        `#${config.menuContainerId} ${config.itemSelector} ${s.trim()}`
      ).join(', ');
      $(selectors).attr('fill', color);
    }
  };

  this.getIsDraggingHandle = function() {
    return isDraggingHandle;
  };

  this.setIsDraggingHandle = function(value) {
    isDraggingHandle = value;
  };

  this.saveToStorage = saveToStorage;
  this.getScale = getScale;
  this.getRotationAngle = getRotationAngle;
}
