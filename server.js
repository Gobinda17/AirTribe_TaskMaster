require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');

const PORT = process.env.PORT || 3001;

const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGODB_URI;

(async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Create HTTP server
        const server = http.createServer(app);

        // 3. Initialize Socket.io
        const io = new Server(server, {
            cors: {
                origin: '*', // or specify your frontend origin (e.g. 'http://localhost:5173')
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
        });

        // 4. Handle socket connections
        io.on('connection', (socket) => {
            console.log('🟢 A user connected:', socket.id);

            // Example: join user to room based on userId
            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined their room`);
            });

            // Example: handle task notifications
            socket.on('notify-task', (data) => {
                const { userId, message } = data;
                io.to(userId).emit('task-notification', message);
                console.log(`📩 Sent notification to ${userId}: ${message}`);
            });

            socket.on('disconnect', () => {
                console.log('🔴 A user disconnected:', socket.id);
            });
        });

        // 5. Make io available globally if needed
        app.set('io', io);

        // 6. Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})();