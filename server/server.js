const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config(); 

const connectDB = require('./db');


const registerUserHandlers = require('./handlers/userHandler');
const registerPollHandlers = require('./handlers/pollHandler');
const registerChatHandlers = require('./handlers/chatHandler'); 


connectDB();

const FRONTEND_URL = process.env.CORS_ORIGIN;

const app = express();
app.use(cors({
  origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization",],
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true, 
        methods: ["GET", "POST","OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
});

io.on('connection', (socket) => {
    console.log(`User connected with socket ID: ${socket.id}`);

    registerUserHandlers(io, socket);
    registerPollHandlers(io, socket);
    registerChatHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend server with DB is running on http://localhost:${PORT}`);
});