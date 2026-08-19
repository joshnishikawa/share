/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Frontend study_utilities.js', () => {
  beforeAll(() => {
    const $ = require('jquery');
    global.$ = $;
    global.jQuery = $;

    const code = fs.readFileSync(path.join(__dirname, '../public/javascripts/study_utilities.js'), 'utf8');
    eval(code);
  });

  describe('Card HTML Builders', () => {
    test('letter creates clickable tile with value attribute', () => {
      const html = letter('A');
      expect(html).toContain('value="A"');
      expect(html).toContain('display-4');
      expect(html).toContain('>A<');
    });

    test('rightLetter vs wrongLetter ids and classes', () => {
      const right = rightLetter('B');
      const wrong = wrongLetter('C');

      expect(right).toContain('id="correct"');
      expect(right).not.toContain('incorrect');
      expect(right).toContain('letter display-1');

      expect(wrong).not.toContain('id="correct"');
      expect(wrong).toContain('incorrect');
      expect(wrong).toContain('letter display-1');
    });

    test('rightWord vs wrongWord', () => {
      const right = rightWord('cat');
      const wrong = wrongWord('dog');

      expect(right).toContain('id="correct"');
      expect(right).toContain('display-4');

      expect(wrong).toContain('incorrect');
      expect(wrong).toContain('display-4');
    });

    test('rightSentence vs wrongSentence', () => {
      const right = rightSentence('This is a dog.');
      const wrong = wrongSentence('This is a cat.');

      expect(right).toContain('id="correct"');
      expect(right).toContain('display-6');

      expect(wrong).toContain('incorrect');
      expect(wrong).toContain('display-6');
    });

    test('rightPic and wrongPic use alert-primary and img-fit', () => {
      const right = rightPic('/image/dog.svg');
      const wrong = wrongPic('/image/cat.svg');

      expect(right).toContain('alert-primary');
      expect(right).toContain('src="/image/dog.svg"');
      expect(right).toContain('id="correct"');

      expect(wrong).toContain('alert-primary');
      expect(wrong).toContain('src="/image/cat.svg"');
      expect(wrong).toContain('incorrect');
    });

    test('drag tiles builders: dragPart, dragWord, dragPic', () => {
      expect(dragPart('sh')).toContain('drag');
      expect(dragPart('sh')).toContain('sh');

      expect(dragWord('apple')).toContain('drag');
      expect(dragWord('apple')).toContain('display-6');

      const pic = dragPic('dog', '/image/dog.svg');
      expect(pic).toContain('value="dog"');
      expect(pic).toContain('src="/image/dog.svg"');
    });
  });

  describe('Fill Layout Builders', () => {
    test('getGapFill creates drop targets for target words', () => {
      const sentence = 'I like apples and bananas.';
      const html = getGapFill(sentence, ['apples', 'bananas']);

      expect(html).toContain('drag target inner-shadow');
      expect(html).toContain('value="0"'); // index of apples
      expect(html).toContain('value="1"'); // index of bananas
    });

    test('getTypeFill creates underscore slots with cursor on first slot', () => {
      const html = getTypeFill('I have a cat.', 'cat');

      expect(html).toContain('id="space0"');
      expect(html).toContain('<span id="cursor">_</span>');
      expect(html).toContain('id="space1"');
      expect(html).toContain('id="space2"');
    });

    test('getPartFill creates drop targets for sub-word parts in descending length order', () => {
      const html = getPartFill('ship', ['sh', 'ip']);

      expect(html).toContain('drag target inner-shadow');
      expect(html).toContain('value="0"');
    });

    test('getTypePartFill creates underscore slots for sub-word part', () => {
      const html = getTypePartFill('sheep', 'sh');

      expect(html).toContain('id="space0"');
      expect(html).toContain('id="space1"');
      expect(html).toContain('eep');
    });
  });

  describe('Sort Layout Builders', () => {
    test('getSortPics and getSortWords generate column layouts with drop targets', () => {
      const groups = {
        'A': ['apple', 'ant'],
        'B': ['banana', 'bear'],
      };

      const picsHtml = getSortPics(groups);
      expect(picsHtml).toContain('>A<');
      expect(picsHtml).toContain('>B<');
      expect(picsHtml).toContain('value="A"');
      expect(picsHtml).toContain('value="B"');

      const wordsHtml = getSortWords(groups);
      expect(wordsHtml).toContain('>A<');
      expect(wordsHtml).toContain('>B<');
      expect(wordsHtml).toContain('text-primary');
    });
  });

  describe('Progress & Helper Utilities', () => {
    test('randIndexOf returns random index matching target value', () => {
      const arr = ['a', 'b', 'c', 'b', 'd'];
      const index = randIndexOf('b', arr);
      expect([1, 3]).toContain(index);
    });

    test('progressToPercent calculates accurate percentage based on base offset', () => {
      const aim = [2, 2, 2, 2]; // Total sum = 8, denom = (4 * 2) - 0 = 8 -> 100%
      expect(progressToPercent(aim, 0)).toBe(100);

      const half = [2, 0, 2, 0]; // Total sum = 4, denom = 8 -> 50%
      expect(progressToPercent(half, 0)).toBe(50);
    });

    test('progressPie.progress adjusts half-circle rotations based on percent', () => {
      document.body.innerHTML = `
        <div class="pie-container">
          <div class="left-half"></div>
          <div class="right-half"></div>
        </div>
      `;

      progressPie.leftHalf = null;
      progressPie.rightHalf = null;

      // <= 50%
      progressPie.progress(25);
      expect(document.querySelector('.left-half').style.visibility).toBe('hidden');
      expect(document.querySelector('.right-half').style.transform).toBe('rotate(90deg)');

      // > 50%
      progressPie.progress(75);
      expect(document.querySelector('.left-half').style.visibility).toBe('visible');
      expect(document.querySelector('.left-half').style.transform).toBe('rotate(270deg)');
      expect(document.querySelector('.right-half').style.transform).toBe('rotate(180deg)');
    });

    test('progressPie.slammer returns warning or danger icon according to difficulty', () => {
      expect(progressPie.slammer(2)).toContain('text-danger');
      expect(progressPie.slammer(1)).toContain('text-warning');
      expect(progressPie.slammer(0)).toBe('');
    });
  });
});
