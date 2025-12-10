const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve frontend files

io.on('connection', (socket) => {
  // Spawn bash shell
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  // Send shell output to client
  shell.on('data', (data) => socket.emit('output', data));

  // Receive input from client
  socket.on('input', (data) => shell.write(data));

  // Resize terminal
  socket.on('resize', (size) => shell.resize(size.cols, size.rows));

  socket.on('disconnect', () => shell.kill());
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
