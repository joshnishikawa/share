const vocab_decks = {
  // THE ORDER OF MOST OF THESE ARRAYS IS IMPORTANT TO HOW SCRIPTS FUNCTION
  // DO NOT CHANGE
  "tens_teens":["12","20","13","30","14","40","15","50","16","60","17","70","18","80","19","90"],

  "ordinals":["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th",
     "11th","12th","13th","14th","15th","16th","17th","18th","19th","20th",
     "21st","22nd","23rd","24th","25th","26th","27th","28th","29th","30th",
     "31st"],

  "capitals":["A","B","C","D","E","F","G","H","I","J","K","L","M",
             "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],

  "lower_case":["a","b","c","d","e","f","g","h","i","j","k","l","m",
                "n","o","p","q","r","s","t","u","v","w","x","y","z"],

  "lower_case_mix":['b','d','f','g','k','m','p','r','s','t',
                    'c','h','j','l','n','q','v','w','y','z',
                    'x','a','e','i','o','u'],

  "a_or_u":["bad","bud","cap","cup","cat","cut","fan",
         "fun","ham","hum","mad","mud","ran","run"],

  "o_or_u":["bog","bug","dog","dug","hot","hut","log","lug","not","nut"],

  "b_or_d":["big","dig","bad","dad","bug","dug","bog","dog"],

  "l_or_r":["lag","rag","lap","rap","lid","rid",
         "lip","rip","lot","rot","lug","rug"],

  "f_or_h":["fat","hat","fit","hit","fog","hog","fun","hun"],

  "3_letter":["pin","pig","big","bag","bat","mat","mad","dad","dam","ham",
              "hat","hit","hot","hop","top","mop","map","cap","cup","cut",
              "nut","net","pet","pen","pan","pat","fat","fan","fun","run",
              "rug","bug","beg","leg","log","dog","fog","fox","fix","six",
              "sit","sip","lip","lid","kid"],

  "magic_e":["can","cane","cap","cape","hat","hate","man","mane","tap","tape",
             "pet","Pete","fin","fine","kit","kite","pin","pine","win","wine",
             "hop","hope","not","note","tub","tube","cut","cute"],

  "more_magic_e":["bake","cake","cave","date","game","gate","lake","lane",
                  "name","wave","bike","bite","dive","fire","five","hide",
                  "hike","lime","nine","pipe","ride","time","tire","vine",
                  "wipe","bone","cone","dome","hole","home","hope","hose",
                  "mole","nose","pole","rope","pose","rose","sole","vote",
                  "cube","cure","dune","fuse","June","lure","lute","mule",
                  "mute","pure","rule","tune","tube"],

  "animals":['bear', 'dog', 'fish', 'goat', 'kangaroo','monkey', 'pig', 'rabbit', 'snake', 'tiger', 
             'bat','duck','frog', 'gorilla', 'koala','mouse', 'penguin', 'raccoon', 'seal', 'turtle'],

  "objects":['car','hat','jelly','lemon','net','question','van','watch','yarn','zebra',
           'cat','horse','juice','lion','nail','quilt','violin','worm','yo-yo','zipper'],

  "shapes":['&#10010;', '&#9632;','&#9733;','&#9830;','&#9829;','&#9644;','&#9650;','&#9679;','&#8594;'],
            //square     star      diamond   heart     rectangle triangle  circle    arrow     cross

  "colors":['red','orange','yellow','green','blue','purple','black','pink',
           'gray','brown','violet', 
           'lightBlue','lightGreen','lightBrown',
           'darkBlue','darkGreen','darkBrown',
           'white','gold','silver']
}

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
  let setName = data.setName;
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
        list = setName == "lower_case_mix" && backs == "animals" ? vocab_decks["lower_case_mix"].slice(0, 10) 
              : setName == "lower_case_mix" && backs == "objects" ? vocab_decks["lower_case_mix"].slice(10, 20)
              : vocab_decks[setName];
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
  let colspan, rowheight;
  if (length >= 36){
    length = 36;
    colspan = 2;
    rowheight = 15;
  } else if (length >= 30){
    length = 30;
    colspan = 2;
    rowheight = 19;
  } else if (length >= 24){
    length = 24;
    colspan = 2;
    rowheight = 24;
  } else if (length >= 20){
    length = 20;
    colspan = 3;
    rowheight = 19;
  } else if (length >= 18){
    length = 18;
    colspan = 2;
    rowheight = 32;
  } else if (length >= 16){
    length = 16;
    colspan = 3;
    rowheight = 24;
  } else if (length >= 12){
    length = 12;
    colspan = 3;
    rowheight = 32;
  } else if (length >= 9 && !even){
    length = 9;
    colspan = 4;
    rowheight = 32;
  } else if (length >= 8){
    length = 8;
    colspan = 3;
    rowheight = 49;
  } else if (length >= 6){
    length = 6;
    colspan = 4;
    rowheight = 49;
  }
  return {length, colspan, rowheight};
}
