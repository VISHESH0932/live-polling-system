const Poll = require('../models/poll'); // Import Mongoose model
const userService = require('./userService'); // For getting creator name if needed

// In-memory store for the *current* active poll
let activeInMemoryPoll = null;
const DEFAULT_POLL_DURATION = 60;

const createNewPoll = (question, options, timeLimit, creatorId, studentsAtCreationSet) => {
    if (activeInMemoryPoll && activeInMemoryPoll.timeoutId) {
        clearTimeout(activeInMemoryPoll.timeoutId);
    }

    const pollId = `poll-${Date.now()}`; // Still useful for in-memory tracking before DB save
    const actualTimeLimit = parseInt(timeLimit, 10) || DEFAULT_POLL_DURATION;

    activeInMemoryPoll = {
        // This structure is for the *live, in-memory* poll
        id: pollId, // Temporary ID for live operations, DB will generate _id
        question,
        options: options.map(optText => ({ text: optText, votes: 0 })),
        status: 'active',
        startTime: Date.now(),
        timeLimit: actualTimeLimit,
        voters: {}, // { socketId: optionIndexVoted }
        creator: creatorId,
        studentsAtCreation: studentsAtCreationSet,
        timeoutId: null
    };
    console.log(`In-memory poll data prepared: ${activeInMemoryPoll.id} by ${creatorId}`);
    return { ...activeInMemoryPoll };
};

const getCurrentPoll = () => {
    return activeInMemoryPoll ? { ...activeInMemoryPoll } : null;
};

const getPollForStudent = () => {
    if (!activeInMemoryPoll || activeInMemoryPoll.status !== 'active') return null;

    const timePassed = Math.floor((Date.now() - activeInMemoryPoll.startTime) / 1000);
    const timeLeftForStudent = activeInMemoryPoll.timeLimit - timePassed;

    if (timeLeftForStudent <= 0) return null;

    return {
        id: activeInMemoryPoll.id,
        question: activeInMemoryPoll.question,
        options: activeInMemoryPoll.options.map(opt => ({ text: opt.text })),
        timeLimit: timeLeftForStudent,
    };
};


const addVote = (pollId, optionIndex, voterSocketId) => {
    if (!activeInMemoryPoll || activeInMemoryPoll.id !== pollId || activeInMemoryPoll.status !== 'active') {
        return { error: 'Poll is not active or not found.' };
    }
    if (activeInMemoryPoll.voters[voterSocketId] !== undefined) {
        return { error: 'You have already voted.' };
    }
    const timePassed = Math.floor((Date.now() - activeInMemoryPoll.startTime) / 1000);
    if (timePassed >= activeInMemoryPoll.timeLimit) {
        return { error: 'Time to answer has expired.' };
    }
    if (optionIndex >= 0 && optionIndex < activeInMemoryPoll.options.length) {
        activeInMemoryPoll.options[optionIndex].votes++;
        activeInMemoryPoll.voters[voterSocketId] = optionIndex;
        return { success: true, updatedPoll: { ...activeInMemoryPoll } };
    }
    return { error: 'Invalid option index.' };
};

const closeActivePoll = async (reason) => {
    if (activeInMemoryPoll && activeInMemoryPoll.status === 'active') {
        if (activeInMemoryPoll.timeoutId) {
            clearTimeout(activeInMemoryPoll.timeoutId);
            activeInMemoryPoll.timeoutId = null;
        }
        activeInMemoryPoll.status = 'closed'; // Mark in-memory as closed

        // Prepare data for saving to DB
        const pollToSave = new Poll({
            question: activeInMemoryPoll.question,
            options: activeInMemoryPoll.options, // These now have the final votes
            creatorId: activeInMemoryPoll.creator,
            status: 'closed', // Explicitly set for DB record
            startTime: new Date(activeInMemoryPoll.startTime),
            endedAt: new Date(),
            timeLimit: activeInMemoryPoll.timeLimit,
            // studentsAtCreation: Array.from(activeInMemoryPoll.studentsAtCreation) // Optionally save this
        });

        try {
            const savedPoll = await pollToSave.save();
            console.log(`Poll ${activeInMemoryPoll.id} closed, reason: ${reason}, and saved to DB with _id: ${savedPoll._id}`);
            const result = { ...activeInMemoryPoll, dbId: savedPoll._id }; // Add DB ID to the result
            activeInMemoryPoll = null; // Clear the in-memory active poll
            return result;
        } catch (err) {
            console.error("Error saving poll to DB:", err);
            // Still return the in-memory closed poll data so the frontend can react
            // but maybe signal that DB save failed.
            const result = { ...activeInMemoryPoll, errorSavingToDb: true };
            activeInMemoryPoll = null; // Clear the in-memory active poll
            return result;
        }
    }
    return null;
};

const setPollTimeoutInstance = (timeoutId) => {
    if (activeInMemoryPoll) {
        activeInMemoryPoll.timeoutId = timeoutId;
    }
};

const hasEveryoneVoted = () => {
    if (!activeInMemoryPoll || !activeInMemoryPoll.studentsAtCreation) return false;
    return Array.from(activeInMemoryPoll.studentsAtCreation)
                .every(studentId => activeInMemoryPoll.voters[studentId] !== undefined);
};

const canTeacherCreateNewPoll = () => {
    if (!activeInMemoryPoll || activeInMemoryPoll.status === 'closed') { // 'closed' in-memory implies it's cleared
        return true;
    }
    // If an active poll exists, check if everyone has voted
    if (activeInMemoryPoll.status === 'active' && hasEveryoneVoted()) {
        return true; // Allow closing the current one and starting a new one
    }
    return false;
};

const getPastPollsByTeacher = async (teacherId) => {
    try {
        // Find polls where creatorId matches. Sort by newest first.
        const polls = await Poll.find({ creatorId: teacherId }).sort({ startTime: -1 }).limit(20); // Limit for performance
        return polls;
    } catch (err) {
        console.error("Error fetching past polls:", err);
        return { error: "Failed to fetch past polls." };
    }
};

module.exports = {
    createNewPoll,
    getCurrentPoll,
    getPollForStudent,
    addVote,
    closeActivePoll,
    setPollTimeoutInstance,
    hasEveryoneVoted,
    canTeacherCreateNewPoll,
    getPastPollsByTeacher, // New
    DEFAULT_POLL_DURATION
};