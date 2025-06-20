const userService = require('../services/userService');
const pollService = require('../services/pollService');
const chatService = require('../services/chatService'); 

module.exports = (io, socket) => {
    const handleUserJoin = async ({ name, role }) => { 
        if (!name || !role) {
            return socket.emit('error', { message: 'Name and role are required to join.' });
        }
        if (name.trim().length < 2 || name.trim().length > 20) {
            return socket.emit('error', { message: 'Name must be between 2 and 20 characters.' });
        }

        // if (userService.isUserNameTaken(name.trim())) {
        //     return socket.emit('error', { message: `Name "${name.trim()}" is already in use. Please choose another.` });
        // }

        const user = userService.addUser(socket.id, name.trim(), role);

        if (user) {
            socket.emit('joined', user); 
            io.emit('activeUsers', userService.getAllUsers().filter(u => u.role)); 
            if (user.role === 'student') {
                const activePollForStudent = pollService.getPollForStudent(); 
                if (activePollForStudent) {
                    const fullCurrentPoll = pollService.getCurrentPoll();
                    if (fullCurrentPoll && fullCurrentPoll.voters && fullCurrentPoll.voters[socket.id] !== undefined) {
                        socket.emit('pollResultsUpdate', { 
                            id: fullCurrentPoll.id,
                            options: fullCurrentPoll.options,
                        });
                    } else {
                        socket.emit('newPoll', activePollForStudent); 
                    }
                }
            }

            else if (user.role === 'teacher') {
                const currentPoll = pollService.getCurrentPoll(); 
                if (currentPoll && currentPoll.status === 'active') {
                    socket.emit('pollStatus', currentPoll); 
                }
            }

            
            const recentMessages = await chatService.getRecentMessages();
            if (recentMessages && !recentMessages.error) {
                socket.emit('chatHistory', recentMessages);
            } else if (recentMessages.error) {
                console.warn('UserHandler: Could not send chat history on join -', recentMessages.error);
            }

        } else {
            
            socket.emit('error', { message: 'Failed to join. Please try again.' });
        }
    };

    const handleDisconnect = () => {
        const user = userService.removeUser(socket.id);
        if (user) {
           
            io.emit('activeUsers', userService.getAllUsers().filter(u => u.role)); 

        }
    };

     const handleKickStudent = (studentIdToKick) => {
        const teacher = userService.getUser(socket.id);

        if (!teacher || teacher.role !== 'teacher') {
            console.warn(`UserHandler: Unauthorized kick attempt by socket ${socket.id}. User:`, teacher);
            return socket.emit('error', { message: 'Only teachers can kick students.' });
        }

        const studentSocketInstance = io.sockets.sockets.get(studentIdToKick); 

        if (studentSocketInstance) {
            const studentToKick = userService.getUser(studentIdToKick); 
            console.log(`UserHandler: Teacher ${teacher.name} (${socket.id}) is kicking student ${studentToKick ? studentToKick.name : 'UnknownName'} (${studentIdToKick})`);
            
            studentSocketInstance.emit('kicked', 'You have been kicked out by the teacher.');

            studentSocketInstance.disconnect(true);

        } else {
            console.warn(`UserHandler: Teacher ${teacher.name} (${socket.id}) tried to kick non-existent or already disconnected student ID: ${studentIdToKick}`);

            io.emit('activeUsers', userService.getAllUsers().filter(u => u.role));
        }
    };

    socket.on('join', handleUserJoin);
    socket.on('disconnect', handleDisconnect);
    socket.on('kickStudent', handleKickStudent);

};