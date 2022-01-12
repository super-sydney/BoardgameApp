const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
    console.log("succesfully connected to the server")
    socket.send(JSON.stringify({
        msg: "join"
    }));
}

socket.onmessage = (msg) => {
    msg = JSON.parse(msg.data);

    switch (msg.msg) {
        case "waiting":
            document.getElementById("waiting").innerHTML = "Please wait until enough people have joined";
            break;
        case "start":
            document.getElementById("waiting").innerHTML = "";
            document.getElementById("game").style.display = "";
            console.log("starting game!");
            break;
        case "end":
            alert("The game has ended because the player with id " + msg.data + " has left");
            window.location.href = "http://localhost:3000/";
            break;
    }
}

function roll() {
    socket.send(JSON.stringify({
        msg: "roll",
        data: Math.floor(6 * Math.random()) + 1
    }));
}


function choice() {
    socket.send(JSON.stringify({
        msg: "choice",
        data: 0
    }));
}