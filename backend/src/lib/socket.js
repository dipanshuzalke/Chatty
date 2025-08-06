// src/lib/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Allowed origins - keep in sync with your Express CORS config
const allowedOrigins = [
  "http://localhost:5173",
  "https://chatty-one-nu.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  // transports: ["websocket", "polling"] // optional
});

// used to store online users: { userId: socketId }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  // debug origin and handshake
  console.log("socket.handshake.origin:", socket.handshake.headers.origin);
  console.log("socket.handshake.query:", socket.handshake.query);
  console.log("socket.handshake.auth:", socket.handshake.auth);

  // prefer auth over query (if you pass auth from client)
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

  if (userId) {
    // update mapping (handles reconnections)
    userSocketMap[userId] = socket.id;
    // attach to socket so we can clean up on disconnect
    socket.data.userId = userId;
  }

  // notify all clients (or you can broadcast to contacts only)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", (reason) => {
    const uid = socket.data.userId;
    console.log("Socket disconnected:", socket.id, "reason:", reason, "userId:", uid);
    if (uid && userSocketMap[uid] === socket.id) {
      // only delete if mapping still points to this socket id
      delete userSocketMap[uid];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // example: private message from client
  socket.on("private_message", (payload) => {
    // payload: { to, text, attachments }
    const toSocketId = userSocketMap[payload.to];
    if (toSocketId) {
      io.to(toSocketId).emit("new_message", payload);
    }
    // optionally save to DB here or let controller do it
  });
});

export { io, app, server };
