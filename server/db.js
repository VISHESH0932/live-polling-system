// db.js
const mongoose = require('mongoose');
require('dotenv').config(); 

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        
        process.exit(1);
    }
};

module.exports = connectDB;