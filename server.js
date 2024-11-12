const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let currentPage = 1; // Initialize the PDF start page
let adminSocketId = null;

// Serve static files in the 'public' directory
app.use(express.static('public'));

// Handle WebSocket connections
io.on('connection', (socket) => {
    // Set the first connected user as the admin
    if (!adminSocketId) {
        adminSocketId = socket.id;
    }

    // Send the current page to new users
    socket.emit('pageChange', currentPage);

    // Handle page change events from the admin
    socket.on('pageChange', (newPage) => {
        if (socket.id === adminSocketId) {
            currentPage = newPage;
            io.emit('pageChange', currentPage); // Broadcast the page to all users
        }
    });

    // Handle admin disconnection
    socket.on('disconnect', () => {
        if (socket.id === adminSocketId) {
            adminSocketId = null; // Reset admin on disconnect
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
