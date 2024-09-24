const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Serve your HTML file
});

let messages = []; // Array to store chat messages
let users = {}; // Store users

io.on('connection', (socket) => {
    console.log('A user connected');

    // Notify other users about the new user
    socket.on('new user', (username) => {
        users[socket.id] = username; // Store the user's name
        console.log(`${username} joined the chat`);
        socket.broadcast.emit('chat message', { from: 'System', message: `${username} has joined the chat.` });
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        messages.push(msg); // Store the message
        io.emit('chat message', msg); // Send the message to all clients
    });

    // Handle request for messages
    socket.on('request messages', () => {
        messages.forEach(msg => {
            socket.emit('chat message', msg); // Send all previous messages to the user
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        const username = users[socket.id];
        if (username) {
            delete users[socket.id]; // Remove user from the list on disconnect
            io.emit('chat message', { from: 'System', message: `${username} has left the chat.` });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
