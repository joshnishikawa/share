var extraWords = {//Not in the set but you might know them & they're not wrong  
  "hush": "し～～～", "rash": "ししん", "mosh": "勢いおどり", "dash": "ダッシュ",
  "with": "一緒に", "mush": "おじや", "chew": "かむ", "chug": "一気飲み",
  "rich": "お金持ち", "lush": "おたか", "much": "量", "moth": "が",
  "hash": "ハッシュドポテト", "chop": "チョップ", "path": "みち", "push": "おす",
  "what": "なに", "when": "いつ", "sham": "にせもの", "thus": "そして"
};

async function loadAnActivity(card, rank){
  try{
    $.get('/SRS/loadcard', {set, card}, async(data)=>{
      let success = true;
      let word = data.word;
      let meaning = data.meaning;
      let otherWords = data.otherWords;
      let otherLetters = data.otherLetters;
      let otherParts = data.otherParts;
      let sentence = data.sentence;
      let source = '';
      $("#rank").html(rank);

      switch (rank){
        case 0: // flash word, listen and choose the correct part to complete it
          otherWords.push(word);
          FYshuffle( otherWords );
          for (let w of otherWords){
            source = await findAudio(w);
            if(source){
              teachWord(w);
              await playaudio(source);
              await fadeTeach(1000);
            }
          }

          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);

            let parts = word.match(/.h/)[0];
            otherParts = ['ch', 'sh', 'th'];

            await partFill({word, parts, otherParts}, (s)=>{
              if(!s){
                success = false;
                playaudio(source);
                update(card, false);
              }
            });
          }

          if (success) update(card, true);
          displayWord(word);
          await next();
          break;

        case 1: // listen to the word, combine 2 parts out of 4 to make the word
          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);
            
            let parts = [ word.slice(0,2), word.slice(2) ];
            otherParts = FYshuffle(otherParts).slice(0,2);

            await partFill({word, parts, otherParts}, (s)=>{
              if(!s){
                success = false;
                playaudio(source);
                update(card, false);
              }
            });

          }

          if (success) update(card, true);
          displayWord(word);
          await next();
          break;

        case 2: // listen to the sentene, choose the correct word out of 4
          source = await findAudio(sentence);
          if(source){
            await playaudio(source);
            $("#playbutton").css("visibility", "visible");

            await gapFill({sentence, words: word, otherWords}, (s)=>{
              if (!s){
                success = false;
                update(card, false);
                playaudio(source);
              }
            });
          }

          if (success) update(card, true);
          displaySentence(sentence);
          await next();
          break;

        case 3: // listen and type the word you hear using 4 of 7 letters
          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            playaudio(source); // no need to await this one

            otherLetters = FYshuffle(otherLetters).slice(0,3);

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
          displayWord(word);
          $("#teach").slideUp().empty();
          await next();
          break;

        case 4: // only listen to the word and choose the meaning out of 4
          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);

            otherWords = await getRandomSet({field: 'meaning', num: 3, exclude: meaning});
            await chooseL1({meaning, otherWords}, (s)=>{
              if(!s){
                success = false;
                update(card, false);
                $("#playbutton").css("visibility", "visible");
                playaudio(source);
              }
            });
          }

          if (success) update(card, success);
          teachWord(word);
          await next();
          break;

        default:
          aim[card] = 2;
          break;
      }
      checkProgress();
    });
  }
  catch(err){
    console.log(err);
    update(card, true);
    checkProgress();
  }
}
