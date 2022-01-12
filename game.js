class Player {
    constructor(ws, playerNumber) {
        this.ws = ws;
        this.playerNumber = playerNumber;
        this.piecesPos = [-1, -1, -1, -1];
    }
    move(roll, piece) {
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
    roll(roll) {}

    /**
     * takes the piece the client has chosen and moves it by whatever was rolled last, then sends this choice to the other players (to actually move the piece)
     * @param {number} piece which piece to move; -1 is a piece from the starting area, the other pieces are defined by when they got out of the starting area
     */
    choice(piece) {

    }

    /**
     * let all players know the game is now starting
     */
    start() {
        for (let player of this.players) {
            player.getWs().send(JSON.stringify({ msg: "start" }));
        }
    }

    /**
     * ends the game prematurely if one of the players leaves
     * @param {WebSocket} ws the player that left
     * @param {number} id the id of the player
     */
    end(ws, id) {
        for (let player of this.players) {
            if (player.getWs() != ws) {
                player.getWs().send(JSON.stringify({ msg: "end", data: id }));
                console.log("[LOG] sent end message for game " + this.id);
            }
        }
    }

    getId() {
        return this.id;
    }
}









exports.Game = Game;