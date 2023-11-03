const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const players = {};

io.on('connection', (socket) => {
  // Generate a random color for the player
  const color = getRandomColor();

  // Create a new player object
  const player = {
    id: socket.id,
    x: Math.floor(Math.random() * 10) * 50,
    y: Math.floor(Math.random() * 10) * 50,
    color,
  };

  // Add the player to the players object
  players[socket.id] = player;

  // Emit the initial game state to the newly connected player
  socket.emit('init', { players });

  // Broadcast the new player to all connected clients
  socket.broadcast.emit('newPlayer', player);

  // Handle player movement
  socket.on('move', (direction) => {
    handlePlayerMovement(socket.id, direction);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

function getRandomColor() {
  const colors = ['#FF5733', '#FFC300', '#33FF57', '#3366FF'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function handlePlayerMovement(playerId, direction) {
  const player = players[playerId];

  if (direction === 'up' && player.y > 0) {
    player.y -= 50;
  } else if (direction === 'down' && player.y < 450) {
    player.y += 50;
  } else if (direction === 'left' && player.x > 0) {
    player.x -= 50;
  } else if (direction === 'right' && player.x < 450) {
    player.x += 50;
  }

  io.emit('playerMoved', { playerId, x: player.x, y: player.y });
}
