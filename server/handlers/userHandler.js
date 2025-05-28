// handlers/userHandler.js
const userService = require('../services/userService');
const pollService = require('../services/pollService');
const chatService = require('../services/chatService'); // For sending chat history on join

module.exports = (io, socket) => {
    const handleUserJoin = async ({ name, role }) => { // Make it async for chat history
        if (!name || !role) {
            return socket.emit('error', { message: 'Name and role are required to join.' });
        }
        if (name.trim().length < 2 || name.trim().length > 20) {
            return socket.emit('error', { message: 'Name must be between 2 and 20 characters.' });
        }
        // Optional: Check if name is already taken among connected users
        // if (userService.isUserNameTaken(name.trim())) {
        //     return socket.emit('error', { message: `Name "${name.trim()}" is already in use. Please choose another.` });
        // }

        const user = userService.addUser(socket.id, name.trim(), role);

        if (user) {
            socket.emit('joined', user); // Confirm join to the user themselves
            io.emit('activeUsers', userService.getAllUsers().filter(u => u.role)); // Broadcast updated active user list

            // If a student joins and a poll is active
            if (user.role === 'student') {
                const activePollForStudent = pollService.getPollForStudent(); // Gets poll with remaining time
                if (activePollForStudent) {
                    const fullCurrentPoll = pollService.getCurrentPoll(); // Get full poll for voter check
                    // Check if this student (by socket.id) has already voted in the current in-memory poll
                    if (fullCurrentPoll && fullCurrentPoll.voters && fullCurrentPoll.voters[socket.id] !== undefined) {
                        socket.emit('pollResultsUpdate', { // Student already voted (e.g., refresh), send current results
                            id: fullCurrentPoll.id,
                            options: fullCurrentPoll.options,
                        });
                    } else {
                        socket.emit('newPoll', activePollForStudent); // Send new poll data
                    }
                }
            }
            // If a teacher joins and a poll is active
            else if (user.role === 'teacher') {
                const currentPoll = pollService.getCurrentPoll(); // Get current in-memory poll
                if (currentPoll && currentPoll.status === 'active') {
                    socket.emit('pollStatus', currentPoll); // Send full poll data (including votes) to teacher
                }
            }

            // Send recent chat history to the newly joined user
            const recentMessages = await chatService.getRecentMessages();
            if (recentMessages && !recentMessages.error) {
                socket.emit('chatHistory', recentMessages);
            } else if (recentMessages.error) {
                console.warn('UserHandler: Could not send chat history on join -', recentMessages.error);
            }

        } else {
            // This case might happen if addUser returns null due to invalid role or other internal logic
            socket.emit('error', { message: 'Failed to join. Please try again.' });
        }
    };

    const handleDisconnect = () => {
        const user = userService.removeUser(socket.id);
        if (user) {
            // console.log(`UserHandler: ${user.name} (${user.role}) disconnected.`);
            io.emit('activeUsers', userService.getAllUsers().filter(u => u.role)); // Update active users list

            // Optional: If the poll creator disconnects, you might want specific logic.
            // const currentPoll = pollService.getCurrentPoll();
            // if (currentPoll && currentPoll.creator === socket.id && currentPoll.status === 'active') {
            //     console.log(`UserHandler: Poll creator ${user.name} disconnected. Poll remains active.`);
            //     // const closedPoll = await pollService.closeActivePoll('Creator disconnected');
            //     // if (closedPoll && !closedPoll.errorSavingToDb) {
            //     //     io.emit('pollClosed', closedPoll);
            //     // }
            // }
        }
    };

    // Register event listeners for this socket connection
    socket.on('join', handleUserJoin);
    socket.on('disconnect', handleDisconnect);

    // Consider adding a 'requestInitialData' event if needed, though 'join' covers much of it.
};