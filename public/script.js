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


getGrid = (vocab) => {
  if (vocab.length >= 36){
    vocab = vocab.slice(0, 36);
    colspan = 2;
    rowheight = "15vh";
  } else if (vocab.length >= 30){
    vocab = vocab.slice(0, 30);
    colspan = 2;
    rowheight = "19vh";
  } else if (vocab.length >= 24){
    vocab = vocab.slice(0, 24);
    colspan = 2;
    rowheight = "24vh";
  } else if (vocab.length >= 18){
    vocab = vocab.slice(0, 18);
    colspan = 2;
    rowheight = "32vh";
  } else if (vocab.length >= 16){
    vocab = vocab.slice(0, 16);
    colspan = 3;
    rowheight = "24vh";
  } else if (vocab.length >= 12){
    vocab = vocab.slice(0, 12);
    colspan = 3;
    rowheight = "32vh";
  } else if (vocab.length >= 9){
    vocab = vocab.slice(0, 9);
    colspan = 4;
    rowheight = "32vh";
  } else if (vocab.length >= 6){
    vocab = vocab.slice(0, 6);
    colspan = 4;
    rowheight = "49vh";
  }
  return {vocab, colspan, rowheight};
}
