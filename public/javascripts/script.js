////////////////////////////////////////////////////////////////////////////////
// script.js — Global utility functions shared across all pages.
//             Loaded by every view via head.ejs.
//             NOTE: All functions are implicit globals (no const/let/var).
////////////////////////////////////////////////////////////////////////////////

// Replace a broken <img> with its alt text (used as an onerror fallback)
altOnly = (img)=>{$(img).replaceWith(img.alt);}

// Parse document.cookie into a key-value object.
// BUG: Keys after the first will have a leading space because split(';')
//      leaves the space before each subsequent cookie.  Should .trim() keys.
// NOTE: js-cookie is already loaded via CDN in head.ejs — this could be
//       replaced with Cookies.get() to avoid the bug and reduce custom code.
getCookieObject = ()=>{
  let cookie = document.cookie;
  let cookieObject = {};

  if(cookie){
    let cookieArray = cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++){
      let cookiePair = cookieArray[i].split('=');
      cookieObject[ cookiePair[0].trim() ] = cookiePair[1];
    }
  }
  return cookieObject;
}


// Fisher-Yates shuffle (in-place). Returns the shuffled array.
// Special-cases 2-element arrays with a coin flip.
FYshuffle = (myArray) => {
  let l = myArray.length;
  if (l == 2){
    if ( Math.round( Math.random() ) ){ // flip a coin, if heads...
      myArray.unshift( myArray.pop() ); // reverse items
    }
  }
  else{ // do a proper Fisher Yates shuffle for more than 2 items
    for (let i = l - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let k = myArray[i];
      myArray[i] = myArray[j];
      myArray[j] = k;
    }
  }
  return myArray;
}


// Apply the exact same Fisher-Yates shuffle to two arrays in lockstep.
// Returns [a, b].
parallelShuffle = (a, b)=>{
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));

    let k = a[i];
    a[i] = a[j];
    a[j] = k;

    let l = b[i];
    b[i] = b[j];
    b[j] = l;
  }
  return [a, b];
}

// Given a data object with .length (item count) and .even (boolean),
// return the best-fit grid layout: how many items to show, Bootstrap colspan
// for each cell, and row height (as vh percentage).
// The cascade snaps down to the largest layout that fits the data.
// Grid layout breakpoints: [minItems, colspan, rowheight].
// Scanned top-down — first match where data.length >= threshold wins.
// The 9-item entry is skipped when data.even is true.
const gridLayouts = [
  [36, 2, 15], [30, 2, 19], [24, 2, 24], [20, 3, 19],
  [18, 2, 32], [16, 3, 24], [12, 3, 32], [9, 4, 32],
  [8, 3, 49],  [6, 4, 49]
];

getGrid = (data) => {
  for (let i = 0; i < gridLayouts.length; i++) {
    let [len, colspan, rowheight] = gridLayouts[i];
    if (data.length >= len && !(len === 9 && data.even)) {
      return { length: len, colspan, rowheight };
    }
  }
  return { length: 4, colspan: 6, rowheight: 49 };
}
