const allParts = ['cl','fl','pl','sl','dr','fr','gr','sn','sp','st','sw','sk',
                  'tw','nk','lt','rt','ft','ld','lf','nd','mp','ng','lk','nt'];

const extraWords = {//Not in the set but you might know them & they're not wrong
  "plug": "コンセント", "trap": "罠", "vest": "ベスト", "dusk": "夕暮れ", 
  "clay": "ねんど", "drip": "ポタポタ落ちる", "plot": "陰謀", "jump": "とぶ", 
  "bald": "はげ", "burn": "燃える", "monk": "坊主", "ring": "指輪",
  "salt": "塩", "turn": "曲がる", "test": "テスト", "word": "単語",
  "worm": "虫", "cart": "カート", "dark": "暗い", "farm": "農場",
  "hard": "難しい", "park": "公園", "dust": "ほこり", "last": "最後",
  "list": "リスト", "nest": "巣", "risk": "リスク", "song": "歌", 
  "fart": "おなら", "barf": "吐き出す", "snot": "鼻水", "spit": "つば", 
  "burp": "げっぷ", "pets": "ペット", "soft": "やわらかい", "horn": "つの", 
  "torn": "破れた", "drug": "薬", "film": "フイルム", "bowl": "茶碗",
  "stop": "止まれ", "spot": "水玉", "pest": "害虫", "palm": "手のひら", 
  "pump": "ポンプ", "span": "広がる", "spur": "刺激", "spun": "繰り返す", 
  "garb": "衣服", "gasp": "息をする", "knob": "ノブ", "pram": "ベビーカー", 
  "best": "最高", "rest": "休憩", "test": "テスト", "stub": "切り株", 
  "tomb": "墓", "font": "フォント", "fond": "好き"
};

const blends = [
  { word: "clap", meaning: "拍手", otherLetters: ["b", "r", "t"], otherParts: ["fl", "pl"] },
  { word: "flag", meaning: "旗", otherLetters: ["b", "m", "g"], otherParts: ["cl", "sl"] },
  { word: "plug", meaning: "コンセント", otherLetters: ["d", "t", "s"], otherParts: ["sl", "dr"] },
  { word: "sled", meaning: "そり", otherLetters: ["c", "p", "t"], otherParts: ["cl", "fl"] },
  { word: "drip", meaning: "ポタポタ落ちる", otherLetters: ["b", "t", "m"], otherParts: ["fr", "gr"] },
  { word: "frog", meaning: "カエル", otherLetters: ["b", "m", "t"], otherParts: ["dr", "gr"] },
  { word: "grab", meaning: "つかむ", otherLetters: ["b", "m", "s"], otherParts: ["dr", "fr"] },
  { word: "snap", meaning: "パチンと鳴らす", otherLetters: ["b", "k", "t"], otherParts: ["sp", "st"] },
  { word: "spin", meaning: "回る", otherLetters: ["b", "k", "t"], otherParts: ["sn", "sw"] },
  { word: "stop", meaning: "止まれ", otherLetters: ["b", "k", "m"], otherParts: ["sp", "sk"] },
  { word: "swim", meaning: "泳ぐ", otherLetters: ["b", "k", "t"], otherParts: ["sk", "st"] },
  { word: "skid", meaning: "スリップ", otherLetters: ["b", "m", "t"], otherParts: ["sp", "st"] },
  { word: "twin", meaning: "双子", otherLetters: ["b", "m", "k"], otherParts: ["sw", "sk"] },
  { word: "pink", meaning: "ピンク", otherLetters: ["b", "m", "t"], otherParts: ["lt", "rt"] },
  { word: "belt", meaning: "ベルト", otherLetters: ["b", "m", "p"], otherParts: ["nk", "ft"] },
  { word: "cart", meaning: "カート", otherLetters: ["b", "m", "p"], otherParts: ["lt", "ft"] },
  { word: "gift", meaning: "プレゼント", otherLetters: ["b", "m", "p"], otherParts: ["rt", "ld"] },
  { word: "gold", meaning: "金", otherLetters: ["b", "m", "p"], otherParts: ["lf", "nd"] },
  { word: "golf", meaning: "ゴルフ", otherLetters: ["b", "m", "p"], otherParts: ["ld", "nd"] },
  { word: "hand", meaning: "手", otherLetters: ["b", "m", "p"], otherParts: ["mp", "ng"] },
  { word: "lamp", meaning: "ランプ", otherLetters: ["b", "m", "t"], otherParts: ["nd", "ng"] },
  { word: "ring", meaning: "指輪", otherLetters: ["b", "m", "t"], otherParts: ["mp", "lk"] },
  { word: "milk", meaning: "牛乳", otherLetters: ["b", "t", "p"], otherParts: ["ng", "nt"] },
  { word: "tent", meaning: "テント", otherLetters: ["b", "m", "p"], otherParts: ["lk", "mp"] }
];

async function loadAnActivity(card, rank){
  try{
    console.log("card: ", card, "rank: ", rank);
    let success = true;
    let data = blends[card];
    if(!data) {
      update(card, true);
      checkProgress();
      return;
    }
    let word = data.word;
    let meaning = data.meaning;
    let otherLetters = data.otherLetters;
    let otherParts = data.otherParts;
    let source = `/audio/words/${word}.mp3`;
    $("#rank").html(rank);

    switch (rank){
      case 0: // listen to the word, combine 2 parts out of 4 to make the word
              // learn the meaning
        $("#playbutton").css("visibility", "visible");
        await playaudio(source);
        
        let parts = [ word.slice(0,2), word.slice(2) ];
        let extraParts = FYshuffle(otherParts).slice(0,2);

        await partFill({word, parts, otherParts: extraParts}, (s)=>{
          if(!s){
            success = false;
            update(card, false);
            playaudio(source);
          }
        });

        if (success) update(card, true);
        teachWord(meaning);
        displayWord(word);
        await next();
        break;

      case 1: // listen to the word, type the 2 blended letters to complete it
              // review meaning
        $("#playbutton").css("visibility", "visible");
        await playaudio(source);
        
        // find which blend the word includes
        let part = allParts.filter(x=>[word.slice(0,2), word.slice(2)].includes(x))[0];

        let extraLetters = FYshuffle(otherLetters).slice(0,2);
        await typePart({word, part, otherLetters: extraLetters}, (s)=>{
          if(!s){
            success = false;
            update(card, false);
            teachWord(word);
            playaudio(source);
          }
        });

        if (success) update(card, true);
        teachWord(meaning);
        displayWord(word);
        await next();
        break;

      case 2: // only listen to the word and choose the meaning out of 4
        $("#playbutton").css("visibility", "visible");
        await playaudio(source);

        let otherWords2 = FYshuffle(blends.filter(b => b.meaning !== meaning).map(b => b.meaning)).slice(0, 3);
        await chooseL1({meaning, otherWords: otherWords2}, (s)=>{
          if(!s){
            success = false;
            update(card, false);
            teachWord(word);
            playaudio(source);
          }
        });

        if (success) update(card, true);
        await next();
        break;

      case 3: // only read the meaning and type the word using 4 of 6 letters
        teachWord(meaning);

        await typeL2({word, otherLetters}, async (s)=>{
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

        if (success) update(card, true);
        displayWord(word);
        await next();
        break;

      case 4: // unjumble the letters, then choose the meaning out of 4
        await typeL2({word}, (s)=>{
          if(!s){
            success = false;
            update(card, false);
            $("#playbutton").css("visibility", "visible");
            playaudio(source);
          }
        });

        displayWord(word);

        let otherWords4 = FYshuffle(blends.filter(b => b.meaning !== meaning).map(b => b.meaning)).slice(0, 3);
        await chooseL1({meaning, numOfWrong: 3, otherWords: otherWords4}, (s)=>{
          if(!s){
            success = false;
            update(card, false);
            $("#playbutton").css("visibility", "visible");
            playaudio(source);
          }
        });

        if (success) update(card, true);
        await next();
        break;

      default:
        aim[card] = 2;
        break;
    }
    checkProgress();
  }
  catch(err){
    console.error('loadAnActivity error:', err);
    update(card, true);
    checkProgress();
  }
}
