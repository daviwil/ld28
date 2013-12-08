requirejs.config({

    // Set scripts/lib as base so dependency libs are easy to access.
    // Set "game" path relative to that so that "game/script" refers
    // to the game script folder.
    baseUrl: 'scripts/lib',
    paths: {
        game: '../game'
    },

    // Shims for dependencies that don't support Require.js
    shim: {
        'kinetic': {
            exports: 'Kinetic'
        }
    }
});

// Initial load and initialization of the main game code.
requirejs(
    ['game/main'],
    function (gameMain) {
	    gameMain.init();
    }
);
