// I'm loading environment variables from .env file for secure configuration
require('dotenv').config();

// I'm importing Node.js built-in HTTP module to create my server
const http = require('http');
// I'm importing Socket.io for real-time communication features
const { Server } = require('socket.io');

// I'm importing my configured Express app from app.js
const app = require('./app');

// I'm setting the port from environment variable or defaulting to 3001
const PORT = process.env.PORT || 3001;

// I'm importing Mongoose for MongoDB database operations
const mongoose = require('mongoose');
// I'm getting my MongoDB connection string from environment variables
const MONGO_URI = process.env.MONGODB_URI;

// I'm using an async IIFE (Immediately Invoked Function Expression) to handle my server startup
(async () => {
    try {
        // I'm connecting to my MongoDB database first before starting the server
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // I'm creating an HTTP server using my Express app
        const server = http.createServer(app);

        // I'm initializing Socket.io server for real-time features like notifications
        const io = new Server(server, {
            cors: {
                // I'm allowing all origins for development (should be restricted in production)
                origin: '*', // or specify your frontend origin (e.g. 'http://localhost:5173')
                // I'm specifying which HTTP methods are allowed for CORS
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
        });

        // I'm setting up Socket.io connection handling for real-time features
        io.on('connection', (socket) => {
            console.log('🟢 A user connected:', socket.id);

            // I'm handling when a user joins their personal room for targeted notifications
            socket.on('join', (userId) => {
                // I'm adding the socket to a room named after their userId
                socket.join(userId);
                console.log(`User ${userId} joined their room`);
            });

            // I'm handling task notification broadcasting to specific users
            socket.on('notify-task', (data) => {
                const { userId, message } = data;
                // I'm sending the notification only to the specific user's room
                io.to(userId).emit('task-notification', message);
                console.log(`📩 Sent notification to ${userId}: ${message}`);
            });

            // I'm handling when a user disconnects from the socket
            socket.on('disconnect', () => {
                console.log('🔴 A user disconnected:', socket.id);
            });
        });

        // I'm making the Socket.io instance available to my Express app for use in controllers
        app.set('io', io);

        // I'm starting my server to listen on the specified port
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        // I'm catching and logging any errors during server startup
        console.error('Error connecting to MongoDB:', error);
    }
})();