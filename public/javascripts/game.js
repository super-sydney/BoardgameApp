const socket = new WebSocket("ws://localhost:3000");

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
            moveOpponent(msg.data[0], msg.data[1]);
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

const moveOpponent = (player, piece) => {
    //find the player's piece and move it by what was rolled
    console.log("Player " + player + " wants to move piece " + piece);
}