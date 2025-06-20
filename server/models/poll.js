const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptionSchema = new Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const PollSchema = new Schema({
    question: { type: String, required: true },
    options: [OptionSchema],
    creatorId: { type: String, required: true }, 
    status: { type: String, enum: ['active', 'closed'], default: 'active' }, 
    startTime: { type: Date, default: Date.now },
    endedAt: { type: Date },
    timeLimit: { type: Number }, 
}, { timestamps: { createdAt: 'startTime', updatedAt: 'endedAt' } });

module.exports = mongoose.model('Poll', PollSchema);