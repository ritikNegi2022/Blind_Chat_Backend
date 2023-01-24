// Imports
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Essential declaration
const app = express();
const server = http.createServer(app);
app.use(cors());
const port = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// const users = Object.keys(io.of("/").server.engine.clients)
let sorting = "sort";
const users = {};
io.on("connection", (socket) => {
  users[socket.id] = true;
  console.log(socket.id, " connected");

  socket.on("join", () => {
    const userIds = Object.keys(users);
    if (sorting == "sort") {
      userIds.sort();
      sorting = "reverse";
    } else {
      userIds.reverse();
      sorting = "sort";
    }
    for (let i of userIds) {
      if (i !== socket.id && users[i] === false) {
        socket.emit("make connection", i);
        users[i] = true;
        break;
      }
    }
  });
  socket.on("lets chat", (data) => {
    users[socket.id] = true;
    socket.to(data).emit("hi", socket.id);
  });
  socket.on("change my status", () => {
    users[socket.id] = false;
  });
  socket.on("home", (data) => {
    socket.to(data).emit("remove me", socket.id);
  });
  socket.on('send message', (data) => {
    socket.to(data.partner).emit('recieve message', data)
  })
  socket.on("disconnect", () => {
    socket.broadcast.emit("remove me", socket.id);
    delete users[socket.id];
    console.log(socket.id, "User disconnected");
  });
});

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
