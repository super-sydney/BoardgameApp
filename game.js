class Game {
    constructor() {
        this.players = [];
        this.name = Math.random();
    }

    addPlayer(ws) {
        this.players.push(ws);
    }

    removePlayer(ws) {
        this.players = this.players.filter((val) => {
            return val != ws
        });
    }

    isFull() {
        return this.players.length >= 2;
    }

    //add actual code for the game into here
}

exports.Game = Game;