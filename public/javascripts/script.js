getCookieObject = ()=>{
  let cookie = document.cookie;
  let cookieObject = {};

  if(cookie){
    let cookieArray = cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++){
      let cookiePair = cookieArray[i].split('=');
      cookieObject[ cookiePair[0] ] = cookiePair[1];
    }
  }
  return cookieObject;
}


getDeck = (data)=>{
  let deckType = data.deckType;
  let setName = data.deck;
  let backs = data.backs;
  let deck = [];
  let list = [];

  // We need an array of objects. Objects have info and arrays can be shuffled.
  switch (deckType){
    case 'text':
      if ( setName.startsWith('_') ){
        let vals = setName.split('_');
        let from = parseInt(vals[1]);
        let to = parseInt(vals[2]);
        for (let i=from; i<=to; i++){
          deck.push({name: i.toString(), image: `<div style="z-index:-1;">${i}</div>`});
        }
      }
      else {
        list = setName == "lower_case_mix" && backs == "animals" ? text_decks["lower_case_mix"].slice(0, 10) 
              : setName == "lower_case_mix" && backs == "objects" ? text_decks["lower_case_mix"].slice(10, 20)
              : text_decks[deck];
        for (let i of list){
          deck.push({name: i, image: `<div style="position:absolute;z-index:-1;">${i}</div>`});
        }
      }
      break;

    case 'LT' :
      list = JSON.parse(setName); // {"vocab word": "file name", "other word": "other file name"}
      for (let i in list){
        deck.push({name: i, image: `<img src="/image/LT/${list[i]}" alt="${i}">`});
      }
      break;

    case 'NH' :
      list = JSON.parse(setName); // {"vocab word": "file name", "other word": "other file name"}
      for (let i in list){
        deck.push({name: i, image: `<img src="/image/NH/${list[i]}" alt="${i}">`});
      }
      break;

    case 'images':
      list = JSON.parse(setName);
      for (let i of list){
        deck.push({name: i.replace(/_/g, ' '), image: `<img src="/image/svg/${i}.svg" alt="${i}">`});
      }
      break;

    default:
      throw new Error("Invalid deck type");
  }
  return deck;
}


FYshuffle = (myArray) => {
  let l = myArray.length;
  if (l == 2){
    if ( Math.round( Math.random() ) ){ // flip a coin, if heads...
      myArray.unshift( myArray.pop() ); // reverse items
    }
  }
  else{ // do a proper Fisher Yates shuffle for more than 2 items
    for (let i = l ; i > 0; i) {
      var j = Math.floor(Math.random() * i--);
      var k = myArray[i];
      myArray[i] = myArray[j];
      myArray[j] = k;
    }
  }
  return myArray;
}

// apply the exact same shuffle to two arrays of the same length (in place)
parallelShuffle = (a, b)=>{
  var i, j, k, l;
  for ( i = a.length -1; i > 0; i--) {
    j = Math.floor(Math.random() * i)

    k = a[i]
    a[i] = a[j]
    a[j] = k

    l = b[i]
    b[i] = b[j]
    b[j] = l
  }
}

getGrid = (data) => {
  let length = data.length;
  let even = data.even;
  if (length >= 36){
    return {length:36, colspan:2, rowheight:15};
  } else if (length >= 30){
    return {length:30, colspan:2, rowheight:19};
  } else if (length >= 24){
    return {length:24, colspan:2, rowheight:24};
  } else if (length >= 20){
    return {length:20, colspan:3, rowheight:19};
  } else if (length >= 18){
    return {length:18, colspan:2, rowheight:32};
  } else if (length >= 16){
    return {length:16, colspan:3, rowheight:24};
  } else if (length >= 12){
    return {length:12, colspan:3, rowheight:32};
  } else if (length >= 9 && !even){
    return {length:9, colspan:4, rowheight:32};
  } else if (length >= 8){
    return {length:8, colspan:3, rowheight:49};
  } else if (length >= 6){
    return {length:6, colspan:4, rowheight:49};
  }
  return {length:4, colspan:6, rowheight:49};
}
