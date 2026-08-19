const { getNHVocab } = require('../config/nh_helpers');
const vocabulary = require('../public/vocabulary.js');

jest.mock('../public/vocabulary.js', () => ([
  { id: 1, book: 'NH', page: '8_9', theme: 'feelings', word: 'happy' },
  { id: 2, book: 'LT', page: 'null', theme: 'fruit', word: 'apple' },
  { id: 3, book: 'NH', page: '10_11', theme: 'animals', word: 'dog' },
  { id: 4, book: 'NH', page: '10_11', theme: 'animals', word: 'cat' },
  { id: 5, book: 'NH', page: '12_13', theme: 'colors+', word: 'red' },
  { id: 6, book: 'NH', page: '12_13', theme: 'colors+', word: 'blue' },
]));

describe('getNHVocab', () => {
  it('should filter for NH book, group by page and theme, and handle themes with +', async () => {
    const nhVocab = await getNHVocab();

    const expectedVocab = {
      '8_9': {
        feelings: {
          happy: 1,
        },
      },
      '10_11': {
        animals: {
          dog: 3,
          cat: 4,
        },
      },
      '12_13': {},
      '+': {
        'colors+': {
          red: 5,
          blue: 6,
        },
      },
    };

    expect(nhVocab).toEqual(expectedVocab);
  });
});
