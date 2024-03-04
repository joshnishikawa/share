altOnly = (img)=>{$(img).replaceWith(img.alt);}

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
