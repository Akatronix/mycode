// backend/signaling-server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "./public")));

// Socket.IO for signaling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data); // Broadcast offer
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data); // Broadcast answer
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data); // Broadcast ICE candidate
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
