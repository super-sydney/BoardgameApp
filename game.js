const messages = require("./public/javascripts/messages");

class Player {
    constructor(ws, playerNumber) {
        this.ws = ws;
        this.playerNumber = playerNumber;
        this.piecesPos = [-1, -1, -1, -1];
    }
    move(roll, piece) {
        if (this.piecesPos[piece] == -1) this.piecesPos[piece] = 0;
        this.piecesPos[piece] += roll;
    }
    getWs() {
        return this.ws;
    }
}

class Game {
    /**
     * constructor with a list of players, whose turn it currently is and a unique identifier
     * @param {number} id game identifier
     */
    constructor(id) {
        this.players = [];
        this.turn = 0;
        this.id = id;
        this.lastRoll = 0;
    }

    /**
     * adds a player to the game
     * @param {WebSocket} ws the websocket to add to the list of players 
     */
    addPlayer(ws) {
        this.players.push(new Player(ws, this.players.length));
    }

    isFull() {
        return this.players.length >= 2;
    }

    /**
     * stores what the current player rolled and sends it to the other players (just to display a die)
     * @param {number} roll the number to roll for the player whose turn it is right now 
     */
    roll(roll) {
        this.lastRoll = roll;

        let msg = messages.O_DIE_ROLLED;
        msg.data = roll;

        for (let player of this.players) {
            if (player != this.players[this.turn]) player.getWs().send(JSON.stringify(msg));
        }

        console.log("[GAME] Player rolled " + roll);
    }

    /**
     * takes the piece the client has chosen and moves it by whatever was rolled last, then sends this choice to the other players (to actually move the piece)
     * @param {number} piece which piece to move; -1 is a piece from the starting area, the other pieces are defined by when they got out of the starting area
     */
    movePiece(piece) {
        console.log("[GAME] Player moved piece " + piece);

        this.players[this.turn].move(this.lastRoll, piece);

        let msg = messages.O_MOVE_PIECE;
        msg.data = [this.turn, piece];

        for (let player of this.players) {
            if (player != this.players[this.turn]) player.getWs().send(JSON.stringify(msg));
        }

        this.turn = (this.turn + 1) % this.players.length;
    }

    /**
     * let all players know the game is now starting
     */
    start() {
        for (let player of this.players) {
            player.getWs().send(messages.S_GAME_START);
        }
    }

    getPlayers() {
        return this.players;
    }

    getId() {
        return this.id;
    }
}









exports.Game = Game;