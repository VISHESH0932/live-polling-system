const Poll = require('../models/poll'); 
const userService = require('./userService'); 


let activeInMemoryPoll = null;
const DEFAULT_POLL_DURATION = 60;

const createNewPoll = (question, options, timeLimit, creatorId, studentsAtCreationSet) => {
    if (activeInMemoryPoll && activeInMemoryPoll.timeoutId) {
        clearTimeout(activeInMemoryPoll.timeoutId);
    }

    const pollId = `poll-${Date.now()}`;
    const actualTimeLimit = parseInt(timeLimit, 10) || DEFAULT_POLL_DURATION;

    activeInMemoryPoll = {
        
        id: pollId,
        question,
        options: options.map(optText => ({ text: optText, votes: 0 })),
        status: 'active',
        startTime: Date.now(),
        timeLimit: actualTimeLimit,
        voters: {}, 
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
        activeInMemoryPoll.status = 'closed'; 

       
        const pollToSave = new Poll({
            question: activeInMemoryPoll.question,
            options: activeInMemoryPoll.options, 
            creatorId: activeInMemoryPoll.creator,
            status: 'closed', 
            startTime: new Date(activeInMemoryPoll.startTime),
            endedAt: new Date(),
            timeLimit: activeInMemoryPoll.timeLimit,
            
        });

        try {
            const savedPoll = await pollToSave.save();
            console.log(`Poll ${activeInMemoryPoll.id} closed, reason: ${reason}, and saved to DB with _id: ${savedPoll._id}`);
            const result = { ...activeInMemoryPoll, dbId: savedPoll._id }; 
            activeInMemoryPoll = null; 
            return result;
        } catch (err) {
            console.error("Error saving poll to DB:", err);
            
            const result = { ...activeInMemoryPoll, errorSavingToDb: true };
            activeInMemoryPoll = null; 
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
    if (!activeInMemoryPoll || activeInMemoryPoll.status === 'closed') { 
        return true;
    }
   
    if (activeInMemoryPoll.status === 'active' && hasEveryoneVoted()) {
        return true;
    }
    return false;
};

const getPastPollsByTeacher = async (teacherId) => {
    try {
        
        const polls = await Poll.find({ creatorId: teacherId }).sort({ startTime: -1 }).limit(20); 
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
    getPastPollsByTeacher, 
    DEFAULT_POLL_DURATION
};