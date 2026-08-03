// config/srs_cards.js — Card datasets for SRS activities (Friendly H, Magic E, etc.)

const h_cards = [
  {
    word: "ship",
    meaning: "船",
    otherWords: ["shop", "fish", "chin"],
    otherLetters: ["b", "t", "r"],
    otherParts: ["ch", "th", "wh"],
    sentence: "The ship is big."
  },
  {
    word: "shop",
    meaning: "店",
    otherWords: ["ship", "chop", "dish"],
    otherLetters: ["m", "k", "l"],
    otherParts: ["ch", "th", "ph"],
    sentence: "We go to the shop."
  },
  {
    word: "fish",
    meaning: "魚",
    otherWords: ["dish", "wish", "rich"],
    otherLetters: ["p", "d", "g"],
    otherParts: ["ch", "th", "wh"],
    sentence: "I see a fish."
  },
  {
    word: "dish",
    meaning: "皿",
    otherWords: ["fish", "wish", "dash"],
    otherLetters: ["b", "m", "t"],
    otherParts: ["ch", "th", "ph"],
    sentence: "Put it on the dish."
  },
  {
    word: "wish",
    meaning: "ねがい",
    otherWords: ["dish", "fish", "wash"],
    otherLetters: ["k", "p", "r"],
    otherParts: ["ch", "th", "wh"],
    sentence: "Make a wish."
  },
  {
    word: "cash",
    meaning: "現金",
    otherWords: ["dash", "rash", "hash"],
    otherLetters: ["p", "b", "m"],
    otherParts: ["ch", "th", "ph"],
    sentence: "Pay with cash."
  },
  {
    word: "rush",
    meaning: "急ぐ",
    otherWords: ["hush", "mush", "dash"],
    otherLetters: ["t", "b", "l"],
    otherParts: ["ch", "th", "wh"],
    sentence: "Do not rush."
  },
  {
    word: "dash",
    meaning: "ダッシュ",
    otherWords: ["cash", "rash", "hush"],
    otherLetters: ["m", "p", "k"],
    otherParts: ["ch", "th", "ph"],
    sentence: "Make a quick dash."
  },
  {
    word: "chin",
    meaning: "あご",
    otherWords: ["chip", "chop", "thin"],
    otherLetters: ["m", "s", "b"],
    otherParts: ["sh", "th", "wh"],
    sentence: "Touch your chin."
  },
  {
    word: "chip",
    meaning: "チップ",
    otherWords: ["chin", "chop", "ship"],
    otherLetters: ["t", "l", "r"],
    otherParts: ["sh", "th", "ph"],
    sentence: "Eat a potato chip."
  },
  {
    word: "chop",
    meaning: "切る",
    otherWords: ["chip", "chin", "shop"],
    otherLetters: ["m", "b", "d"],
    otherParts: ["sh", "th", "wh"],
    sentence: "Chop the wood."
  },
  {
    word: "chat",
    meaning: "おしゃべり",
    otherWords: ["that", "math", "path"],
    otherLetters: ["b", "p", "r"],
    otherParts: ["sh", "th", "ph"],
    sentence: "Let us chat."
  },
  {
    word: "rich",
    meaning: "金持ち",
    otherWords: ["much", "such", "fish"],
    otherLetters: ["b", "m", "t"],
    otherParts: ["sh", "th", "wh"],
    sentence: "He is rich."
  },
  {
    word: "much",
    meaning: "たくさん",
    otherWords: ["rich", "such", "moth"],
    otherLetters: ["p", "l", "k"],
    otherParts: ["sh", "th", "ph"],
    sentence: "Thank you very much."
  },
  {
    word: "such",
    meaning: "そのような",
    otherWords: ["much", "rich", "rush"],
    otherLetters: ["m", "t", "b"],
    otherParts: ["sh", "th", "wh"],
    sentence: "It is such a good day."
  },
  {
    word: "math",
    meaning: "算数",
    otherWords: ["path", "bath", "moth"],
    otherLetters: ["b", "p", "l"],
    otherParts: ["ch", "sh", "ph"],
    sentence: "I like math."
  },
  {
    word: "path",
    meaning: "小道",
    otherWords: ["math", "bath", "dash"],
    otherLetters: ["m", "b", "r"],
    otherParts: ["ch", "sh", "wh"],
    sentence: "Follow the path."
  },
  {
    word: "bath",
    meaning: "お風呂",
    otherWords: ["math", "path", "dash"],
    otherLetters: ["p", "l", "k"],
    otherParts: ["ch", "sh", "ph"],
    sentence: "Take a bath."
  },
  {
    word: "thin",
    meaning: "薄い",
    otherWords: ["chin", "then", "with"],
    otherLetters: ["b", "m", "p"],
    otherParts: ["ch", "sh", "wh"],
    sentence: "The book is thin."
  },
  {
    word: "with",
    meaning: "〜と一緒に",
    otherWords: ["wish", "rich", "math"],
    otherLetters: ["p", "b", "l"],
    otherParts: ["ch", "sh", "ph"],
    sentence: "Come with me."
  },
  {
    word: "moth",
    meaning: "蛾",
    otherWords: ["math", "path", "much"],
    otherLetters: ["b", "p", "r"],
    otherParts: ["ch", "sh", "wh"],
    sentence: "The moth flies."
  },
  {
    word: "shut",
    meaning: "閉める",
    otherWords: ["shot", "ship", "shop"],
    otherLetters: ["b", "m", "p"],
    otherParts: ["ch", "th", "ph"],
    sentence: "Shut the door."
  },
  {
    word: "shed",
    meaning: "小屋",
    otherWords: ["ship", "shop", "red"],
    otherLetters: ["b", "p", "m"],
    otherParts: ["ch", "th", "wh"],
    sentence: "Tools are in the shed."
  },
  {
    word: "chug",
    meaning: "一気飲み",
    otherWords: ["hug", "bug", "chop"],
    otherLetters: ["b", "m", "p"],
    otherParts: ["sh", "th", "ph"],
    sentence: "Chug the water."
  }
];

const e_cards = [
  { word: "make", meaning: "作る", otherWords: ["cake", "lake", "take"], otherLetters: ["b", "p", "t"], otherParts: ["a", "i", "o"], sentence: "Make a cake." },
  { word: "lake", meaning: "みずうみ", otherWords: ["make", "cake", "take"], otherLetters: ["b", "p", "m"], otherParts: ["a", "i", "u"], sentence: "Swim in the lake." },
  { word: "cake", meaning: "ケーキ", otherWords: ["make", "lake", "bake"], otherLetters: ["p", "t", "r"], otherParts: ["a", "e", "o"], sentence: "Eat the cake." },
  { word: "take", meaning: "とる", otherWords: ["make", "lake", "cake"], otherLetters: ["b", "p", "m"], otherParts: ["a", "i", "o"], sentence: "Take a picture." },
  { word: "bike", meaning: "自転車", otherWords: ["hike", "like", "bake"], otherLetters: ["p", "m", "t"], otherParts: ["i", "a", "o"], sentence: "Ride a bike." },
  { word: "like", meaning: "好き", otherWords: ["bike", "hike", "make"], otherLetters: ["b", "p", "t"], otherParts: ["i", "e", "u"], sentence: "I like apples." },
  { word: "hike", meaning: "ハイキング", otherWords: ["bike", "like", "lake"], otherLetters: ["b", "m", "p"], otherParts: ["i", "a", "o"], sentence: "Hike up the mountain." },
  { word: "kite", meaning: "凧", otherWords: ["bite", "white", "cute"], otherLetters: ["b", "m", "p"], otherParts: ["i", "a", "u"], sentence: "Fly a kite." },
  { word: "home", meaning: "家", otherWords: ["cone", "bone", "same"], otherLetters: ["b", "p", "t"], otherParts: ["o", "a", "i"], sentence: "Go home." },
  { word: "bone", meaning: "骨", otherWords: ["home", "cone", "zone"], otherLetters: ["p", "m", "t"], otherParts: ["o", "u", "a"], sentence: "The dog has a bone." },
  { word: "cone", meaning: "コーン", otherWords: ["home", "bone", "cute"], otherLetters: ["b", "p", "m"], otherParts: ["o", "i", "a"], sentence: "Ice cream cone." },
  { word: "rose", meaning: "バラ", otherWords: ["nose", "pose", "hose"], otherLetters: ["b", "p", "m"], otherParts: ["o", "a", "u"], sentence: "A red rose." },
  { word: "cute", meaning: "かわいい", otherWords: ["mute", "mule", "cube"], otherLetters: ["b", "p", "m"], otherParts: ["u", "a", "i"], sentence: "A cute cat." },
  { word: "mule", meaning: "ラバ", otherWords: ["cute", "cube", "rule"], otherLetters: ["b", "p", "t"], otherParts: ["u", "o", "a"], sentence: "The mule walks." },
  { word: "tube", meaning: "チューブ", otherWords: ["cube", "cute", "mule"], otherLetters: ["b", "p", "m"], otherParts: ["u", "i", "e"], sentence: "A tube of paste." },
  { word: "game", meaning: "ゲーム", otherWords: ["name", "same", "came"], otherLetters: ["b", "p", "t"], otherParts: ["a", "o", "i"], sentence: "Play a game." },
  { word: "name", meaning: "名前", otherWords: ["game", "same", "came"], otherLetters: ["b", "p", "t"], otherParts: ["a", "e", "u"], sentence: "What is your name?" },
  { word: "same", meaning: "同じ", otherWords: ["game", "name", "came"], otherLetters: ["b", "p", "t"], otherParts: ["a", "i", "o"], sentence: "They look the same." },
  { word: "time", meaning: "時間", otherWords: ["lime", "dime", "same"], otherLetters: ["b", "p", "m"], otherParts: ["i", "a", "e"], sentence: "What time is it?" },
  { word: "line", meaning: "線", otherWords: ["fine", "nine", "mine"], otherLetters: ["b", "p", "t"], otherParts: ["i", "o", "a"], sentence: "Draw a line." },
  { word: "nose", meaning: "鼻", otherWords: ["rose", "pose", "hose"], otherLetters: ["b", "p", "m"], otherParts: ["o", "a", "i"], sentence: "Touch your nose." },
  { word: "rope", meaning: "ロープ", otherWords: ["hope", "soap", "rose"], otherLetters: ["b", "p", "m"], otherParts: ["o", "u", "i"], sentence: "Pull the rope." },
  { word: "cave", meaning: "洞窟", otherWords: ["wave", "save", "gave"], otherLetters: ["b", "p", "m"], otherParts: ["a", "o", "i"], sentence: "Enter the cave." },
  { word: "wave", meaning: "波", otherWords: ["cave", "save", "gave"], otherLetters: ["b", "p", "m"], otherParts: ["a", "e", "u"], sentence: "See the ocean wave." }
];

function getSRSCard(set, index) {
  let cards = [];
  if (set === 'h') cards = h_cards;
  else if (set === 'e') cards = e_cards;

  if (cards.length === 0) return null;
  let idx = Math.abs(index) % cards.length;
  // Return deep copy so client modifications don't alter original arrays
  return JSON.parse(JSON.stringify(cards[idx]));
}

module.exports = { getSRSCard };
