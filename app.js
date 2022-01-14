const express = require("express");
const { Stats } = require("fs");
const http = require("http");
const websocket = require("ws");
const game = require("./game.js");
const messages = require("./public/javascripts/messages");

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

var playerId = 0;
var gameId = 0;

var completedGames = 0;
var avgGameLength = 0;

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {
        msg = JSON.parse(String(msg));

        console.log("[MSG] Received message of type " + msg.type + " from player " + players.get(ws));

        switch (msg.type) {
            case messages.T_GAME_JOIN:
                matchmaking(ws);
                break;
            case messages.T_GAME_OVER:
                gameOver(ws, msg);
                break;
            case messages.T_STATS:
                stats(ws);
                break;
            case messages.T_DIE_ROLLED:
                games.get(players.get(ws)).roll(msg.data);
                break;
            case messages.T_MOVE_PIECE:
                games.get(players.get(ws)).movePiece(msg.data);
                break;
        }
    });

    ws.on("close", (e) => {
        if (typeof players.get(ws) != "number") return;
        let playerId = players.get(ws);
        let game = games.get(playerId);

        for (let player of game.getPlayers()) {
            if (player.getWs() != ws) player.getWs().send(messages.S_GAME_ABORT);
        }

        games.delete(playerId);
        players.delete(ws);

        console.log("[LOG] removed player " + playerId);
    });
});

/**
 * put a player into a game that's not yet full, otherwise make a new game
 * @param {WebSocket} ws player that needs to be put into a game
 */
const matchmaking = (ws) => {
    players.set(ws, playerId++) //assign an id to this ws
    console.log("[LOG] player connected with id " + players.get(ws));

    let foundGame = false;
    //find a non-empty game to add this player to
    for (let game of games.entries()) {
        if (!game[1].isFull()) {
            foundGame = true;
            game[1].addPlayer(ws);
            games.set(players.get(ws), game[1]);
            console.log("[LOG] added player " + players.get(ws) + " to pre-existing game with id " + game[1].getId());
            game[1].start();
            return;
        }
    }

    if (!foundGame) { //if no game was found, make a new game and add it
        let g = new game.Game(gameId++);
        g.addPlayer(ws);
        games.set(players.get(ws), g);
        console.log("[LOG] added player " + players.get(ws) + " to newly created game");
        ws.send(JSON.stringify({ msg: "waiting" }));
    }
}

const gameOver = (ws, msg) => {
    for (let player of games.get(players.get(ws)).getPlayers()) {
        if (player.getWs() != ws) {
            player.getWs().send(msg);
        }
    }
}

const stats = (ws) => {
    let msg = messages.O_STATS;
    msg.data = [games.size, completedGames, avgGameLength];
    ws.send(JSON.stringify(msg))
}

server.listen(port);