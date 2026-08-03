async function loadAnActivity(card, rank){
  try{
    $.get('/SRS/loadcard', {set, card}, async(data)=>{
      let success = true;
      let word = data.word;
      let meaning = data.meaning;
      let otherWords = data.otherWords;
      let otherParts = data.otherParts;
      let otherLetters = data.otherLetters;
      let sentence = data.sentence;
      let source = '';
      $("#rank").html(rank);

      switch (rank){
        case 0: // listen to each long vowel, choose the correct one for the word
          let letters = FYshuffle(['a', 'e', 'i', 'o', 'u']);
          let parts = word.charAt(word.length-3);
          otherParts = letters.filter(x=>x!=parts);
          source = await findAudio(word);
          
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);

            await partFill({word, parts, otherParts}, async(s)=>{
              if(!s){
                playaudio(source);
                success = false;
                update(card, success);
              }
            });
          }

          if (success) {
            update(card, true);
          }
          else {
            clearTable();
            for(let l of letters){
              source = await findAudio(`long_${l}`);
              if(source){
                teachLetter(l);
                await playaudio(source);
                await fadeTeach(1000);
              }
            }
            source = await findAudio(word);
            if (source){
              $("#playbutton").css("visibility", "visible");
              await playaudio(source);
              await partFill({word, parts, otherParts}, async(s)=>{});
            }
          }

          await displayWord(word);
          await next();
          break;

        case 1: //choose the word you hear out of 4
          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);
  
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
    
        case 2: // listen to the word, combine 2 parts out of 4 to make the word
                // review the meaning
          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);
            
            let a = Math.floor( ( Math.random() * 2) ) + 1; // 1 or 2 letters
            let b = word.length == 4 ? 2 : a == 2 ? 1 : 2;
            let c = word.length - a - b;
            
            let parts = [];
            parts.push( word.substring(word.length - a, word.length));
            parts.push( word.substring(c, word.length - a));
            if (c > 0) parts.push(word.substring(0, c));
            parts.reverse(); // partFill needs them in order

            otherParts = FYshuffle(otherParts).slice(0,2);

            await partFill({word, parts, otherParts}, (s)=>{
              if(!s){
                success = false;
                update(card, false);
                playaudio(source);
              }
            });
          }

          if (success) update(card, true);
          teachWord(meaning);
          displayWord(word);
          await next();
          break;

        case 3: // only listen to the word and choose the meaning out of 4
          source = await findAudio(word);
          if(source){
            $("#playbutton").css("visibility", "visible");
            await playaudio(source);

            otherWords = await getRandomSet({field: 'meaning', num: 3, exclude: meaning});
            await chooseL1({meaning, otherWords}, (s)=>{
              if(!s){
                success = false;
                update(card, false);
                teachWord(word);
              }
            });

          }

          if (success) update(card, true);
          await next();
          break;

        case 4: // unjumble the letters, then choose the meaning out of 4
          source = await findAudio(word);
          if(source){
            await typeL2({word}, (s)=>{
              if(!s){
                success = false;
                update(card, false);
                $("#playbutton").css("visibility", "visible");
                playaudio(source);
              }
            });

            await clearTable();
            displayWord(word);

            otherWords = await getRandomSet({field: 'meaning', num: 3, exclude: meaning});
            await chooseL1({meaning, numOfWrong: 3, otherWords}, (s)=>{
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

        default:
          aim[card] = 2;
          break;
      }
      checkProgress();
    });
  }catch(err){
    console.log(err);
    update(card, true);
    checkProgress();
  }
}
