const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
    console.log("succesfully connected to the server")
    socket.send(JSON.stringify(Messages.O_STATS));
}

socket.onmessage = (msg) => {
    msg = JSON.parse(msg.data);

    switch (msg.type) {
        case Messages.T_STATS:
            document.getElementById("stats").innerHTML = "Players In Games: " + msg.data[0] + "<br>Games Completed: " + msg.data[1] + "<br>Average Game Duration: " + msg.data[2];
            break;
    }
}