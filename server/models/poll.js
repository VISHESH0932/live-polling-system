const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptionSchema = new Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const PollSchema = new Schema({
    question: { type: String, required: true },
    options: [OptionSchema],
    creatorId: { type: String, required: true }, // socket.id of the teacher, or a persistent user ID if you implement full auth
    status: { type: String, enum: ['active', 'closed'], default: 'active' }, // 'active' for in-memory, 'closed' when saved
    startTime: { type: Date, default: Date.now },
    endedAt: { type: Date },
    timeLimit: { type: Number }, // seconds
    // voters: { type: Map, of: Number }, // { socketId: optionIndex } - Can be complex to query. Maybe store only final results.
                                         // For past polls, we mostly care about final counts in options.
    // studentsAtCreation: [String] // Array of student socket.ids
}, { timestamps: { createdAt: 'startTime', updatedAt: 'endedAt' } }); // Use Mongoose timestamps

module.exports = mongoose.model('Poll', PollSchema);