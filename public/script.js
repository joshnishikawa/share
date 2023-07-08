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
  let colspan, rowheight;
  if (length >= 36 && even){
    length = 36;
    colspan = 2;
    rowheight = "15vh";
  } else if (length >= 30){
    length = 30;
    colspan = 2;
    rowheight = "19vh";
  } else if (length >= 24){
    length = 24;
    colspan = 2;
    rowheight = "24vh";
  } else if (length >= 18){
    length = 18;
    colspan = 2;
    rowheight = "32vh";
  } else if (length >= 16){
    length = 16;
    colspan = 3;
    rowheight = "24vh";
  } else if (length >= 12){
    length = 12;
    colspan = 3;
    rowheight = "32vh";
  } else if (length >= 9 && !even){
    length = 9;
    colspan = 4;
    rowheight = "32vh";
  } else if (length >= 8){
    length = 8;
    colspan = 3;
    rowheight = "49vh";
  } else if (length >= 6){
    length = 6;
    colspan = 4;
    rowheight = "49vh";
  }
  return {length, colspan, rowheight};
}
