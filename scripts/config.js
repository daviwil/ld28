requirejs.config({

    // Set scripts/lib as base so dependency libs are easy to access.
    // Set "game" path relative to that so that "game/script" refers
    // to the game script folder.
    baseUrl: 'scripts/lib',
    paths: {
        game: '../game',
        easeljs: 'http://code.createjs.com/easeljs-0.7.0.min',
        soundjs: 'http://code.createjs.com/soundjs-0.5.0.min'
    },

    // Shims for dependencies that don't support Require.js
    shim: {
        'kinetic': { exports: 'Kinetic' },
        'easeljs': { exports: 'createjs' },
        'soundjs': { exports: 'createjs.SoundJS' },
        'phaser': { exports: 'Phaser' }
    }
});

// Initial load and initialization of the main game code.
requirejs(
    ['game/main'],
    function (gameMain) {
	    gameMain.init();
    }
);
