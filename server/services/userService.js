
const connectedUsers = {};

const addUser = (socketId, name, role) => {
    if (!socketId || !name || !role) {
        console.error('UserService: Attempted to add user with missing info:', { socketId, name, role });
        return null;
    }
    

    if (role !== 'teacher' && role !== 'student') {
        console.error('UserService: Invalid role provided:', role);
        return null;
    }

    const user = { id: socketId, name: name.trim(), role };
    connectedUsers[socketId] = user;
    console.log(`UserService: User added/updated - Name: ${user.name}, Role: ${user.role}, ID: ${socketId}`);
    return user;
};

const removeUser = (socketId) => {
    const user = connectedUsers[socketId];
    if (user) {
        console.log(`UserService: User removed - Name: ${user.name}, Role: ${user.role}, ID: ${socketId}`);
        delete connectedUsers[socketId];
        return user;
    }
    console.warn(`UserService: Attempted to remove non-existent user with ID: ${socketId}`);
    return null;
};

const getUser = (socketId) => {
    if (!socketId) return null;
    return connectedUsers[socketId];
};

const getAllUsers = () => {
    
    return Object.values(connectedUsers).map(user => ({ ...user }));
};

const getStudents = () => {
    return Object.values(connectedUsers)
                 .filter(user => user.role === 'student')
                 .map(user => ({ ...user }));
};

const getTeachers = () => {
    return Object.values(connectedUsers)
                 .filter(user => user.role === 'teacher')
                 .map(user => ({ ...user }));
};


const isUserNameTaken = (name, excludeSocketId = null) => {
    return Object.values(connectedUsers).some(user =>
        user.name.toLowerCase() === name.toLowerCase() && user.id !== excludeSocketId
    );
};


module.exports = {
    addUser,
    removeUser,
    getUser,
    getAllUsers,
    getStudents,
    getTeachers,
    isUserNameTaken, 
    
};