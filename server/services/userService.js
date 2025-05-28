// services/userService.js

// In-memory store for connected users
// { socketId: { id: String, name: String, role: 'teacher' | 'student' } }
const connectedUsers = {};

const addUser = (socketId, name, role) => {
    if (!socketId || !name || !role) {
        console.error('UserService: Attempted to add user with missing info:', { socketId, name, role });
        return null;
    }
    // Basic validation for role
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
    // Return a new array of user objects to prevent external modification of the internal store
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

// Function to check if a user with a given name already exists (optional, for basic uniqueness check)
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
    isUserNameTaken, // Added for potential use
    // _internal_connectedUsers_DO_NOT_MODIFY_DIRECTLY: connectedUsers // Generally avoid exposing this
};