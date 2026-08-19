/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Frontend script.js utilities', () => {
  beforeAll(() => {
    // Provide jQuery mock/implementation on window
    const $ = require('jquery');
    global.$ = $;
    global.jQuery = $;

    // Load script.js into global context
    const scriptCode = fs.readFileSync(path.join(__dirname, '../public/javascripts/script.js'), 'utf8');
    eval(scriptCode);
  });

  describe('getCookieObject', () => {
    beforeEach(() => {
      // Clear document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
    });

    test('returns empty object when document.cookie is empty', () => {
      document.cookie = '';
      expect(getCookieObject()).toEqual({});
    });

    test('parses single cookie correctly', () => {
      document.cookie = 'username=josh';
      expect(getCookieObject()).toEqual({ username: 'josh' });
    });

    test('parses multiple cookies and trims whitespace around keys', () => {
      document.cookie = 'username=josh; session_token=abc123xyz; theme=dark';
      const cookies = getCookieObject();
      expect(cookies).toEqual({
        username: 'josh',
        session_token: 'abc123xyz',
        theme: 'dark',
      });
      expect(cookies.session_token).toBe('abc123xyz');
      expect(cookies.theme).toBe('dark');
    });
  });

  describe('FYshuffle', () => {
    test('handles empty and single-element arrays', () => {
      expect(FYshuffle([])).toEqual([]);
      expect(FYshuffle([1])).toEqual([1]);
    });

    test('shuffles 2-element arrays containing all items', () => {
      const arr = ['a', 'b'];
      const result = FYshuffle(arr);
      expect(result).toHaveLength(2);
      expect(result).toContain('a');
      expect(result).toContain('b');
    });

    test('preserves all items and length for multi-element array', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const copy = [...original];
      const shuffled = FYshuffle(copy);

      expect(shuffled).toHaveLength(10);
      expect(shuffled.sort((a, b) => a - b)).toEqual(original);
    });
  });

  describe('parallelShuffle', () => {
    test('shuffles two arrays in exact lockstep', () => {
      const a = [1, 2, 3, 4, 5];
      const b = ['one', 'two', 'three', 'four', 'five'];
      const map = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

      const [shuffledA, shuffledB] = parallelShuffle(a, b);
      expect(shuffledA).toHaveLength(5);
      expect(shuffledB).toHaveLength(5);

      for (let i = 0; i < shuffledA.length; i++) {
        expect(map[shuffledA[i]]).toBe(shuffledB[i]);
      }
    });
  });

  describe('getGrid', () => {
    test('returns expected layouts for different item counts', () => {
      expect(getGrid({ length: 36, even: false })).toEqual({ length: 36, colspan: 2, rowheight: 15 });
      expect(getGrid({ length: 25, even: false })).toEqual({ length: 24, colspan: 2, rowheight: 24 });
      expect(getGrid({ length: 16, even: true })).toEqual({ length: 16, colspan: 3, rowheight: 24 });
      expect(getGrid({ length: 9, even: false })).toEqual({ length: 9, colspan: 4, rowheight: 32 });
      // 9 items is skipped when data.even is true
      expect(getGrid({ length: 9, even: true })).toEqual({ length: 8, colspan: 3, rowheight: 49 });
      expect(getGrid({ length: 2, even: false })).toEqual({ length: 4, colspan: 6, rowheight: 49 });
    });
  });

  describe('altOnly', () => {
    test('replaces image element with its alt text', () => {
      document.body.innerHTML = '<div id="container"><img id="broken" alt="Dog image" src="broken.jpg"></div>';
      const img = document.getElementById('broken');
      altOnly(img);
      expect(document.getElementById('container').innerHTML).toBe('Dog image');
    });
  });
});
