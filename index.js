const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
require('dotenv').config({ path: './keys.env' })

const botSim = require("./Bot");

const PORT = process.env.PORT || 3000;

// Adding Cors Lib to the server
app.use(cors);


// Create Socket.io
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.get('/', (req, res) => {
    res.send('Socket Server')
  })

// When any client connects
io.on("connection", (socket) => {
  console.log("a user connected");

  // If a client is connected, create a bot to it already
  const bot = new botSim.Bot(io);


  // Load map message received with the map input
  socket.on("loadmap", (mapInput) => {
    if (mapInput != ''){    //Make sure it is not an empty string

        console.log("Loading map");

        // Load the map to the bot
        botSim.loadMap(mapInput, bot);

    }else {
        console.warn('Bad Map String');
    }
  });

  // On 'command' message received
  socket.on("command", (cmd) => {
    {
      switch (cmd) {
        case "pause":     // Change the bot state to PAUSED
          console.log("Pausing Bot");
          botSim.pause( bot);

          break;

        case "resume":     // Change the bot state to NOT PAUSED
          botSim.resume(bot);
          break;

          case "stop":     // Stop the current simulation
            botSim.killSim(bot);
            break; 

        default:
          console.log(`command '${cmd}'  not found`);
          break;
      }
    }
  });

  // For debbuging purposes, it will print all print any command
  socket.onAny((arg) => {
    console.log(arg);
  });
});

//Start to listen
server.listen(PORT, () => {
  console.log(`Server listening on PORT:${PORT}`);
});
