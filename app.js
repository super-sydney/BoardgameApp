const express = require("express");
const http = require("http");
const websocket = require("ws");
const game = require("./game.js");

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
    ws.on("message", (msg) => handleMessage(msg, ws));

    ws.on("close", (e) => {
        if (typeof players.get(ws) != "number") return;
        let playerId = players.get(ws);
        let game = games.get(playerId);

        game.end(ws, playerId);
        games.delete(playerId);
        players.delete(ws);

        console.log("[LOG] removed player " + playerId);
    });
});

/**
 * function to interpret messgaes received by the server
 * messages should be sent as a JSON object in the form:
 *{
 *   msg: "someCommand",
 *   data: "someData"
 *}
 *where the message might be something like "roll" and the data belonging to that might be "5"
 * @param {Buffer} msg message data
 * @param {WebSocket} ws websocket from which the data was sent
 */
const handleMessage = (msg, ws) => {
    msg = JSON.parse(String(msg));

    switch (msg.msg) {
        case "join":
            matchmaking(ws);
            break;
        case "statistics":
            ws.send(JSON.stringify({ msg: "stats", data: players.size + "\n" + completedGames + "\n" + avgGameLength }));
            break;
        case "roll":
            games.get(players.get(ws)).roll(parseInt(msg.data));
            break;
        case "choice":
            games.get(players.get(ws)).choice(parseInt(msg.data));
            break;
        default:
            console.log("[LOG] " + msg.msg + (msg.data ? ", " + msg.data : ""));
    }
}

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

server.listen(port);