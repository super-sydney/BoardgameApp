const express = require("express");
const http = require("http");
const websocket = require("ws");
const messages = require("./public/javascripts/messages.js");

const indexRouter = require("./routes/index.js");

const port = process.argv[2];
const app = express();

app.get("/", indexRouter);
app.get("/play", indexRouter);

app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
const wss = new websocket.Server({ server });

const games = new Map(); //map id to game
const players = new Map(); //map ws to id
wss.on("connection", (ws) => {
    var id = 0;
    ws.on("open", (e) => {
        players.put(ws, id++) //assign an id to this ws

        let foundGame = false;
        for (game of games.entries) { //find a non-empty game to add this player to
            if (!game.isFull()) {
                foundGame = true;
                game.addPlayer(ws);
                break;
            }
        }

        if (!foundGame) { //if no game was found, make a new game and add it
            let g = new Game();
            g.addPlayer(ws);
            games.put(players.get(ws), g);
        }
    });

    ws.on("message", (msg) => {

    });

    ws.on("close", (e) => { //remove player from list of players and ongoing games
        let playerId = players.get(ws);
        games.delete(playerId);
        players.delete(ws);
    })
});

class Game {
    players = [];
    constructor() {

    }

    addPlayer(ws) {
        players.push(ws);
    }

    isFull() {
        return players.length >= 2;
    }

    //add actual code for the game into here
}

server.listen(port);