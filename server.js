const { time } = require("console");
const express = require("express");
const app = express();
app.use(express.static("public"));
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = process.env.PORT || 3000;

io.on("connection", onConnect);

var allPlayers = [];
var allFood = [];

function onConnect(socket) {
  socket.on("joinroom", () => {
    if (allPlayers.length == 0) {
      for (var i = 0; i < 100; i++) {
        allFood.push(createFood());
      }
    }
    allPlayers.push(socket.id);
    io.sockets.emit("reciveenemy", allPlayers);
    io.to(socket.id).emit("foods", allFood);
  });
  socket.on("disconnect", () => {
    allPlayers = allPlayers.filter((item) => item != socket.id);
    io.sockets.emit("death", socket.id);
  });

  socket.on("playerstates", ({ allCells, color, id, angle }) => {
    io.sockets.emit("enemystate", { allCells, color, id, angle });
  });
  socket.on("death", () => {
    io.sockets.emit("death", socket.id);
  });
  socket.on("eatfood", (arr) => {
    for (var f of arr) {
      allFood = allFood.filter((item) => item.uuid != f.uuid);
    }
    for (var i = 0; i < arr.length; i++) {
      allFood.push(createFood());
    }
    io.emit("updatefood", allFood);
  });
}

server.listen(PORT, () => {
  console.log(`listening on *: ${PORT}`);
});

function createFood() {
  var COLORS = ["red", "blue", "green"];
  return {
    row: Math.random() * 1920 + 50,
    col: Math.random() * 1000 + 50,
    uuid: Math.floor(Math.random() * 999999),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}
