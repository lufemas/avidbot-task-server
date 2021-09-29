const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
require('dotenv').config({ path: './keys.env' })
// (httpServer, {  cors: {    origin: "http://localhost:3000/",    methods: ["GET", "POST"]  }});;

const prompt = require("prompt");

const botSim = require("./Bot");

const PORT = process.env.PORT || 3000;

const defaultMap = `####################
#             ## # #
# # ## #####   # # #
# # ## #####  ## # #
# #            #   #
# # ########  #### #
# #              # #
# # ########  ## # #
#                # #
# # ########  ## # #
# #              # #
# # ########  ## # #
#                  #
####################`;

app.use(cors);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.get('/', (req, res) => {
    res.send('Socket Server')
  })

io.on("connection", (socket) => {
  console.log("a user connected");

  const bot = new botSim.Bot(io);


  socket.on("loadmap", (mapInput) => {
    if (mapInput != ''){

        console.log("Loading map");

          botSim.loadMap(mapInput, bot);

    }else {
        console.warn('Bad Map String');
    }
  });

  socket.on("command", (cmd) => {
    {
      switch (cmd) {
        case "pause":
          console.log("Pausing Bot");

          botSim.pause( bot);

          break;

        case "resume":
          botSim.resume(bot);
          break;

          case "stop":
            botSim.killSim(bot);
            break; 

        default:
          console.log(`command '${cmd}'  not found`);
          break;
      }
    }
  });
  socket.onAny((arg) => {
    console.log(arg);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on PORT:${PORT}`);
});
