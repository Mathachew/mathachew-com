var memoryMatchTiles = {
    board: null,
    baseTile: null,
    loaded: false,
    running: false,
    selected: [],
    windowWidth: 0,
    correctScore: function () {
        return this.settings.difficulty.baseScore;
    },
    incorrectScore: -25,
    results: {
        start: null,
        offset: 0,
        stop: null,
        attempts: 0,
        misses: 0,
        score: 0,
        bonus: 0,
        totalMatches: 0,
        longestStreak: 0,
        currentStreak: 0
    },
    types: {
        colors: { id: 0, name: 'Colors' },
        letters: { id: 1, name: 'Letters' },
        numbers: { id: 2, name: 'Numbers' }
        //pictures: { id: 3, name: 'Pictures' }
    },
    difficulties: {
        easy: { count: 4, name: 'Easy', baseScore: 100, multiplier: 10 },
        normal: { count: 8, name: 'Normal', baseScore: 100, multiplier: 20 },
        hard: { count: 12, name: 'Hard', baseScore: 100, multiplier: 35 }
        //expert: { count: 16, name: 'Expert', baseScore: 100, multiplier: 50 }
    },
    options: [],
    answers: [
        [
            { dark: '008299', light: '00A0B1' },
            { dark: '8C0095', light: 'A700AE' },
            { dark: '5133AB', light: '643EBF' },
            { dark: 'A10336', light: 'BF1E4B' },
            { dark: 'BF3418', light: 'DC572E' },
            { dark: '008A00', light: '00A600' },
            { dark: 'C69408', light: 'E1B700' },
            { dark: 'E064B7', light: 'FF76BC' },
            { dark: '623c0f', light: '835A2C' },
            { dark: '536D4A', light: '7c9773' },
            { dark: '425263', light: '657688' },
            { dark: '999999', light: 'CCCCCC' }
        ],
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    ],
    sounds: {
        correct: 'sounds/correct.wav',
        incorrect: 'sounds/wrong.wav',
        finish: 'sounds/finish.wav'
    },
    settings: {},
    intervals: [],
    timers: [],
    getDefaults: function () {
        // select a random color for letters/numbers instead of using a static color
        var randomColor = this.answers[this.types.colors.id][(Math.floor(Math.random() * this.answers[this.types.colors.id].length))];

        return {
            color: randomColor,
            difficulty: this.difficulties.normal,
            type: this.types.colors,
            timed: false
        };
    },
    fisherYates: function (arr) {
        var i = arr.length;
        if (i == 0) {
            return false;
        }
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = arr[i];
            var tempj = arr[j];
            arr[i] = tempj;
            arr[j] = tempi;
        }
        return true;
    },
    init: function () {
        this.windowWidth = $(window).width();
        $(window).resize(function () {
            memoryMatchTiles.resized();
        });

        this.settings = this.getDefaults();
        this.board = document.getElementById('memory-match-board');

        var div = document.createElement('div');

        var tile = div.cloneNode(false);
        tile.className = 'tile';
        tile.appendChild(div.cloneNode(false));
        tile.appendChild(div.cloneNode(false));

        this.baseTile = tile;

        var difficulties = document.getElementById('memory-match-difficulties');
        var types = document.getElementById('memory-match-types');
        var a = document.createElement('button');

        for (var i in this.difficulties) {
            (function (difficulty) {
                var link = a.cloneNode(false);
                link.onclick = function () {
                    memoryMatchTiles.setDifficulty(difficulty, this);
                    memoryMatchTiles.goTo('main');
                };
                link.innerHTML = memoryMatchTiles.difficulties[i].name;

                if (memoryMatchTiles.difficulties[i].name == memoryMatchTiles.settings.difficulty.name) {
                    memoryMatchTiles.setDifficulty(memoryMatchTiles.difficulties[i], link);
                }

                difficulties.appendChild(link);
            })(this.difficulties[i]);
        }

        for (var i in this.types) {
            (function (type) {
                var link = a.cloneNode(false);
                link.onclick = function () {
                    memoryMatchTiles.setType(type, this);
                    memoryMatchTiles.goTo('main');
                };
                link.innerHTML = memoryMatchTiles.types[i].name;

                if (memoryMatchTiles.types[i].name == memoryMatchTiles.settings.type.name) {
                    memoryMatchTiles.setType(memoryMatchTiles.types[i], link);
                }

                types.appendChild(link);
            })(this.types[i]);
        }

        this.goTo('main');
    },
    start: function () {
        MK.enterPage('game');

        $('#memory-match-menu').fadeOut(function () {
            $('#memory-match-goHome').fadeIn();
            $('#memory-match-game').fadeIn(function () {
                memoryMatchTiles.load();
            });
        });
    },
    load: function () {
        this.logEvent('New Game');

        this.reset();
        this.running = true;

        this.fisherYates(this.answers[this.settings.type.id]);

        for (var i = 0; i < this.settings.difficulty.count; i++) {
            this.options.push(this.answers[this.settings.type.id][i]);
        }

        this.results.totalMatches = this.options.length;

        // duplicate the options so that it has a match
        this.options = this.options.concat(this.options);

        this.fisherYates(this.options);

        this.generateBoard();
    },
    playSound: function (soundUrl) {
        return;
        var audio = new Audio(soundUrl);
        audio.preload = 'auto';
        audio.play();
    },
    reset: function () {
        $(this.board).empty();
        $('#memory-match-results').fadeOut();
        $('#memory-match-results span').text('');
        $('#memory-match-progress span').text(0);
        $('#memory-match-progress .timer span').text('0:00.000');

        this.options = [];
        this.loaded = false;
        this.running = false;
        this.results.start = null;
        this.results.stop = null;
        this.results.attempts = -1;
        this.results.misses = 0;
        this.results.bonus = 0;
        this.results.score = 0;
        this.results.totalMatches = 0;
        this.results.longestStreak = 0;
        this.results.currentStreak = 0;

        this.updateScore(0);
        this.updateAttempts();
    },
    updateScore: function (points) {
        this.results.score += points;

        if (this.results.score < 0) {
            this.results.score = 0;
        }

        if (this.results.currentStreak > 1) {
            this.results.bonus += this.settings.difficulty.multiplier * this.results.currentStreak;
        }

        $('#memory-match-progress .score span').text(this.results.score);
        $('#memory-match-progress .streak span').text(this.results.currentStreak);
    },
    updateAttempts: function () {
        $('#memory-match-progress .attempts span').text(++this.results.attempts);
    },
    tileClick: function (e) {
        if (this.results.start == null) {
            this.startTimer();
        }

        if (e.className.indexOf('flipped') >= 0 || this.selected.length == 2) {
            return;
        }

        this.selected.push(e);

        e.className += ' flipped';

        if (this.selected.length == 1) {
            return;
        }

        this.updateAttempts();

        if (this.selected[0].lastChild.getAttribute('data-answer') === this.selected[1].lastChild.getAttribute('data-answer')) {
            this.logEvent('Correct Answer');

            this.results.currentStreak++;

            this.playSound(this.sounds.correct);
            this.updateScore(this.correctScore());

            this.selected[0].onclick = function () { };
            this.selected[1].onclick = function () { };

            this.selected[0].lastChild.innerHTML = '&#10003;';
            this.selected[1].lastChild.innerHTML = '&#10003;';

            this.selected[0].className += ' answered';
            this.selected[1].className += ' answered';

            $(this.selected[0]).delay(1000).animate({ opacity: 0 });
            $(this.selected[1]).delay(1000).animate({ opacity: 0 });

            (function (selected) {
                memoryMatchTiles.timers.push(setTimeout(function () {
                    if (!memoryMatchTiles.running) {
                        return;
                    }
                    selected[0].className = $.trim(selected[0].className.replace('flipped', ''));
                    selected[1].className = $.trim(selected[1].className.replace('flipped', ''));
                }, 1500));
            })(this.selected);

            this.selected = [];

            this.checkFinish();
        }
        else {
            this.logEvent('Incorrect Answer');

            if (this.results.currentStreak > this.results.longestStreak) {
                this.results.longestStreak = this.results.currentStreak;
            }

            this.results.misses++;
            this.results.currentStreak = 0;

            this.playSound(this.sounds.incorrect);
            this.updateScore(this.incorrectScore);
            // animate wrong answers somehow

            (function (selected) {
                memoryMatchTiles.timers.push(setTimeout(function () {
                    if (!memoryMatchTiles.running) {
                        return;
                    }
                    selected[0].className = selected[0].className.replace('flipped', '');
                    selected[1].className = selected[1].className.replace('flipped', '');
                }, 1200));
            })(this.selected);

            this.selected = [];
        }

    },
    checkFinish: function () {
        var remaining = this.options.length - document.getElementsByClassName('answered').length;
        if (remaining > 0) {
            return;
        }

        this.stopTimer();

        if (this.results.currentStreak > this.results.longestStreak) {
            this.results.longestStreak = this.results.currentStreak;
        }

        this.playSound(this.sounds.finish);

        $('#memory-match-results .finalScore span').text(this.results.score + this.results.bonus);
        $('#memory-match-results .score span').text(this.results.score);
        $('#memory-match-results .bonus span').text(this.results.bonus);
        $('#memory-match-results .attempts span').text(this.results.attempts);
        $('#memory-match-results .misses span').text(this.results.misses);
        $('#memory-match-results .streak span').text(this.results.longestStreak);

        var diff = this.results.stop - this.results.start;
        var milliseconds = diff % 1000;
        var seconds = Math.floor((diff / 1000) % 60);
        var minutes = Math.floor((diff / (60 * 1000)) % 60);
        var duration = minutes + ':' + (seconds < 10 ? '0' : '') + seconds + '.' + milliseconds;

        $('#memory-match-results .duration span').text(duration);

        try {
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps['Score'] = this.results.score;
            ps['Streak Bonus'] = this.results.bonus;
            ps['Total Score'] = this.results.score + this.results.bonus;
            ps['Attempts'] = this.results.attempts;
            ps['Misses'] = this.results.misses;
            ps['Best Streak'] = this.results.longestStreak;
            ps['Duration'] = duration;

            MK.sessionEvent('Game Results', ps);
        }
        catch (e) {
            MK.error("Error creating session event 'Game Results'", e);
        }

        $('#memory-match-results').fadeIn();
    },
    createTile: function (option) {
        var tile = this.baseTile.cloneNode(true);
        tile.onclick = function () {
            if (memoryMatchTiles.loaded) {
                memoryMatchTiles.tileClick(this);
            }
        };

        var back = tile.lastChild;
        var answer = '';

        switch (this.settings.type.id) {
            case this.types.colors.id:
                answer = option.light;
                back.style.backgroundColor = '#' + option.light;
                back.style.borderColor = '#' + option.dark;
                back.className = 'color';
                break;

            case this.types.letters.id:
                answer = option;
                back.style.backgroundColor = '#' + this.settings.color.light;
                back.style.borderColor = '#' + this.settings.color.dark;
                back.innerHTML = answer;
                back.className = 'letter';
                break;

            case this.types.numbers.id:
                answer = option < 10 ? '0' + option : option;
                back.style.backgroundColor = '#' + this.settings.color.light;
                back.style.borderColor = '#' + this.settings.color.dark;
                back.innerHTML = answer;
                back.className = 'number';
                break;

            case this.types.pictures.id:
                back.className = 'picture';
                break;
        }

        back.setAttribute('data-answer', answer);

        return tile;
    },
    logEvent: function (eventName) {
        try {
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps['Difficulty'] = this.settings.difficulty.name;

            switch (this.settings.type.id) {
                case this.types.colors.id:
                    ps['Type'] = 'Color';
                    break;

                case this.types.letters.id:
                    ps['Type'] = 'Letter';
                    break;

                case this.types.numbers.id:
                    ps['Type'] = 'Number';
                    break;

                case this.types.pictures.id:
                    ps['Type'] = 'Picture';
                    break;
            }

            MK.sessionEvent(eventName, ps);
        }
        catch (e) {
            MK.error("Error creating session event '" + eventName + "'", e);
        }
    },
    replay: function () {
        this.logEvent('Replay Game');

        var options = this.options;

        this.reset();

        this.options = options;
        this.running = true;

        this.generateBoard();
    },
    generateBoard: function () {
        this.logEvent('Generate Board');

        this.board.className = this.settings.difficulty.name;

        var count = this.options.length;

        for (var i = 0; i < count; i++) {
            var tile = this.createTile(this.options[i]);
            this.board.appendChild(tile);
        }

        var tiles = document.getElementsByClassName('tile');
        var tilesCount = tiles.length;

        this.timers.push(setTimeout(function () {
            if (!memoryMatchTiles.running) {
                return;
            }

            for (var i = 0; i < tilesCount; i++) {
                tiles[i].className += ' flipped';
            }

            memoryMatchTiles.timers.push(setTimeout(function () {
                if (!memoryMatchTiles.running) {
                    return;
                }

                $('.tile > :first-child').css({
                    backgroundColor: '000',
                    borderColor: '000'
                });
            }, 200));
        }, 100));

        this.timers.push(setTimeout(function () {
            for (var i = 0; i < tilesCount; i++) {
                if (!memoryMatchTiles.running) {
                    break;
                }

                tiles[i].className = $.trim(tiles[i].className.replace('flipped', ''));
            }

            memoryMatchTiles.loaded = memoryMatchTiles.running;
        }, count * 300));
    },
    goTo: function (menu) {
        var currentPage = $('nav.active');

        if (currentPage) {
            MK.exitPage(currentPage.attr('id'));
        }

        MK.enterPage(menu);

        currentPage.removeClass('active').fadeOut();
        $('#memory-match-' + menu).addClass('active').fadeIn();
    },
    setDifficulty: function (difficulty, e) {
        try {
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps['Difficulty'] = difficulty.name;

            MK.sessionEvent('Change Difficulty', ps);
        }
        catch (e) {
            MK.error("Error creating session event 'Change Difficulty'", e);
        }

        document.getElementById('memory-match-main').children[0].children[0].innerHTML = difficulty.name;

        $('#memory-match-difficulties .selected').removeClass('selected');
        e.className = 'selected';
        this.settings.difficulty = difficulty;
    },
    setType: function (type, e) {
        try {
            var ps = new Windows.Foundation.Collections.PropertySet();
            ps['Type'] = type.name;

            MK.sessionEvent('Change Type', ps);
        }
        catch (e) {
            MK.error("Error creating session event 'Change Type'", e);
        }

        document.getElementById('memory-match-main').children[1].children[0].innerHTML = type.name;

        $('#memory-match-types .selected').removeClass('selected');
        e.className = 'selected';
        this.settings.type = type;
    },
    goHome: function () {
        $('#memory-match-goHome').fadeOut();
        $('#memory-match-game').fadeOut(function () {
            $('#memory-match-menu').fadeIn();
        });

        MK.exitPage('game');
        MK.enterPage('main');

        this.reset();
    },
    startTimer: function () {
        this.results.start = new Date();
        this.intervals = setInterval(function () {
            memoryMatchTiles.getFormattedTime(new Date());
        }, 1);
    },
    getFormattedTime: function (date) {
        var diff = (date - this.results.start) + this.results.offset;
        var milliseconds = diff % 1000;
        var seconds = Math.floor((diff / 1000) % 60);
        var minutes = Math.floor((diff / (60 * 1000)) % 60);

        $('#memory-match-progress .timer span').text(minutes + ':' + (seconds < 10 ? '0' : '') + seconds + '.' + milliseconds);
    },
    stopTimer: function () {
        clearInterval(this.intervals);

        this.results.stop = new Date();
        this.getFormattedTime(this.results.stop);
    },
    resized: function () {
        var width = $(window).width();
        
        if (width < this.windowWidth) {
            $('#memory-match-active').hide();
            $('#memory-match-splash').width(width).show();
        }
        else {
            $('#memory-match-splash').hide();
            $('#memory-match-active').show();
        }
    },
    pause: function () {
        this.logEvent('Game Paused');

        clearInterval(this.intervals);

        this.results.stop = new Date();
        this.results.offset = this.results.stop - this.results.start;
        this.getFormattedTime(this.results.stop);
    },
    resume: function () {
        this.logEvent('Game Resumed');
        this.results.start = new Date();
    },
    exit: function () {
        this.loaded = false;
        this.running = false;

        clearInterval(this.intervals);

        for (var i in this.timers) {
            clearTimeout(this.timers[i]);
        };

        this.goHome();
    }
};