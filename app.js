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

    });

    ws.on("message", (msg) => {

    });

    ws.on("close", (e) => {

    })
});

server.listen(port);