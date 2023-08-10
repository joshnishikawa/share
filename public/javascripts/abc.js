const abc = [
  { "letter": "a", 
    "vocab": ["apple","animals","ant"],
    "otherLetters": ["u", "d"],
    "pic": "aei",
    "sound": "short_a"
  },
  { "letter": "b", 
    "vocab": ["banana","bear","ball"],
    "otherLetters": ["d", "v"],
    "pic": "bmp",
    "sound": "b_sound"
  },
  { "letter": "c", 
    "vocab": ["carrot","cow","car"],
    "otherLetters": ["s", "k"],
    "pic": "cdgknstxyz",
    "sound": "k_sound"
  },
  { "letter": "d", 
    "vocab": ["donut","dog","doll"],
    "otherLetters": ["b", "a"],
    "pic": "cdgknstxyz",
    "sound": "d_sound"
  },
  { "letter": "e", 
    "vocab": ["egg","elephant","exit"],
    "otherLetters": ["i", "a"],
    "pic": "aei",
    "sound": "short_e"
  },
  { "letter": "f", 
    "vocab": ["fruit","fish","flower"],
    "otherLetters": ["h", "t"],
    "pic": "fv",
    "sound": "f_sound"
  },
  { "letter": "g", 
    "vocab": ["grapes","gorilla","guitar"],
    "otherLetters": ["z", "j"],
    "pic": "cdgknstxyz",
    "sound": "hard_g"
  },
  { "letter": "h", 
    "vocab": ["horse","house","hand"],
    "otherLetters": ["f", "n"],
    "pic": "u",
    "sound": "h_sound"
  },
  { "letter": "i", 
    "vocab": ["insect","iguana","igloo"],
    "otherLetters": ["l", "e"],
    "pic": "aei",
    "sound": "short_i"
  },
  { "letter": "j", 
    "vocab": ["juice","jellyfish","Japan"],
    "otherLetters": ["g", "i"],
    "pic": "j-ch-sh",
    "sound": "j_sound"
  },
  { "letter": "k", 
    "vocab": ["koala","kite","kettle"],
    "otherLetters": ["c", "q"],
    "pic": "cdgknstxyz",
    "sound": "k_sound"
  },
  { "letter": "l", 
    "vocab": ["lemon","lion","Legos"],
    "otherLetters": ["r", "i"],
    "pic": "l",
    "sound": "l_sound"
  },
  { "letter": "m", 
    "vocab": ["milk","monkey","mask"],
    "otherLetters": ["n", "w"],
    "pic": "bmp",
    "sound": "m_sound"
  },
  { "letter": "n", 
    "vocab": ["numbers","nose","newspaper"],
    "otherLetters": ["u", "m"],
    "pic": "cdgknstxyz",
    "sound": "n_sound"
  },
  { "letter": "o", 
    "vocab": ["olive","octopus","on_off"],
    "otherLetters": ["a", "r"],
    "pic": "o",
    "sound": "short_o"
  },
  { "letter": "p", 
    "vocab": ["pear","penguin","puzzle"],
    "otherLetters": ["q", "t"],
    "pic": "bmp",
    "sound": "p_sound"
  },
  { "letter": "q", 
    "vocab": ["quilt","question","queen"],
    "otherLetters": ["p", "g"],
    "pic": "qw",
    "sound": "q_sound"
  },
  { "letter": "r",
    "vocab": ["rice","rabbit","robot"],
    "otherLetters": ["l", "v"],
    "pic": "r",
    "sound": "r_sound"
  },
  { "letter": "s",
    "vocab": ["salad","snake","square"],
    "otherLetters": ["c", "z"],
    "pic": "cdgknstxyz",
    "sound": "s_sound"
  },
  { "letter": "t", 
    "vocab": ["tomato","tiger","train"],
    "otherLetters": ["f", "p"],
    "pic": "cdgknstxyz",
    "sound": "t_sound"
  },
  { "letter": "u", 
    "vocab": ["upstairs","umbrella","underwear"],
    "otherLetters": ["v", "o"],
    "pic": "u",
    "sound": "short_u"
  },
  { "letter": "v", 
    "vocab": ["vampire","violin","van"],
    "otherLetters": ["w", "y"],
    "pic": "fv",
    "sound": "v_sound"
  },
  { "letter": "w", 
    "vocab": ["watermelon","walrus","wagon"],
    "otherLetters": ["m", "u"],
    "pic": "qw",
    "sound": "w_sound"
  },
  { "letter": "y", 
    "vocab": ["yogurt","yo-yo","yarn"],
    "otherLetters": ["w", "e"],
    "pic": "cdgknstxyz",
    "sound": "hard_y"
  },
  { "letter": "z", 
    "vocab": ["zucchini","zebra","zipper"],
    "otherLetters": ["g", "s"],
    "pic": "cdgknstxyz",
    "sound": "z_sound"
  }
];


// This is only here to to make it easier to reference sounds that need
// reinforcement after certain wrong answers. Reference to these sounds remains
// with the main deck to be used in other activities. 
const sounds = {
  "a": "short_a", "b": "b_sound", "c": "k_sound", "d": "d_sound", "e": "short_e",
  "f": "f_sound", "g": "hard_g", "h": "h_sound", "i": "short_i", "j": "j_sound",
  "k": "k_sound", "l": "l_sound", "m": "m_sound", "n": "n_sound", "o": "short_o",
  "p": "p_sound", "q": "q_sound", "r": "r_sound", "s": "s_sound", "t": "t_sound",
  "u": "short_u", "v": "v_sound", "w": "w_sound", "y": "hard_y", "z": "z_sound"
}


async function loadAnActivity(card, rank){
  try{
    let success = true;
    let letter = abc[card].letter;
    let otherLetters = abc[card].otherLetters;
    let vocab = abc[card].vocab;
    let sound = abc[card].sound;
    let groups = {};
    let other = [];
    let source = '';

    $("#rank").html(rank);

    switch (rank){
      case 0: // sort 3 lower-case letters into 3 boxes with their corresponding capital letters
        groups = {};
        groups[letter.toUpperCase()] = letter;
        for(let l of otherLetters){
          groups[l.toUpperCase()] = l;
        }

        await sortWords({groups}, async (data)=>{
          let source = `/audio/sounds/${sounds[data.word]}.mp3`;

          if(!data.success){
            source = `/audio/letters/${data.word}.mp3`;
            success = false;
            update(card, false);
          }

          playaudio(source);
        });

        if (success) update(card, true);
        await next();
        break;

      case 1: // show 3 boxes each with different letters and a picture that starts with each letter
              // sort the pictures into the boxes
        let allLetters = [letter, ...otherLetters];
        
        for(let card of allLetters){
          await $.get('/SRS/loadcard', {set, card}, async(data)=>{
            let w = FYshuffle(data.vocab)[0];
            groups[card] = w;
          });
        }

        await sortPics({groups}, async (data)=>{
          if(!data.success){
            let source = `/audio/sounds/${sounds[data.word]}.mp3`;
            await playaudio(source);
            success = false;
            update(card, false);
          }
          else{
            let source = `/audio/words/${data.word}.mp3`;
            await playaudio(source);
          }
        });

        if (success) update(card, true);
        await next();
        break;

      case 2: // choose the lette that you hear from 3
        source = `/audio/letters/${letter}.mp3`;
        await playaudio(source);
        $("#playbutton").css("visibility", "visible");

        await chooseL2({word: letter, otherWords: otherLetters}, (s)=>{
          if(!s){
            success = false;
            update(card, false);
            playaudio(`/audio/letters/${letter}.mp3`);
          }
        });

        if (success) update(card, true);
        await next();
        break;

      case 3: // see a letter and 6 pictures, drag the three that start with the letter
        groups[letter] = vocab;

        for(let card of otherLetters){
          await $.get('/SRS/loadcard', {set, card}, async(data)=>{
            for (let w of data.vocab){
              other.push(w);
            }
          });
        }

        other = FYshuffle(other).slice(0,3);
        await sortPics({groups, other}, (s)=>{
          if(!s.success){
            let source = `/audio/sounds/${sound}.mp3`;
            playaudio(source);
            success = false;
            update(card, false);
          }
          else {
            let source = `/audio/words/${s.word}.mp3`;
            playaudio(source);
          }
        });

        if (success) update(card, true);
        await next();
        break;

      case 4: // show two letters and 4 pictures, drag all the pics to their respective boxes
        groups[letter] = FYshuffle(vocab).slice(0,2);

        let ol = FYshuffle(otherLetters)[0];

        await $.get('/SRS/loadcard', {set, "card":ol}, async(data)=>{
          for (let i=0; i<2; i++){
            other.push(data.vocab[i]);
          }
        });

        groups[ol] = other;

        await sortPics({groups}, (s)=>{
          if(!s.success){
            let source = `/audio/sounds/${sounds[s.word]}.mp3`;
            playaudio(source);
            success = false;
            update(card, false);
          }
          else{
            let source = `/audio/words/${s.word}.mp3`;
            playaudio(source);
          }
        });

        if (success){
          update(card, true);
        }
        await next();
        break;

      default:
        aim[card] = 2;
        break;
    }

    checkProgress();
  }
  catch(err){
    console.log(err);
    update(card, true);
    checkProgress();
  }
}
