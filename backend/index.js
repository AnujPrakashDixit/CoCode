import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import history from 'connect-history-api-fallback';
import axios from 'axios';

const app = express();
const server = http.createServer(app);

const url = `https://co-code-real-time-collaborative-ide.onrender.com`;
const interval = 30000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloded");
    })
    .catch((error) => {
      console.error(`Error : ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);

const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(userName);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({ code, roomId, language, version }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language,
        version,
        files: [
          {
            content: code
          }
        ]
      })

      room.output = response.data.run.output
      io.to(roomId).emit("codeResponse", response.data)
    }
  })

  // --- NEW CHAT FEATURE ---
  socket.on("sendMessage", ({ roomId, message, userName, time }) => {
     // Broadcast to everyone else in the room
     socket.to(roomId).emit("receiveMessage", { message, userName, time });
  });
  // ------------------------

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("User Disconnected");
  });
});

// ... socket code ...

const __dirname = path.resolve();

// This middleware redirects all navigation (like /room/123) to index.html
app.use(history()); 

// This serves the static files (CSS, JS, Images) from the React build folder
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// If you have the keep-alive script (reloadWebsite), 
// update the URL to your Render URL after you deploy.

const port = process.env.PORT || 5000;
server.listen(port, () => console.log("Server running on port", port));