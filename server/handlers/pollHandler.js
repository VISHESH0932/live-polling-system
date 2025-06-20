const pollService = require('../services/pollService');
const userService = require('../services/userService');

module.exports = (io, socket) => {
    // ... (handleCreatePoll, handleSubmitAnswer, handleClosePollManual remain largely the same,
    // but they now call service methods that interact with DB for closeActivePoll)

    // Ensure existing handlers use the async version of closeActivePoll if they await it
    // For example, in handleCreatePoll's timeout:
    // const timeoutId = setTimeout(async () => { // Make async
    //     const currentPollState = pollService.getCurrentPoll();
    //     if (currentPollState && currentPollState.id === newPoll.id && currentPollState.status === 'active') {
    //         console.log(`Poll ${newPoll.id} timed out from handler.`);
    //         const closedPoll = await pollService.closeActivePoll('Timed out'); // await
    //         if (closedPoll && !closedPoll.errorSavingToDb) {
    //             io.emit('pollClosed', closedPoll);
    //         } else if (closedPoll) {
    //             io.emit('pollClosed', { ...closedPoll, message: "Poll closed, DB save failed."});
    //         }
    //     }
    // }, newPoll.timeLimit * 1000);

    // Similar awaits for closeActivePoll in handleSubmitAnswer and handleClosePollManual

    const handleGetPastPolls = async () => {
        const teacher = userService.getUser(socket.id);
        if (!teacher || teacher.role !== 'teacher') {
            return socket.emit('error', { message: 'Only teachers can view past polls.' });
        }
        const pastPolls = await pollService.getPastPollsByTeacher(socket.id); // Use socket.id as teacherId
        if (pastPolls.error) {
            socket.emit('error', { message: pastPolls.error });
        } else {
            socket.emit('pastPollsData', pastPolls);
        }
    };
    
    // --- Modified handleCreatePoll (to show async nature with closeActivePoll) ---
    const handleCreatePoll = async ({ question, options, timeLimit }) => { // Added async
        const teacher = userService.getUser(socket.id);
        if (!teacher || teacher.role !== 'teacher') {
            return socket.emit('error', { message: 'Only teachers can create polls.' });
        }

        // If a poll is active and not all students have answered, we might want to close it first
        const currentActivePoll = pollService.getCurrentPoll();
        if (currentActivePoll && currentActivePoll.status === 'active' && !pollService.hasEveryoneVoted()) {
            return socket.emit('error', { message: 'An active poll is running and not all students have answered.' });
        }
        // If a poll is active but everyone voted, close it before creating new.
        if (currentActivePoll && currentActivePoll.status === 'active' && pollService.hasEveryoneVoted()) {
            console.log("Closing previous poll as all voted before creating new one.");
            const closedOldPoll = await pollService.closeActivePoll('Auto-closed: New poll created by teacher');
            if (closedOldPoll && !closedOldPoll.errorSavingToDb) {
                io.emit('pollClosed', closedOldPoll);
            } // else: error handling if needed
        }


        const studentSocketsAtCreation = new Set(
            userService.getStudents().map(student => student.id)
        );

        const newPoll = pollService.createNewPoll(
            question,
            options,
            timeLimit,
            socket.id,
            studentSocketsAtCreation
        );

        if (newPoll) {
            const timeoutId = setTimeout(async () => { // make callback async
                const currentPollState = pollService.getCurrentPoll();
                if (currentPollState && currentPollState.id === newPoll.id && currentPollState.status === 'active') {
                    console.log(`Poll ${newPoll.id} timed out from handler.`);
                    const closedPoll = await pollService.closeActivePoll('Timed out'); // await
                    if (closedPoll) { // Check if closedPoll is not null
                         io.emit('pollClosed', {
                            id: closedPoll.id,
                            question: closedPoll.question,
                            options: closedPoll.options,
                            reason: closedPoll.reason,
                            errorSavingToDb: closedPoll.errorSavingToDb
                        });
                    }
                }
            }, newPoll.timeLimit * 1000);

            pollService.setPollTimeoutInstance(timeoutId);

            io.emit('newPoll', {
                id: newPoll.id,
                question: newPoll.question,
                options: newPoll.options.map(opt => ({ text: opt.text })),
                timeLimit: newPoll.timeLimit,
            });
            socket.emit('pollCreated', newPoll);
        } else {
            socket.emit('error', { message: 'Failed to create poll.' });
        }
    };

    // --- Modified handleSubmitAnswer ---
    const handleSubmitAnswer = async ({ pollId, optionIndex }) => { // Added async
        const student = userService.getUser(socket.id);
        if (!student || student.role !== 'student') {
            return socket.emit('error', { message: 'Only students can submit answers.' });
        }

        const result = pollService.addVote(pollId, optionIndex, socket.id);

        if (result.error) {
            return socket.emit('error', { message: result.error });
        }

        if (result.success) {
            io.emit('pollResultsUpdate', {
                id: result.updatedPoll.id,
                options: result.updatedPoll.options,
            });

            // if (pollService.hasEveryoneVoted()) {
            //     const currentPoll = pollService.getCurrentPoll();
            //     if (currentPoll && currentPoll.status === 'active') {
            //         console.log(`All expected students answered poll ${currentPoll.id}. Closing from handler.`);
            //         const closedPoll = await pollService.closeActivePoll('All expected students have answered'); // await
            //          if (closedPoll) { // Check if closedPoll is not null
            //              io.emit('pollClosed', {
            //                 id: closedPoll.id,
            //                 question: closedPoll.question,
            //                 options: closedPoll.options,
            //                 reason: closedPoll.reason,
            //                 errorSavingToDb: closedPoll.errorSavingToDb
            //             });
            //         }
            //     }
            // }
        }
    };

    // --- Modified handleClosePollManual ---
    const handleClosePollManual = async () => { // Added async
        const teacher = userService.getUser(socket.id);
        if (!teacher || teacher.role !== 'teacher') {
            return socket.emit('error', { message: 'Only teachers can manually close polls.' });
        }
        const currentPoll = pollService.getCurrentPoll();
        if (currentPoll && currentPoll.status === 'active') {
            const closedPoll = await pollService.closeActivePoll(`Closed by teacher ${teacher.name}`); // await
            if (closedPoll) { // Check if closedPoll is not null
                 io.emit('pollClosed', {
                    id: closedPoll.id,
                    question: closedPoll.question,
                    options: closedPoll.options,
                    reason: closedPoll.reason,
                    errorSavingToDb: closedPoll.errorSavingToDb
                });
            }
        } else {
            socket.emit('error', { message: 'No active poll to close.' });
        }
    };


    socket.on('createPoll', handleCreatePoll);
    socket.on('submitAnswer', handleSubmitAnswer);
    socket.on('closePollManual', handleClosePollManual);
    socket.on('getPastPolls', handleGetPastPolls); // New event listener
};