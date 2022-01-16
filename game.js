const messages = require("./public/javascripts/messages");

class Player {
    constructor(ws, id) {
        this.ws = ws;
        this.id = id;
        this.pieces = [-1, -1, -1, -1];
    }
    move(roll, piece) {
        if (this.pieces[piece] == -1 && roll == 6) {
            this.pieces[piece] = 0;
        } else {
            this.pieces[piece] += roll;
        }
        return this.pieces[piece];
    }
    take(pos) {
        this.pieces[this.pieces.indexOf(pos)] = -1;
    }
    getWs() {
        return this.ws;
    }
    getPieces() {
        return this.pieces;
    }
    getId() {
        return this.id;
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

        if (roll != 6 && this.players[this.turn].getPieces().every((pos) => { return pos == -1 })) { //can't make any moves
            console.log("next")
            this.nextTurn();
        }
    }

    /**
     * takes the piece the client has chosen and moves it by whatever was rolled last, then sends this choice to the other players (to actually move the piece)
     * @param {number} piece which piece to move; -1 is a piece from the starting area, the other pieces are defined by when they got out of the starting area
     */
    movePiece(piece) {
        console.log("[GAME] Player moved piece " + piece);

        let nextPos = this.players[this.turn].move(this.lastRoll, piece);

        for (let player of this.players) {
            if (player == this.players[this.turn]) continue;
            if (player.getPieces().includes(nextPos)) player.take(nextPos);
        }

        let msg = messages.O_MOVE_PIECE;
        msg.data = [];

        for (let player of this.players) {
            msg.data.push(player.getPieces());
        }

        while (msg.data.length < 4) {
            msg.data.push([-1, -1, -1, -1]);
        }

        for (let player of this.players) {
            player.getWs().send(JSON.stringify(msg));
        }

        this.nextTurn();
    }

    nextTurn() {
        this.turn = (this.turn + 1) % this.players.length;

        let msg = messages.S_GAME_TURN;
        this.players[this.turn].getWs().send(msg);
    }

    /**
     * let all players know the game is now starting
     */
    start() {
        this.players[0].getWs().send(messages.S_GAME_TURN);
        let msg = messages.O_GAME_START;
        for (let i = 0; i < this.players.length; i++) {
            msg.data = i;
            this.players[i].getWs().send(JSON.stringify(msg));
        }
    }

    getPlayers() {
        return this.players;
    }

    getId() {
        return this.id;
    }

    printPlayers() {
        for (let player of this.players) {
            console.log("Player " + player.getId() + ": " + player.getPieces());
        }
    }
}

exports.Game = Game;