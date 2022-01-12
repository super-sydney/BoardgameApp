const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
    console.log("succesfully connected to the server")
    socket.send(JSON.stringify({
        msg: "statistics"
    }))
}

socket.onmessage = (msg) => { //sends back the 3 statistics in order, seperated by "\n"
    msg = JSON.parse(msg.data);
    let stats = msg.data.split("\n");
    document.getElementById("stats").innerHTML = "Players In Games: " + stats[0] + "<br>Games Completed: " + stats[1] + "<br>Average Game Duration: " + stats[2];
}