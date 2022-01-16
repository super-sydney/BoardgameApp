(function(exports) {
    /*
     * Server to client: ready to start game 
     */
    exports.T_GAME_START = "GAME-START"
    exports.O_GAME_START = {
        type: exports.T_GAME_START,
    };
    exports.S_GAME_START = JSON.stringify(exports.O_GAME_START);

    /*
     * Client to server: assign this player to a game or make a new one if needed
     */
    exports.T_GAME_JOIN = "GAME-JOIN";
    exports.O_GAME_JOIN = {
        type: exports.T_GAME_JOIN,
    };
    exports.S_GAME_JOIN = JSON.stringify(exports.O_GAME_JOIN);

    /*
     * Server to client: abort game
     */
    exports.T_GAME_ABORT = "GAME-ABORT";
    exports.O_GAME_ABORT = {
        type: exports.T_GAME_ABORT,
    };
    exports.S_GAME_ABORT = JSON.stringify(exports.O_GAME_ABORT);

    /* 
     * Server to client: gaame has ended, the winner is...
     */
    exports.T_GAME_OVER = "GAME-OVER";
    exports.O_GAME_OVER = {
        type: exports.T_GAME_OVER,
        data: null,
    }

    /*
     * Server to client: it is now this player's turn (allow them to roll)
     */
    exports.T_GAME_TURN = "GAME-TURN";
    exports.O_GAME_TURN = {
        type: exports.T_GAME_TURN,
        data: null,
    }

    /*
     * Server to client OR client to server: current player rolled this number
     */
    exports.T_DIE_ROLLED = "DIE-ROLLED";
    exports.O_DIE_ROLLED = {
        type: exports.T_DIE_ROLLED,
        data: null,
    }

    /*
     * Server to client or client to server: current player moved their piece (send array of piece positions)
     */
    exports.T_MOVE_PIECE = "MOVE-PIECE";
    exports.O_MOVE_PIECE = {
        type: exports.T_MOVE_PIECE,
        data: null,
    }
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined, we are on the client; else the server