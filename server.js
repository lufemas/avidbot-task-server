const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const prompt = require('prompt');

const botSim = require('./Bot')

const defaultMap = 
`####################
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
####################`

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');

  const bot = new botSim.Bot();

  botSim.loadMap(defaultMap,bot)

});