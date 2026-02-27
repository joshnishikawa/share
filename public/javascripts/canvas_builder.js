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
    onCanvasLoaded: options.onCanvasLoaded || null, // Callback when canvas is loaded
    savePromptText: options.savePromptText || 'Enter a name for this canvas:',
    enableScale: options.enableScale !== undefined ? options.enableScale : true,
    enableRotate: options.enableRotate !== undefined ? options.enableRotate : true,
    enableDragHandles: options.enableDragHandles !== undefined ? options.enableDragHandles : false,
    dragHandleShapes: options.dragHandleShapes || [] // Array of shape types that get drag handles
  };

  // Internal state
  let savedCanvases = []; // Array of saved canvas snapshots
  let currentCanvasIndex = 0; // Index of currently active canvas
  let z = 1000; // Z-index counter
  let isDraggingHandle = false;
  let tapHandlerActive = false;
  const self = this; // Reference for passing to CanvasManager

  // Initialize
  this.init = function() {
    loadFromStorage();
    setupEventHandlers();
    setupMenuDragging();
  };

  // Migrate old object-based storage to new array format
  function migrateOldStorage(data) {
    // Check if data is an object (not array) with canvas properties
    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      const migratedArray = [];
      
      // Convert each saved canvas from object to array format
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          migratedArray.push({
            html: data[key],
            timestamp: Date.now() // Use current timestamp since old format didn't have it
          });
        }
      }
      
      // Sort to ensure consistent order (alphabetically by original key name)
      // This maintains some consistency with the old dropdown order
      return migratedArray.length > 0 ? migratedArray : [{ html: "", timestamp: Date.now() }];
    }
    
    // Already in array format or invalid data
    return data;
  }

  // Load canvases from localStorage
  function loadFromStorage() {
    if (localStorage.getItem(config.storageKey)) {
      let data = JSON.parse(localStorage.getItem(config.storageKey));
      
      // Migrate old format if needed
      data = migrateOldStorage(data);
      
      savedCanvases = Array.isArray(data) ? data : [];
      
      if (savedCanvases.length === 0) {
        // Create first blank canvas
        savedCanvases.push({ html: "", timestamp: Date.now() });
        currentCanvasIndex = 0;
      }
      
      // Save migrated data back to storage
      localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
      
      // Load the current canvas
      loadCanvas(currentCanvasIndex);
    } else {
      // Initialize with one blank canvas
      savedCanvases = [{ html: "", timestamp: Date.now() }];
      currentCanvasIndex = 0;
      localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
    }
  }

  // Load a specific canvas by index
  function loadCanvas(index) {
    if (index >= 0 && index < savedCanvases.length) {
      currentCanvasIndex = index;
      $(`#${config.canvasId}`).html(savedCanvases[index].html);
      $(`#${config.canvasId} .${config.canvasItemClass}`).each(function () {
        makeTouchable($(this));
        // Ensure drag handles are properly scaled after loading
        const handle = $(this).find('.drag-handle');
        if (handle.length > 0) {
          const currentScale = getScale($(this));
          handle.css('transform', `scale(${1 / currentScale})`);
        }
      });
      
      // Call onCanvasLoaded callback if provided
      if (config.onCanvasLoaded) {
        config.onCanvasLoaded();
      }
    }
  }

  // Generate thumbnail using Canvas API with async image loading
  async function generateThumbnailAsync() {
    try {
      const canvasElement = $(`#${config.canvasId}`);
      
      // Use canvas fixed dimensions (1366x768)
      const fullWidth = 1366;
      const fullHeight = 768;
      
      // Scale down to create smaller thumbnails (max 300px width)
      const maxWidth = 300;
      const scale = Math.min(1, maxWidth / fullWidth);
      const width = Math.floor(fullWidth * scale);
      const height = Math.floor(fullHeight * scale);
      
      // Create offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Scale context for all drawing operations
      ctx.scale(scale, scale);
      
      // Fill background color first
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, fullWidth, fullHeight);
      
      // Get background image from canvas element
      const bgImage = canvasElement.css('background-image');
      
      // Draw background image
      if (bgImage && bgImage !== 'none') {
        const bgUrl = bgImage.replace(/url\(["']?([^"']+)["']?\)/g, '$1');

        try {
          await new Promise((resolve, reject) => {
            const bgImg = new Image();
            bgImg.crossOrigin = 'anonymous';
            bgImg.onload = () => {
              ctx.drawImage(bgImg, 0, 0, fullWidth, fullHeight);
              resolve();
            };
            bgImg.onerror = () => resolve(); // Continue even if bg fails
            bgImg.src = bgUrl;
            // Timeout after 1 second
            setTimeout(() => resolve(), 1000);
          });
        } catch (e) {
          console.warn('Background image failed to load');
        }
      }
      
      // Draw each canvas object sorted by z-index (lowest to highest)
      const objects = canvasElement.find(`.${config.canvasItemClass}`).toArray();
      objects.sort((a, b) => {
        const zIndexA = parseInt($(a).css('z-index')) || 0;
        const zIndexB = parseInt($(b).css('z-index')) || 0;
        return zIndexA - zIndexB;
      });
      
      for (const obj of objects) {
        const $obj = $(obj);
        const left = parseFloat($obj.css('left')) || 0;
        const top = parseFloat($obj.css('top')) || 0;
        const objWidth = $obj.width();
        const objHeight = $obj.height();
        const transform = $obj.css('transform');
        const transformOrigin = $obj.css('transform-origin');
        
        // Get the inner SVG
        const innerSvg = $obj.find('svg')[0];
        if (innerSvg) {
          ctx.save();
          
          // Apply position transform
          ctx.translate(left, top);
          
          // Parse transform origin (default is '50% 50%' or 'center center')
          let originX = objWidth / 2;
          let originY = objHeight / 2;
          
          if (transformOrigin && transformOrigin !== 'none') {
            const parts = transformOrigin.split(' ');
            if (parts.length >= 2) {
              // Handle pixel values or percentages
              if (parts[0].includes('px')) {
                originX = parseFloat(parts[0]);
              } else if (parts[0].includes('%')) {
                originX = (parseFloat(parts[0]) / 100) * objWidth;
              }
              if (parts[1].includes('px')) {
                originY = parseFloat(parts[1]);
              } else if (parts[1].includes('%')) {
                originY = (parseFloat(parts[1]) / 100) * objHeight;
              }
            }
          }
          
          // Translate to transform origin
          ctx.translate(originX, originY);
          
          // Apply rotation/scale transform if exists
          if (transform && transform !== 'none') {
            const matrix = transform.match(/matrix\(([^)]+)\)/);
            if (matrix) {
              const vals = matrix[1].split(',').map(v => parseFloat(v.trim()));
              ctx.transform(vals[0], vals[1], vals[2], vals[3], vals[4], vals[5]);
            }
          }
          
          // Translate back from transform origin
          ctx.translate(-originX, -originY);
          
          // Convert SVG to image and draw
          try {
            await new Promise((resolve, reject) => {
              const svgClone = innerSvg.cloneNode(true);
              const serializer = new XMLSerializer();
              const svgString = serializer.serializeToString(svgClone);
              const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
              const url = URL.createObjectURL(svgBlob);
              
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0, objWidth, objHeight);
                URL.revokeObjectURL(url);
                resolve();
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(); // Continue even if one object fails
              };
              img.src = url;
              // Timeout after 500ms per object
              setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve();
              }, 500);
            });
          } catch (e) {
            console.warn('Object SVG failed to render');
          }
          
          ctx.restore();
        }
      }
      
      // Return canvas as data URL with JPEG compression for smaller file size
      return canvas.toDataURL('image/jpeg', 0.7);
      
    } catch (e) {
      console.error('Thumbnail generation failed:', e);
      return '';
    }
  }
  
  // Synchronous wrapper for backward compatibility
  function generateThumbnail() {
    // Generate async and store result
    generateThumbnailAsync().then(dataUrl => {
      if (savedCanvases[currentCanvasIndex]) {
        savedCanvases[currentCanvasIndex].thumbnail = dataUrl;
        localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
      }
    });
    return ''; // Return empty initially, will be updated async
  }

  // Save current canvas to localStorage
  function saveToStorage() {
    savedCanvases[currentCanvasIndex].html = $(`#${config.canvasId}`).html();
    savedCanvases[currentCanvasIndex].timestamp = Date.now();
    // Generate thumbnail asynchronously - it will save when ready
    generateThumbnail();
    // Save immediately with current data (thumbnail will update async)
    localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
  }

  // Setup event handlers
  function setupEventHandlers() {
    // Open canvas manager modal
    $("#manageCanvases").on("click", function () {
      const manager = new CanvasManager(self);
      manager.open();
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
      
      $(`#${config.canvasId}`).append(clone);
      makeTouchable(clone);
      activeClone = clone;
      isDraggingFromMenu = true;

      const canvas = document.getElementById(config.canvasId);
      const canvasBounds = canvas.getBoundingClientRect();
      
      // Get clone's actual width/height after rendering
      const cloneWidth = clone.width();
      const cloneHeight = clone.height();

      clone.css({
        position: 'absolute',
        left: touch.clientX - canvasBounds.left - (cloneWidth / 2),
        top: touch.clientY - canvasBounds.top - (cloneHeight / 2),
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
        
        const canvas = document.getElementById(config.canvasId);
        const canvasBounds = canvas.getBoundingClientRect();

        activeClone.css({
          left: touch.clientX - canvasBounds.left - (cloneWidth / 2),
          top: touch.clientY - canvasBounds.top - (cloneHeight / 2),
          transform: `scale(1) rotate(0deg)`
        });
      };

      // Handle end
      const endHandler = function() {
        $(document).off('mousemove touchmove', moveHandler);
        $(document).off('mouseup touchend', endHandler);
        activeClone = null;
        isDraggingFromMenu = false;
        // Don't save immediately - allow for async color processing
        // Items that need color processing will call saveToStorage() themselves
        // For items without color processing, save after a brief delay
        setTimeout(function() {
          saveToStorage();
        }, 100);
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
    
    // Always save when selection/z-index changes
    if (reorderZIndex) {
      saveToStorage();
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

    mc.get('pinch').set({ enable: config.enableScale || config.enableRotate });
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

    mc.on("panend", function (e) {
      if (isDraggingHandle) return;

      // Remove if dragged back over menu
      const menuElement = document.getElementById(config.menuContainerId);
      if (menuElement) {
        const menuBounds = menuElement.getBoundingClientRect();
        const itemBounds = item[0].getBoundingClientRect();
        const itemCenterX = itemBounds.left + itemBounds.width / 2;
        
        // Check if item center is over menu
        if (itemCenterX >= menuBounds.left && itemCenterX <= menuBounds.right) {
          item.remove();
        }
      }
      
      // Always save after pan ends (whether removed or just moved)
      saveToStorage();
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

  // Public API methods for CanvasManager
  this.getCanvases = function() {
    return savedCanvases;
  };

  this.getCurrentIndex = function() {
    return currentCanvasIndex;
  };

  this.switchToCanvas = function(index) {
    saveToStorage(); // Save current before switching
    loadCanvas(index);
  };

  this.addNewCanvas = function() {
    saveToStorage();
    savedCanvases.push({ html: "", timestamp: Date.now() });
    currentCanvasIndex = savedCanvases.length - 1;
    localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
    loadCanvas(currentCanvasIndex);
  };

  this.cloneCanvas = function(index) {
    const clonedCanvas = { 
      html: savedCanvases[index].html, 
      timestamp: Date.now() 
    };
    savedCanvases.push(clonedCanvas);
    localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
  };

  this.deleteCanvas = function(index) {
    if (savedCanvases.length > 1) {
      savedCanvases.splice(index, 1);
      if (currentCanvasIndex >= index && currentCanvasIndex > 0) {
        currentCanvasIndex--;
      }
      if (currentCanvasIndex >= savedCanvases.length) {
        currentCanvasIndex = savedCanvases.length - 1;
      }
      localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
      loadCanvas(currentCanvasIndex);
    }
  };

  // Other public methods
  this.setColorableElements = function(color) {
    if (config.colorableSelector) {
      // Split the selector and scope each part to the menu
      const selectors = config.colorableSelector.split(',').map(s => 
        `#${config.menuContainerId} ${config.itemSelector} ${s.trim()}`
      ).join(', ');
      $(selectors).each(function() {
        this.setAttribute('fill', color);
      });
    }
  };

  this.getIsDraggingHandle = function() {
    return isDraggingHandle;
  };

  this.setIsDraggingHandle = function(value) {
    isDraggingHandle = value;
  };

  // Generate thumbnail for a specific canvas by temporarily loading it
  this.generateThumbnailForCanvas = async function(index) {
    if (index < 0 || index >= savedCanvases.length) return '';
    
    // Save current canvas state
    const originalIndex = currentCanvasIndex;
    const originalHtml = $(`#${config.canvasId}`).html();
    
    // Load the target canvas temporarily
    $(`#${config.canvasId}`).html(savedCanvases[index].html);
    
    // Generate thumbnail
    const thumbnailDataUrl = await generateThumbnailAsync();
    
    // Restore original canvas
    $(`#${config.canvasId}`).html(originalHtml);
    
    // Update the saved canvas with new thumbnail
    savedCanvases[index].thumbnail = thumbnailDataUrl;
    localStorage.setItem(config.storageKey, JSON.stringify(savedCanvases));
    
    return thumbnailDataUrl;
  };

  this.saveToStorage = saveToStorage;
  this.getScale = getScale;
  this.getRotationAngle = getRotationAngle;
}
