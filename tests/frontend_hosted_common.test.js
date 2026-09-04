/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Hosted Common Number Selection Controls', () => {
  let $;

  beforeAll(() => {
    $ = require('jquery');
    global.$ = $;
    global.jQuery = $;

    const commonCode = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/hosted/common.js'), 'utf8');
    eval(commonCode);
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('renderHostCountControl', () => {
    test('renders minus and plus buttons without any visible integer field', () => {
      const html = window.hostedNumbers.renderHostCountControl(5, 'vote');
      $('body').html(html);

      // Verify no number input exists
      expect($('input[type="number"]').length).toBe(0);

      // Verify hidden input exists with correct initial value
      const $hidden = $('#vote-total-count-input');
      expect($hidden.length).toBe(1);
      expect($hidden.attr('type')).toBe('hidden');
      expect($hidden.val()).toBe('5');

      // Verify minus and plus buttons exist and match Next button sizing
      const $minus = $('#vote-count-minus');
      const $plus = $('#vote-count-plus');
      expect($minus.length).toBe(1);
      expect($plus.length).toBe(1);
      expect($minus.text()).toBe('−');
      expect($plus.text()).toBe('+');
      expect($minus.hasClass('btn-primary')).toBe(true);
      expect($minus.hasClass('px-4')).toBe(true);
      expect($minus.attr('style')).toContain('min-width: 80px');
      expect($plus.hasClass('btn-primary')).toBe(true);
      expect($plus.hasClass('px-4')).toBe(true);
      expect($plus.attr('style')).toContain('min-width: 80px');
    });

    test('defaults count to 1 if not provided', () => {
      const html = window.hostedNumbers.renderHostCountControl(null, 'vote');
      $('body').html(html);

      expect($('#vote-total-count-input').val()).toBe('1');
    });
  });

  describe('bindHostCountInput', () => {
    test('increments and decrements on button clicks for host in numbers stage', () => {
      const onCountChange = jest.fn();
      const html = window.hostedNumbers.renderHostCountControl(3, 'vote');
      $('body').html(html);

      window.hostedNumbers.bindHostCountInput(
        '#vote-total-count-input',
        () => true,
        () => 'numbers',
        onCountChange
      );

      // Click plus
      $('#vote-count-plus').trigger('click');
      expect($('#vote-total-count-input').val()).toBe('4');
      expect(onCountChange).toHaveBeenCalledWith(4);

      // Click minus
      $('#vote-count-minus').trigger('click');
      expect($('#vote-total-count-input').val()).toBe('3');
      expect(onCountChange).toHaveBeenCalledWith(3);
    });

    test('does not decrement below 1', () => {
      const onCountChange = jest.fn();
      const html = window.hostedNumbers.renderHostCountControl(1, 'vote');
      $('body').html(html);

      window.hostedNumbers.bindHostCountInput(
        '#vote-total-count-input',
        () => true,
        () => 'numbers',
        onCountChange
      );

      $('#vote-count-minus').trigger('click');
      expect($('#vote-total-count-input').val()).toBe('1');
      expect(onCountChange).not.toHaveBeenCalled();
    });

    test('ignores clicks if not host', () => {
      const onCountChange = jest.fn();
      const html = window.hostedNumbers.renderHostCountControl(5, 'vote');
      $('body').html(html);

      window.hostedNumbers.bindHostCountInput(
        '#vote-total-count-input',
        () => false,
        () => 'numbers',
        onCountChange
      );

      $('#vote-count-plus').trigger('click');
      expect($('#vote-total-count-input').val()).toBe('5');
      expect(onCountChange).not.toHaveBeenCalled();
    });

    test('ignores clicks if not in numbers stage', () => {
      const onCountChange = jest.fn();
      const html = window.hostedNumbers.renderHostCountControl(5, 'vote');
      $('body').html(html);

      window.hostedNumbers.bindHostCountInput(
        '#vote-total-count-input',
        () => true,
        () => 'voting',
        onCountChange
      );

      $('#vote-count-plus').trigger('click');
      expect($('#vote-total-count-input').val()).toBe('5');
      expect(onCountChange).not.toHaveBeenCalled();
    });
  });

  describe('Next button styling and right arrow', () => {
    test('Next button is green (btn-success), has min-width 80px, and contains right arrow icon', () => {
      const voteJs = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/hosted/vote.js'), 'utf8');
      expect(voteJs).toMatch(/btn-success/);
      expect(voteJs).toMatch(/bi-arrow-right/);
      expect(voteJs).toMatch(/style="min-width: 80px; height: 32px;"/);

      const popquizJs = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/hosted/popquiz.js'), 'utf8');
      expect(popquizJs).toMatch(/btn-success/);
      expect(popquizJs).toMatch(/bi-arrow-right/);

      const raffleJs = fs.readFileSync(path.join(__dirname, '../public/javascripts/lobby/hosted/raffle.js'), 'utf8');
      expect(raffleJs).toMatch(/btn-success/);
      expect(raffleJs).toMatch(/bi-arrow-right/);
    });
  });
});

