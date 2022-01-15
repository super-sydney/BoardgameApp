const socket = new WebSocket("ws://localhost:3000");

let pieces = document.getElementsByClassName("piece");
for (let i = 0; i < pieces.length; i++) {
    pieces[i].classList.add("piece" + Math.floor(i / 4));
}

socket.onopen = () => {
    console.log("succesfully connected to the server")
    socket.send(Messages.S_GAME_JOIN);
}

socket.onmessage = (msg) => {
    msg = JSON.parse(msg.data);

    switch (msg.type) {
        case Messages.T_GAME_START:
            document.getElementById("waiting").innerHTML = "";
            document.getElementById("game").style.display = "";
            console.log("starting game!");
            break;
        case Messages.T_GAME_ABORT:
            alert("The game has ended because a player has left");
            window.location.href = "http://localhost:3000/";
            break;
        case Messages.T_DIE_ROLLED:
            rollOpponent(msg.data);
            break;
        case Messages.T_MOVE_PIECE:
            moveOpponent(msg.data);
            break;
    }
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
    4, 6, 8, 10, 12, 26, 27, 28, 29, 30, 31, 32, 38,
    37, 36, 35, 34, 33, 40, 42, 44, 46, 48, 51, 50, 49,
    47, 45, 43, 41, 39, 25, 24, 23, 22, 21, 20, 19, 13,
    14, 15, 16, 17, 18, 11, 9, 7, 5, 3, 0, 1
];

const moveOpponent = (pieces) => {
    //find the player's piece and move it by what was rolled
    let boardSpaces = document.getElementsByClassName("space");

    let currentPieces = document.getElementsByClassName("piece");
    for (let i = 0; i < currentPieces.length; i++) {
        currentPieces[i].classList.remove("piece"); //clear the board of pieces
    }

    for (let i = 0; i < pieces.length; i++) { //add pieces back to the board
        for (let j = 0; j < pieces[i].length; j++) {
            let piece = pieces[i][j];
            if (piece == -1) { //yard
                document.getElementsByClassName("yard")[i]
                    .getElementsByClassName("waiting")[j]
                    .classList.add("piece");
            } else if (piece >= 52) { //home column
                document.getElementsByClassName("spaces")[i]
                    .getElementsByClassName("home")[piece - 52]
                    .classList.add("piece");
            } else {
                console.log(i + ", " + j);
                console.log(boardSpaces[spacesMap[(i * 13 + piece) % 52]]);
                boardSpaces[spacesMap[(i * 13 + piece) % 52]].classList.add("piece" + i);
            }
        }
    }
}