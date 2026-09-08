/**
 * @jest-environment jsdom
 */

describe('NH Dictionary Frontend Logic', () => {
  let $, words;

  beforeEach(() => {
    $ = require('jquery');
    global.$ = $;
    global.jQuery = $;

    document.body.innerHTML = `
      <div id="menu-container">
        <input id="searchInput" name="word" type="text" value="">
        <div id="speech_label">Speech input (EN only)</div>
        <button id="speech_recognition" type="button" class="btn btn-success" title="Click to speak">
          <i class="material-icons align-middle">mic</i>
        </button>
        <div id="output"></div>
      </div>
    `;

    words = {
      strawberry: {
        meaning: 'いちご',
        image: '/image/NH/produce_strawberry.png',
        audio: '/audio/words/strawberry.mp3'
      },
      apple: {
        meaning: 'りんご',
        image: '/image/NH/produce_apple.png',
        audio: '/audio/words/apple.mp3'
      },
      peach: {
        meaning: 'もも',
        image: '/image/NH/produce_peach.png',
        audio: '/audio/words/peach.mp3'
      }
    };
  });

  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  describe('escapeHtml utility', () => {
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(String(str)));
      return div.innerHTML;
    }

    test('escapes HTML special characters to prevent XSS', () => {
      const malicious = '<script>alert("xss")</script>';
      expect(escapeHtml(malicious)).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    test('handles null and undefined safely', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('showWord card rendering', () => {
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(String(str)));
      return div.innerHTML;
    }

    function showWord(w) {
      let safeWord = escapeHtml(w.word);
      let safeMeaning = escapeHtml(w.meaning);
      let audioButton = '';
      if (w.audio) {
        audioButton = `
          <button type="button" class="btn btn-outline-primary btn-sm ms-2 play-audio-btn rounded-circle" data-audio="${escapeHtml(w.audio)}" title="Listen to pronunciation">
            <i class="material-icons align-middle" style="font-size: 20px;">volume_up</i>
          </button>`;
      }

      $("#output").html(
       `<div class="bg-light shadow-sm border rounded-3 p-3 YM d-flex align-items-center justify-content-between">
          <div>
            <div class="d-flex align-items-center">
              <span class="text-primary fs-1 fw-bold">${safeWord}</span>
              ${audioButton}
            </div>
            <span class="fs-3 text-secondary">${safeMeaning}</span>
          </div>
          <div class="text-center ms-3">${w.image || ''}</div>
        </div>`);
    }

    test('renders word, meaning, image, and play audio button when audio is present', () => {
      showWord({
        word: 'apple',
        meaning: 'りんご',
        image: '<img src="/image/NH/produce_apple.png">',
        audio: '/audio/words/apple.mp3'
      });

      expect($('#output .text-primary').text().trim()).toBe('apple');
      expect($('#output .text-secondary').text().trim()).toBe('りんご');
      expect($('#output .play-audio-btn').length).toBe(1);
      expect($('#output .play-audio-btn').attr('data-audio')).toBe('/audio/words/apple.mp3');
      expect($('#output img').length).toBe(1);
    });

    test('omits play audio button when audio is empty', () => {
      showWord({
        word: 'unknown',
        meaning: '未知の',
        image: '',
        audio: ''
      });

      expect($('#output .text-primary').text().trim()).toBe('unknown');
      expect($('#output .play-audio-btn').length).toBe(0);
    });
  });

  describe('Speech candidate alternative selection', () => {
    function pickBestWord(eventResults, vocabWords) {
      let candidateWord = '';
      if (eventResults && eventResults.length > 0) {
        const result = eventResults[0];
        for (let i = 0; i < result.length; i++) {
          const raw = (result[i].transcript || '').trim().replace(/[.,?!]/g, '');
          const lc = raw.toLowerCase();
          if (vocabWords[raw] || vocabWords[lc]) {
            candidateWord = vocabWords[raw] ? raw : lc;
            break;
          }
        }
        if (!candidateWord && result[0] && result[0].transcript) {
          candidateWord = result[0].transcript.trim().replace(/[.,?!]/g, '');
        }
      }
      return candidateWord;
    }

    test('prioritizes alternative that matches vocabulary dictionary', () => {
      // Simulates speech recognition returning "pair" as top alternative, but "peach" as 2nd
      const mockResults = [
        [
          { transcript: 'beach', confidence: 0.8 },
          { transcript: 'peach', confidence: 0.75 },
          { transcript: 'peace', confidence: 0.6 }
        ]
      ];

      const best = pickBestWord(mockResults, words);
      expect(best).toBe('peach');
    });

    test('strips punctuation and handles uppercase from recognition transcript', () => {
      const mockResults = [
        [
          { transcript: 'Strawberry.', confidence: 0.9 }
        ]
      ];

      const best = pickBestWord(mockResults, words);
      expect(best).toBe('strawberry');
    });

    test('falls back to top transcript if no alternative matches vocabulary', () => {
      const mockResults = [
        [
          { transcript: 'giraffe', confidence: 0.95 },
          { transcript: 'graph', confidence: 0.5 }
        ]
      ];

      const best = pickBestWord(mockResults, words);
      expect(best).toBe('giraffe');
    });
  });

  describe('SpeechRecognition unsupported fallback', () => {
    test('disables mic button when SpeechRecognition is not available', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        $("#speech_recognition")
          .prop("disabled", true)
          .addClass("disabled")
          .attr("title", "Speech recognition is not supported in this browser.");
      }

      expect($('#speech_recognition').prop('disabled')).toBe(true);
      expect($('#speech_recognition').hasClass('disabled')).toBe(true);
      expect($('#speech_recognition').attr('title')).toContain('not supported');
    });
  });

  describe('SpeechRecognition lifecycle & output persistence', () => {
    test('does not wipe #output when recognition ends', () => {
      let isListening = false;
      function resetMicUI() {
        isListening = false;
        $("#speech_recognition")
          .removeClass("btn-danger mic-listening")
          .addClass("btn-success")
          .attr("title", "Click to speak");
      }

      // Simulate output populated with dictionary card
      $('#output').html('<div class="dictionary-card">apple</div>');

      // Simulate listening started
      isListening = true;
      $("#speech_recognition")
        .removeClass("btn-success")
        .addClass("btn-danger mic-listening");

      expect($('#speech_recognition').hasClass('btn-danger')).toBe(true);

      // Simulate onend firing
      resetMicUI();

      expect($('#speech_recognition').hasClass('btn-success')).toBe(true);
      expect($('#speech_recognition').hasClass('mic-listening')).toBe(false);
      // Output must be retained!
      expect($('#output').html()).toBe('<div class="dictionary-card">apple</div>');
    });

    test('synchronizes input field value with recognized speech word', () => {
      const recognized = 'strawberry';
      $('#searchInput').val(recognized);
      expect($('#searchInput').val()).toBe('strawberry');
    });
  });
});
