const vocabulary = require('../public/vocabulary.js');

const NH_colors = {
  "#ffa9a0" : ["8_9", "22_23"],   // red
  "#ddefb7" : ["10_11", "24_25"], // green
  "#cdaed2" : ["12_13", "34_35"], // purple
  "#ffd3b5" : ["14_15", "26_27"], // orange
  "#bfe0fa" : ["16_17", "28_29"], // blue
  "#c4bd9a" : ["18_19", "30_31"], // olive
  "#ffcbda" : ["20_21", "32_33"]  // pink
};

async function getNHVocab(){
  let rows = vocabulary.filter(item => item.book === 'NH');
  let NH_vocab = {};
  for (let row of rows){
    if ( !NH_vocab[row.page] ) NH_vocab[row.page] = {};
    if ( !NH_vocab[row.page][row.theme] ) NH_vocab[row.page][row.theme] = {};
    NH_vocab[row.page][row.theme][row.word] = row.id;
  }

  NH_vocab['+'] = {};
  for (let p in NH_vocab){
    for (let t in NH_vocab[p]){
      if (t.indexOf('+') > -1){
        let plus = NH_vocab[p][t];
        delete NH_vocab[p][t];
        NH_vocab['+'][t] = plus;
      }
    }
  }
  return NH_vocab;
}

module.exports = { NH_colors, getNHVocab };
