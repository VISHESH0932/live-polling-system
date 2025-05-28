const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config(); // Make sure this is at the top

const connectDB = require('./db'); // Import DB connection function

// Import handlers
const registerUserHandlers = require('./handlers/userHandler');
const registerPollHandlers = require('./handlers/pollHandler');
const registerChatHandlers = require('./handlers/chatHandler'); // New

// Connect to Database
connectDB();

const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`User connected with socket ID: ${socket.id}`);

    registerUserHandlers(io, socket);
    registerPollHandlers(io, socket);
    registerChatHandlers(io, socket); // Register new chat handlers
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend server with DB is running on http://localhost:${PORT}`);
});