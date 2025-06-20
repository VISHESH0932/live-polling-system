// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors'); // You are already using this

const connectDB = require('./db');
const registerUserHandlers = require('./handlers/userHandler');
const registerPollHandlers = require('./handlers/pollHandler');
const registerChatHandlers = require('./handlers/chatHandler');

connectDB();
const app = express();

// --- IMPORTANT CORS CONFIGURATION ---
const allowedOrigins = [
    'https://live-polling-system0.netlify.app', // Your Netlify frontend
    'http://localhost:3000', // For local React development (if you use port 3000)
    'http://localhost:5174', // For local Vite React development (common port)
    // Add any other origins you need (e.g., other development URLs)
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Crucial for 'Access-Control-Allow-Credentials'
};

app.use(cors(corsOptions)); // Use the detailed corsOptions for Express routes

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: { // Socket.IO specific CORS configuration
        origin: allowedOrigins, // Use the same allowed origins
        methods: ["GET", "POST"],
        credentials: true // Crucial for Socket.IO when client sends credentials
    }
});
// --- END OF CORS CONFIGURATION ---


// Health check route (good for Render to check if service is up)
app.get('/health', (req, res) => {
    res.status(200).send('HTTP Server OK');
});

io.on('connection', (socket) => {
    console.log(`User connected with socket ID: ${socket.id} from origin: ${socket.handshake.headers.origin}`);
    // ... your existing handler registrations
    registerUserHandlers(io, socket);
    registerPollHandlers(io, socket);
    registerChatHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Backend server with DB is running on PORT ${PORT}`);
});