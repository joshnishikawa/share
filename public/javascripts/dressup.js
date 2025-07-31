// Shared dressup functionality
function initializeDressup(config) {
  var clothingCounter = 0; // Unique ID counter for clothing items
  var clothingOnCharacter = {}; // Track which clothing items are on the character
  
  var clothingSelector = config.clothingSelector;
  var characterSelector = config.characterSelector;
  var clothingClass = config.clothingClass;
  
  // CLOTHING FUNCTIONALITY
  $(clothingSelector).on('click', function() {
    var $clickedImg = $(this);
    var clothingType = $clickedImg.attr('alt');
    
    // Check if this clothing item is already on the character
    if (clothingOnCharacter[clothingType]) {
      console.log('Clothing item', clothingType, 'is already on the character');
      return; // Don't add duplicates
    }
    
    var $character = $(characterSelector);
    var $characterContainer = $character.parent();
    
    // Get positions for animation (BEFORE hiding the element)
    var clickedOffset = $clickedImg.offset();
    var characterOffset = $character.offset();
    
    // Store the original position before hiding
    var originalOffset = clickedOffset;
    
    // Create a clone to move to the character
    var $clonedImg = $clickedImg.clone();
    var uniqueId = 'clothing-' + (++clothingCounter);
    $clonedImg.attr('data-clothing-id', uniqueId);
    $clonedImg.attr('data-clothing-type', clothingType);
    
    // Mark this clothing type as being on the character
    clothingOnCharacter[clothingType] = {
      uniqueId: uniqueId,
      originalElement: $clickedImg,
      originalOffset: originalOffset  // Store the position
    };
    
    // Hide the original item from the selection AFTER storing its position
    $clickedImg.hide();
    
    // Move clone to body for animation with fixed positioning
    $clonedImg.css({
      position: 'fixed',
      left: clickedOffset.left,
      top: clickedOffset.top,
      width: $clickedImg.width(),
      height: $clickedImg.height(),
      zIndex: 1000,
      border: 'none',
      padding: 0,
      margin: 0
    }).appendTo('body');
    
    // Animate to character's position and resize
    $clonedImg.animate({
      left: characterOffset.left,
      top: characterOffset.top,
      width: $character.width(),
      height: $character.height()
    }, 800, 'swing', function() {
      // After animation, position it properly in the character container
      $clonedImg.css({
        position: 'absolute',
        left: 0,
        top: 0,
        height: '600px',
        width: 'auto',
        border: 'none',
        padding: 0,
        margin: 0,
        zIndex: 10,
        cursor: 'pointer'
      }).appendTo($characterContainer);
      
      // Add a specific class to identify clothing items on the character
      $clonedImg.addClass(clothingClass);
    });
  });
  
  // Handle clicks on clothing items overlaid on the character to move them back
  $(document).on('click', '.' + clothingClass, function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var $clickedClothing = $(this);
    var targetItem = findClickableItemAtPoint($clickedClothing, e, clothingOnCharacter);
    
    if (targetItem && targetItem[0] !== $clickedClothing[0]) {
      console.log('Click passed through to item:', targetItem.attr('data-clothing-type'));
      targetItem.trigger('click');
      return;
    }
    
    removeClothingItem($clickedClothing, clothingOnCharacter);
  });

  // Function to remove a clothing item and animate it back
  function removeClothingItem($clickedClothing, clothingTracker) {
    var uniqueId = $clickedClothing.attr('data-clothing-id');
    var clothingType = $clickedClothing.attr('data-clothing-type');
    
    console.log('Removing clothing item:', clothingType, 'ID:', uniqueId);
    
    // Get the original element to restore
    var originalData = clothingTracker[clothingType];
    if (originalData) {
      var $originalElement = originalData.originalElement;
      var originalOffset = originalData.originalOffset; // Use stored position
      
      // Get positions for return animation
      var currentOffset = $clickedClothing.offset();
      
      console.log('Current offset:', currentOffset);
      console.log('Original offset:', originalOffset);
      
      // Get current dimensions to maintain aspect ratio
      var currentWidth = $clickedClothing.width();
      var currentHeight = $clickedClothing.height();
      var aspectRatio = currentWidth / currentHeight;
      
      // Calculate target dimensions maintaining aspect ratio
      var targetHeight = 200;
      var targetWidth = targetHeight * aspectRatio;
      
      // Move to body for animation
      $clickedClothing.css({
        position: 'fixed',
        left: currentOffset.left,
        top: currentOffset.top,
        width: currentWidth,
        height: currentHeight,
        zIndex: 1000,
        border: 'none',
        cursor: 'pointer'
      }).appendTo('body');
      
      // Animate back to original position
      $clickedClothing.animate({
        left: originalOffset.left,
        top: originalOffset.top,
        width: targetWidth,
        height: targetHeight
      }, 600, 'swing', function() {
        console.log('Animation complete, restoring original item');
        // Remove the clone and show the original
        $clickedClothing.remove();
        $originalElement.show();
        
        // Remove from tracking
        delete clothingTracker[clothingType];
      });
    }
  }
  
  // Function to recursively find the deepest clickable item at a point
  function findClickableItemAtPoint($startItem, event, clothingTracker) {
    var itemsToCheck = [$startItem];
    var checkedItems = [];
    
    while (itemsToCheck.length > 0) {
      var $currentItem = itemsToCheck.shift();
      checkedItems.push($currentItem);
      
      // Check if click is on transparent area of current item
      if (!isClickOnTransparentArea($currentItem[0], event)) {
        console.log('Found non-transparent pixel on:', $currentItem.attr('data-clothing-type'));
        return $currentItem;
      }
      
      console.log('Transparent pixel on:', $currentItem.attr('data-clothing-type'), 'checking below...');
      
      // Hide all checked items temporarily to find what's underneath
      checkedItems.forEach(function($item) {
        $item.css('pointer-events', 'none');
      });
      
      var elementBelow = document.elementFromPoint(event.clientX, event.clientY);
      
      // Restore pointer events
      checkedItems.forEach(function($item) {
        $item.css('pointer-events', 'auto');
      });
      
      // If we found another clothing item below, add it to the check list
      if (elementBelow && $(elementBelow).hasClass(clothingClass)) {
        var $itemBelow = $(elementBelow);
        // Only add if we haven't already checked this item
        var alreadyChecked = checkedItems.some(function($item) {
          return $item[0] === $itemBelow[0];
        });
        if (!alreadyChecked) {
          itemsToCheck.push($itemBelow);
        }
      }
    }
    
    // If we get here, all items at this point are transparent
    console.log('All items transparent at this point, ignoring click');
    return null;
  }
  
  // Function to check if click is on transparent area of image
  function isClickOnTransparentArea(img, event) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0);
    
    // Calculate click position relative to image
    var rect = img.getBoundingClientRect();
    var x = Math.floor((event.clientX - rect.left) / rect.width * canvas.width);
    var y = Math.floor((event.clientY - rect.top) / rect.height * canvas.height);
    
    // Get pixel data at click position
    try {
      var pixelData = ctx.getImageData(x, y, 1, 1).data;
      var alpha = pixelData[3]; // Alpha channel (transparency)
      
      // Consider alpha < 50 as transparent (adjust threshold as needed)
      return alpha < 50;
    } catch (e) {
      // If we can't read pixel data (CORS issues), assume not transparent
      console.log('Cannot read pixel data:', e);
      return false;
    }
  }
}
