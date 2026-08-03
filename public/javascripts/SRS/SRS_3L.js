const three_letter = [
  { "part" : "bd", "word" : "bug", "meaning" : "虫", "otherWords" : ["bag","big","beg"], "otherLetters" : ["d","a","i"] },
  { "part" : "bd", "word" : "dog", "meaning" : "犬", "otherWords" : ["dig","bug","dad"], "otherLetters" : ["b","u","i"] },
  { "part" : "bd", "word" : "box", "meaning" : "はこ", "otherWords" : ["but","bat","bus"], "otherLetters" : ["t","d","u"] },
  { "part" : "bd", "word" : "dig", "meaning" : "ほる", "otherWords" : ["big","bag","bug"], "otherLetters" : ["b","a","e"] },
  { "part" : "bd", "word" : "bag", "meaning" : "かばん", "otherWords" : ["big","bug","dig"], "otherLetters" : ["d","e","i"] },
  { "part" : "bd", "word" : "dad", "meaning" : "父", "otherWords" : ["bad","did","bed"], "otherLetters" : ["b","b","i"] },
  { "part" : "bd", "word" : "den", "meaning" : "どうくつ", "otherWords" : ["bun","dam","dim"], "otherLetters" : ["b","m","i"] },
  { "part" : "bd", "word" : "bat", "meaning" : "バット", "otherWords" : ["bet","but","bad"], "otherLetters" : ["d","u","e"] },
  { "part" : "bd", "word" : "big", "meaning" : "大きい", "otherWords" : ["dig","bag","bug"], "otherLetters" : ["d","a","e"] },
  { "part" : "bd", "word" : "dam", "meaning" : "ダム", "otherWords" : ["dim","bam","bun"], "otherLetters" : ["n","b","u"] },

  { "part" : "lr", "word" : "rug", "meaning" : "じゅうたん", "otherWords" : ["lug","log","rag"], "otherLetters" : ["a","l","o"] },
  { "part" : "lr", "word" : "log", "meaning" : "丸太", "otherWords" : ["lug","rag","leg"], "otherLetters" : ["r","u","a"] },
  { "part" : "lr", "word" : "leg", "meaning" : "足", "otherWords" : ["lag","rig","red"], "otherLetters" : ["r","a","i"] },
  { "part" : "lr", "word" : "red", "meaning" : "赤", "otherWords" : ["rad","lid","led"], "otherLetters" : ["l","b","i"] },
  { "part" : "lr", "word" : "rat", "meaning" : "ねずみ", "otherWords" : ["rot","rut","let"], "otherLetters" : ["l","u","o"] },
  { "part" : "lr", "word" : "lid", "meaning" : "ふた", "otherWords" : ["rid","red","led"], "otherLetters" : ["r","b","e"] },
  { "part" : "lr", "word" : "run", "meaning" : "走る", "otherWords" : ["ran","ram","rug"], "otherLetters" : ["m","g","l"] },
  { "part" : "lr", "word" : "lap", "meaning" : "ひざ", "otherWords" : ["rap","lip","rip"], "otherLetters" : ["r","i","t"] },
  { "part" : "lr", "word" : "lip", "meaning" : "口びる", "otherWords" : ["lap","rip","rap"], "otherLetters" : ["r","t","a"] },
  { "part" : "lr", "word" : "rag", "meaning" : "ぞうきん", "otherWords" : ["rug","lag","lug"], "otherLetters" : ["l","u","b"] },

  { "part" : "fh", "word" : "fat", "meaning" : "太い", "otherWords" : ["fit","hat","hut"], "otherLetters" : ["h","u","i"] },
  { "part" : "fh", "word" : "hug", "meaning" : "だきしめる", "otherWords" : ["fog","fig","hog"], "otherLetters" : ["f","o","i"] },
  { "part" : "fh", "word" : "hat", "meaning" : "ぼうし", "otherWords" : ["hit","fat","hut"], "otherLetters" : ["f","i","u"] },
  { "part" : "fh", "word" : "fin", "meaning" : "（魚の）ひれ", "otherWords" : ["fan","fun","hen"], "otherLetters" : ["h","e","m"] },
  { "part" : "fh", "word" : "hen", "meaning" : "めんどり", "otherWords" : ["fin","ham","pen"], "otherLetters" : ["f","m","a"] },
  { "part" : "fh", "word" : "hit", "meaning" : "たたく", "otherWords" : ["hat","fit","hip"], "otherLetters" : ["f","p","a"] },
  { "part" : "fh", "word" : "fit", "meaning" : "合う", "otherWords" : ["fat","hit","hat"], "otherLetters" : ["h","p","a"] },
  { "part" : "fh", "word" : "hop", "meaning" : "はねる", "otherWords" : ["hog","hip","fog"], "otherLetters" : ["f","t","i"] },
  { "part" : "fh", "word" : "fog", "meaning" : "きり", "otherWords" : ["fig","hog","hug"], "otherLetters" : ["h","i","u"] },
  { "part" : "fh", "word" : "fun", "meaning" : "楽しい", "otherWords" : ["fan","hum","fin"], "otherLetters" : ["h","a","m"] },

  { "part" : "au", "word" : "bad", "meaning" : "悪い", "otherWords" : ["bud","dad","dub"], "otherLetters" : ["b","d","u"] },
  { "part" : "au", "word" : "ham", "meaning" : "ハム", "otherWords" : ["him","hum","fan"], "otherLetters" : ["f","i","u"] },
  { "part" : "au", "word" : "fun", "meaning" : "楽しい", "otherWords" : ["fan","hum","ham"], "otherLetters" : ["h","a","m"] },
  { "part" : "au", "word" : "mud", "meaning" : "どろ", "otherWords" : ["mad","dam","mug"], "otherLetters" : ["n","a","b"] },
  { "part" : "au", "word" : "cut", "meaning" : "切る", "otherWords" : ["cat","cup","cap"], "otherLetters" : ["a","p","o"] },
  { "part" : "au", "word" : "cat", "meaning" : "ねこ", "otherWords" : ["cut","cap","cup"], "otherLetters" : ["u","p","k"] },
  { "part" : "au", "word" : "cup", "meaning" : "コップ", "otherWords" : ["cat","cut","cap"], "otherLetters" : ["k","a","t"] },
  { "part" : "au", "word" : "fan", "meaning" : "うちわ", "otherWords" : ["fun","hum","ham"], "otherLetters" : ["u","m","h"] },
  { "part" : "au", "word" : "run", "meaning" : "走る", "otherWords" : ["rum","ran","ram"], "otherLetters" : ["a","m","l"] },
  { "part" : "au", "word" : "cap", "meaning" : "キャップ", "otherWords" : ["cat","cut","cup"], "otherLetters" : ["u","t","k"] },

  { "part" : "ie", "word" : "leg", "meaning" : "足", "otherWords" : ["lag","rig","red"], "otherLetters" : ["a","r","i"] },
  { "part" : "ie", "word" : "lip", "meaning" : "口びる", "otherWords" : ["lap","rip","rap"], "otherLetters" : ["r","a","q"] },
  { "part" : "ie", "word" : "hit", "meaning" : "たたく", "otherWords" : ["hat","fit","hip"], "otherLetters" : ["f","a","p"] },
  { "part" : "ie", "word" : "net", "meaning" : "あみ", "otherWords" : ["not","met","nap"], "otherLetters" : ["o","m","p"] },
  { "part" : "ie", "word" : "pet", "meaning" : "ペット", "otherWords" : ["pot","pen","pin"], "otherLetters" : ["o","n","i"] },
  { "part" : "ie", "word" : "kit", "meaning" : "道ぐばこ", "otherWords" : ["cat","pit","cut"], "otherLetters" : ["c","a","p"] },
  { "part" : "ie", "word" : "ten", "meaning" : "十", "otherWords" : ["tan","pen","tin"], "otherLetters" : ["a","m","p"] },
  { "part" : "ie", "word" : "tin", "meaning" : "カン", "otherWords" : ["ten","pin","ton"], "otherLetters" : ["e","p","o"] },
  { "part" : "ie", "word" : "win", "meaning" : "かつ", "otherWords" : ["won","men","one"], "otherLetters" : ["m","e","o"] },
  { "part" : "ie", "word" : "yes", "meaning" : "はい", "otherWords" : ["yet","yen","was"], "otherLetters" : ["a","t","n"] },

  { "part" : "ou", "word" : "top", "meaning" : "こま", "otherWords" : ["tap","pot","tip"], "otherLetters" : ["i","u","q"] },
  { "part" : "ou", "word" : "nut", "meaning" : "木のみ", "otherWords" : ["not","net","nap"], "otherLetters" : ["o","a","p"] },
  { "part" : "ou", "word" : "hot", "meaning" : "あつい", "otherWords" : ["hut","hop","hat"], "otherLetters" : ["p","a","k"] },
  { "part" : "ou", "word" : "hut", "meaning" : "小さな家", "otherWords" : ["hat","hot","hop"], "otherLetters" : ["a","p","o"] },
  { "part" : "ou", "word" : "dog", "meaning" : "犬", "otherWords" : ["dig","bug","dad"], "otherLetters" : ["b","u","i"] },
  { "part" : "ou", "word" : "bug", "meaning" : "虫", "otherWords" : ["bag","big","beg"], "otherLetters" : ["a","i","e"] },
  { "part" : "ou", "word" : "log", "meaning" : "丸太", "otherWords" : ["lug","rag","leg"], "otherLetters" : ["u","r","a"] },
  { "part" : "ou", "word" : "mug", "meaning" : "マグカップ", "otherWords" : ["dam","mad","mud"], "otherLetters" : ["d","a","n"] },
  { "part" : "ou", "word" : "pot", "meaning" : "なべ", "otherWords" : ["pet","top","pit"], "otherLetters" : ["e","u","i"] },
  { "part" : "ou", "word" : "run", "meaning" : "走る", "otherWords" : ["rum","ran","ram"], "otherLetters" : ["m","a","l"] }
];

async function loadAnActivity(card, rank){
  try{
    let success = true;
    let data = three_letter[card];
    if(!data) {
      update(card, true);
      checkProgress();
      return;
    }
    let word = data.word;
    let meaning = data.meaning;
    let otherWords = data.otherWords;
    let otherLetters = data.otherLetters;
    let source = '';
    $("#rank").html(rank);

    switch (rank){
      case 0: // flash vocab, choose the word you hear out of 2
        let allWords = otherWords.slice(0);
        allWords.push(word);
        allWords = FYshuffle( allWords );

        for (let w of allWords ){
          let source = await findAudio(w);
          if (source){
            teachWord(w);
            await playaudio(source);
            await fadeTeach(2000);
          }
        }

        source = await findAudio(word);
        if(source){
          $("#playbutton").css("visibility", "visible");
          await playaudio(source);

          otherWords = FYshuffle(otherWords).slice(0, 1);
          await chooseL2({word, otherWords}, (s)=>{
            if(!s){
              success = false;
              update(card, false);
              playaudio(source);
            }
          });

        }

        if (success) update(card, true);
        teachWord(meaning);
        await next();
        break;

      case 1: // see the meaning only and choose the word out of 4
        source = await findAudio(word);
        if(source){
          await teachWord(meaning);

          await chooseL2({word, otherWords}, (s)=>{
            if(!s){
              success = false;
              update(card, false);
              $("#playbutton").css("visibility", "visible");
              playaudio(source);
            }
          });
        }

        if (success) update(card, true);
        await next();
        break;

      case 2: // only listen and choose the meaning out of 4
        source = await findAudio(word);
        if(source){
          $("#playbutton").css("visibility", "visible");
          await playaudio(source);

          let otherMeanings = FYshuffle(three_letter.filter(b => b.meaning !== meaning).map(b => b.meaning)).slice(0, 3);
          await chooseL1({meaning, otherWords: otherMeanings}, (s)=>{
            if(!s){
              success = false;
              update(card, false);
              $("#playbutton").css("visibility", "visible");
              playaudio(source);
            }
          });
        }

        if (success) update(card, true);
        await next();
        break;

      case 3: // listen and type the word you hear using 3 of 6 letters
        source = await findAudio(word);
        if(source){
          $("#playbutton").css("visibility", "visible");
          playaudio(source); // no need to await this one

          await typeL2({word, otherLetters}, (s)=>{
            if(!s){
              success = false;
              update(card, false);
              teachWord(word);
              playaudio(source);
            }
          });
        }

        if (success) update(card, true);
        $("#teach").slideUp().empty();
        displayWord(word);
        await next();
        break;

      case 4: // only read the meaning and type the word using 3 of 6 letters
        source = await findAudio(word);
        if(source){
          await teachWord(meaning);

          await typeL2({word, otherLetters}, (s)=>{
            if(!s){
              success = false;
              update(card, false);
              $("#playbutton").css("visibility", "visible");
              playaudio(source);

              // remove .letter elements that aren't in the word from #main
              $("#main").children().each((i, e)=>{
                if(!word.includes(e.innerHTML)) $(e).remove();
              });
            }
          });
        }

        if (success) update(card, true);
        displayWord(word);
        await next();
        break;

      default:
        aim[card] = 2;
        break;
    }
    checkProgress();
  }catch(err){
    console.log(err);
    update(card, true);
    checkProgress();
  }
}
