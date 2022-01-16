const socket = new WebSocket("ws://localhost:3000");
var startingTime;
var players = [];

socket.onopen = () => {
    console.log("succesfully connected to the server")
    socket.send(Messages.S_GAME_JOIN);
}

socket.onmessage = (msg) => {
    msg = JSON.parse(msg.data);

    switch (msg.type) {
        case Messages.T_GAME_START:
            initializeGame();
            break;
        case Messages.T_GAME_ABORT:
            alert("The game has ended because a player has left");
            window.location.href = "http://localhost:3000/";
            break;
        case Messages.T_DIE_ROLLED:
            rollOpponent(msg.data);
            break;
        case Messages.T_MOVE_PIECE:
            players = msg.data;
            updatePieces();
            break;
    }
}

const initializeGame = () => {
    let pieces = document.getElementsByClassName("piece");
    for (let i = 0; i < pieces.length; i++) {
        pieces[i].classList.add("piece" + i);
    }
    players = [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
    ]

    document.getElementById("waiting").innerHTML = "";
    document.getElementById("game").style.display = "";
    updatePieces();
    console.log("starting game!");
    startingTime = Date.now();
    setInterval(updateTime, 1000);
}

const roll = () => {
    let r = Math.floor(Math.random() * 6) + 1

    //do animation and show roll here


    let msg = Messages.O_DIE_ROLLED;
    msg.data = r;

    socket.send(JSON.stringify(msg));
}

const movePiece = (piece) => {
    let msg = Messages.O_MOVE_PIECE;
    msg.data = piece;

    socket.send(JSON.stringify(msg));
}

const rollOpponent = (roll) => {
    //play roll animation and show what was rolled
    console.log("opponent rolled " + roll);
}

//maps the actual position on the board to the right "space" element in the DOM 
const spacesMap = [
    14, 15, 16, 17, 18, 11, 9, 7, 5, 3, 0, 1,
    4, 6, 8, 10, 12, 26, 27, 28, 29, 30, 31, 32, 38,
    37, 36, 35, 34, 33, 40, 42, 44, 46, 48, 51, 50, 49,
    47, 45, 43, 41, 39, 25, 24, 23, 22, 21, 20, 19, 13
];

const yard = document.getElementsByClassName("yard");
const spaces = document.getElementsByClassName("spaces");
const boardSpaces = document.getElementsByClassName("space");

const updatePieces = () => {
    let currentPieces = document.getElementsByClassName("piece");
    while (currentPieces.length > 0) {
        currentPieces[0].innerHTML = "";
        currentPieces[0].className = currentPieces[0].className.replaceAll(/\s?piece\d*/g, "") //clear the board of pieces
    }

    for (let i = 0; i < players.length; i++) { //add pieces back to the board
        let pieces = players[i];
        for (let j = 0; j < pieces.length; j++) {
            let pos = players[i][j];
            if (pos == -1) { //yard
                yard[i]
                    .getElementsByClassName("waiting")[j]
                    .classList.add("piece" + (i * 4 + j));
                yard[i]
                    .getElementsByClassName("waiting")[j]
                    .classList.add("piece");
            } else if (pos >= 52) { //home column
                spaces[i]
                    .getElementsByClassName("home")[pos - 52]
                    .classList.add("piece" + (i * 4 + j));
                spaces[i]
                    .getElementsByClassName("home")[pos - 52]
                    .classList.add("piece");
            } else {
                boardSpaces[spacesMap[(i * 13 + pos) % 52]].classList.add("piece" + (i * 4 + j));
                boardSpaces[spacesMap[(i * 13 + pos) % 52]].classList.add("piece");
            }
        }
    }

    currentPieces = document.getElementsByClassName("piece");
    for (let el of currentPieces) {
        let pieceNumber = parseInt(el.className.match(/\d+/));
        el.innerHTML = "<img src='../images/pawn-" + Math.floor(pieceNumber / 4) + ".png'/>"
    }
}

const updateTime = () => {
    let seconds = Math.floor(((Date.now() - startingTime) / 1000) % 60);
    let minutes = Math.floor(((Date.now() - startingTime) / 1000) / 60);
    document.getElementById("time").innerHTML = "It has been " + minutes + " minutes and " + seconds + " seconds since the start of this game";
}