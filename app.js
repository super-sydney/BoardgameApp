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

var id = 0;

var completedGames = 0;
var avgGameLength = 0;

wss.on("connection", (ws) => {
    ws.on("message", (msg) => handleMessage(msg, ws));

    ws.on("close", (e) => {
        if (!players.get(ws)) return;
        let playerId = players.get(ws);
        let game = games.get(playerId);

        if (game) game.removePlayer(ws)
        games.delete(playerId);
        players.delete(ws);

        console.log("[LOG] removed player " + playerId);
    });
});

const handleMessage = (msg, ws) => {
    switch (String(msg)) {
        case "sup":
            console.log(players.entries());
            console.log(games.entries());
            break;
        case "join game":
            matchmaking(ws);
            break;
        case "statistics":
            ws.send(players.size + "\n" + completedGames + "\n" + avgGameLength);
            break;
        default:
            console.log("[LOG] " + msg);
    }
}

const matchmaking = (ws) => {
    players.set(ws, id++) //assign an id to this ws
    console.log("[LOG] player connected with id " + players.get(ws));

    let foundGame = false;
    //find a non-empty game to add this player to
    for (let game of games.entries()) {
        if (!game[1].isFull()) {
            foundGame = true;
            game[1].addPlayer(ws);
            games.set(players.get(ws), game[1]);
            console.log("[LOG] added player " + players.get(ws) + " to pre-existing game");
            return;
        }
    }

    if (!foundGame) { //if no game was found, make a new game and add it
        let g = new game.Game();
        g.addPlayer(ws);
        games.set(players.get(ws), g);
        console.log("[LOG] added player " + players.get(ws) + " to newly created game");
    }
}

server.listen(port);