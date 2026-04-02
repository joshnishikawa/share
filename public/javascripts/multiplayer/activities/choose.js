(function() {
  let selectedWord = null;
  let roundItems = [];
  let chooserNumber = null;
  let hasSubmittedWord = false;
  let currentPlayer = null;
  let currentSocket = null;
  let slideshowTimer = null;
  let slideshowIndex = 0;
  let recognition = null;
  let speechSupported = false;
  let isListening = false;
  let autoListen = true;
  let listenersAttached = false;

  function isChooser() {
    return Number(currentPlayer.number) === Number(chooserNumber);
  }

  function normalize(text) {
    return (text || '').toLowerCase().replace(/[^a-z\s]/g, '').trim();
  }

  function getImageForWord(word) {
    for (let i = 0; i < roundItems.length; i++) {
      if (roundItems[i].word === word) return roundItems[i].image;
    }
    return null;
  }

  function findRecognizedWord(transcript) {
    const spoken = normalize(transcript);
    if (!spoken) return null;

    const exact = roundItems.find((item) => normalize(item.word) === spoken);
    if (exact) return exact.word;

    const included = roundItems.find((item) => {
      const w = normalize(item.word);
      return spoken.includes(w) || w.includes(spoken);
    });
    if (included) return included.word;

    return null;
  }

  function setStatus(text) {
    $('#choose-status').text(text);
  }

  function setSpeakButtonState(enabled, label) {
    const $btn = $('#choose-speak-btn');
    if (!$btn.length) return;
    $btn.prop('disabled', !enabled);
    $btn.text(label || 'Tap To Speak');
  }

  function beginListening() {
    if (!isChooser()) return;
    if (selectedWord) return;
    if (!speechSupported || !recognition) return;
    if (isListening) return;

    $('#choose-heard').text('Listening...');
    setSpeakButtonState(false, 'Listening...');
    isListening = true;
    try {
      recognition.start();
    } catch (e) {
      isListening = false;
      setSpeakButtonState(true, 'Tap To Speak');
    }
  }

  function hasRoundStarted() {
    return roundItems.length > 0;
  }

  function stopListening() {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (e) {
        // no-op
      }
    }
  }

  function initializeSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speechSupported = false;
      setSpeakButtonState(false, 'Speech Not Supported');
      return;
    }

    speechSupported = true;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = function(event) {
      const transcript = event.results[event.results.length - 1][0].transcript;
      $('#choose-heard').text('Heard: ' + transcript);

      const recognizedWord = findRecognizedWord(transcript);
      if (!recognizedWord) {
        setStatus('Not recognized as an available word. Try again.');
        return;
      }

      showSelectedImage(recognizedWord);
      currentSocket.emit('choose/selectimg', {
        roomname: currentPlayer.roomname,
        word: recognizedWord,
      });
    };

    recognition.onend = function() {
      isListening = false;
      if (isChooser() && !selectedWord) {
        setSpeakButtonState(true, 'Tap To Speak');
      }
    };

    recognition.onerror = function() {
      isListening = false;
      if (isChooser() && !selectedWord) {
        setSpeakButtonState(true, 'Tap To Speak');
      }
    };
  }

  function stopSlideshow() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
  }

  function startSlideshow() {
    stopSlideshow();
    if (!roundItems.length) return;

    slideshowIndex = 0;
    $('#choose-selected-preview')
      .attr('src', '/image/LT/' + roundItems[0].image)
      .removeClass('d-none');

    slideshowTimer = setInterval(function() {
      if (!roundItems.length) return;
      slideshowIndex = (slideshowIndex + 1) % roundItems.length;
      $('#choose-selected-preview').attr('src', '/image/LT/' + roundItems[slideshowIndex].image);
    }, 220);
  }

  function setRoleView() {
    if (isChooser()) {
      stopSlideshow();
      $('#choose-chooser-panel').removeClass('d-none');
      $('#choose-guesser-panel').addClass('d-none');
      if (selectedWord) {
        setSpeakButtonState(false, 'Word Selected');
      } else if (speechSupported) {
        setSpeakButtonState(true, 'Tap To Speak');
        if (autoListen) {
          beginListening();
        }
      }
    } else {
      stopListening();
      $('#choose-chooser-panel').addClass('d-none');
      $('#choose-guesser-panel').removeClass('d-none');
    }
  }

  function teardown(socket) {
    if (!listenersAttached) return;
    stopSlideshow();
    stopListening();
    $('#choose-speak-btn').off('click');
    socket.off('choose/waiting');
    socket.off('choose/roundstart');
    socket.off('choose/imageselected');
    socket.off('choose/guesscount');
    socket.off('choose/reveal');
    socket.off('choose/gameover');
    listenersAttached = false;
  }

  function showSelectedImage(word) {
    selectedWord = word;
    const imageName = getImageForWord(word);
    stopSlideshow();

    $('#choose-images img').addClass('thumb').hide();
    $('#choose-images img[alt="' + word + '"]').removeClass('thumb').show();

    if (imageName) {
      $('#choose-selected-preview')
        .attr('src', '/image/LT/' + imageName)
        .removeClass('d-none');
    }

    if (isChooser()) {
      setSpeakButtonState(false, 'Word Selected');
      setStatus('Waiting for guesses...');
    } else {
      setStatus('Pick the matching word.');
    }
  }

  function renderBoard() {
    const $images = $('#choose-images');
    const $words = $('#choose-words');

    $images.empty();
    $words.empty();
    $('#choose-selected-preview').addClass('d-none').attr('src', '');

    setRoleView();

    for (let i = 0; i < roundItems.length; i++) {
      const item = roundItems[i];
      const img = $('<img>', {
        src: '/image/LT/' + item.image,
        class: 'img-fluid thumb me-1 mb-1 choose-image',
        alt: item.word,
      });

      img.on('error', function() {
        if (typeof altOnly === 'function') {
          altOnly(this);
        }
      });

      img.on('click', function() {
        if (!isChooser()) return;
        if (selectedWord) return;
        setStatus('Use Tap To Speak and say a word.');
      });

      $images.append(img);

      const word = $('<div>', {
        class: 'col-4 choose-word py-1',
        text: item.word,
      });

      word.on('click', function() {
        if (isChooser()) return;
        if (!selectedWord || hasSubmittedWord) return;

        hasSubmittedWord = true;
        $('#choose-words .choose-word').addClass('choose-word-disabled');
        $(this).addClass('choose-word-selected');
        currentSocket.emit('choose/selectword', {
          roomname: currentPlayer.roomname,
          word: item.word,
        });
        setStatus('Answer submitted. Waiting for others...');
      });

      $words.append(word);
    }

    if (isChooser()) {
      $('#choose-words .choose-word').addClass('choose-word-disabled');
      if (speechSupported) {
        setStatus('Your turn: tap speak and say a word.');
        setSpeakButtonState(true, 'Tap To Speak');
        if (autoListen) {
          beginListening();
        }
      } else {
        setStatus('Speech recognition unavailable on this device/browser.');
        setSpeakButtonState(false, 'Speech Not Supported');
      }
    } else {
      startSlideshow();
      setStatus('Wait for the active player to choose an image, then choose a word.');
    }
  }

  function mount(options) {
    const socket = options.socket;
    const player = options.player;
    const room = options.room;

    teardown(socket);

    currentSocket = socket;
    currentPlayer = player;
    roundItems = [];
    chooserNumber = null;
    selectedWord = null;
    hasSubmittedWord = false;
    speechSupported = false;
    recognition = null;
    isListening = false;

    $('#choose-images').empty();
    $('#choose-words').empty();
    $('#choose-heard').text('');

    const storedAutoListen = localStorage.getItem('chooseAutoListen');
    autoListen = storedAutoListen === null ? true : storedAutoListen === '1';
    $('#choose-auto-listen').prop('checked', autoListen);

    setStatus('Waiting for all players to load Choose...');

    initializeSpeech();

    $('#choose-speak-btn').off('click').on('click', function() {
      beginListening();
    });

    $('#choose-auto-listen').off('change').on('change', function() {
      autoListen = $(this).is(':checked');
      localStorage.setItem('chooseAutoListen', autoListen ? '1' : '0');

      if (!autoListen && isListening) {
        stopListening();
      }

      if (autoListen && isChooser() && !selectedWord) {
        beginListening();
      }
    });

    socket.on('choose/waiting', function(data) {
      if (hasRoundStarted()) return;
      if (data.ready >= data.expected) {
        setStatus('All players ready. Starting round...');
        return;
      }
      setStatus('Waiting for players: ' + data.ready + '/' + data.expected);
    });

    socket.on('choose/roundstart', function(data) {
      roundItems = data.items || [];
      chooserNumber = data.chooserNumber;
      selectedWord = null;
      hasSubmittedWord = false;
      renderBoard();
    });

    socket.on('choose/imageselected', function(data) {
      showSelectedImage(data.word);
    });

    socket.on('choose/guesscount', function(data) {
      if (isChooser()) {
        setStatus('Guesses: ' + data.guessed + '/' + data.expected);
      }
    });

    socket.on('choose/reveal', function(data) {
      const correctWord = data.correctWord;
      $('#choose-words .choose-word').removeClass('choose-word-selected choose-word-correct choose-word-incorrect choose-word-disabled');

      $('#choose-words .choose-word').filter(function() {
        return $(this).text() === correctWord;
      }).addClass('choose-word-correct');

      for (let i = 0; i < data.results.length; i++) {
        const result = data.results[i];
        if (!result.correct) {
          $('#choose-words .choose-word').filter(function() {
            return $(this).text() === result.word;
          }).addClass('choose-word-incorrect');
        }
      }

      setStatus('Answer: ' + correctWord);
    });

    socket.on('choose/gameover', function() {
      setStatus('Round complete. Starting over...');
      if (isChooser()) {
        socket.emit('activityComplete', {
          roomname: player.roomname,
          activity: 'choose',
        });
      }
    });

    socket.emit('choose/playerready', {
      roomname: player.roomname,
      playerId: player.id,
      playerNumber: player.number,
      totalPlayers: room && room.players ? room.players.length : 0,
    });

    listenersAttached = true;
  }

  window.multiplayerActivities = window.multiplayerActivities || {};
  window.multiplayerActivities.choose = {
    mount: mount,
    teardown: teardown
  };
})();
