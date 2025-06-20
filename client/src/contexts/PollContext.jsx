
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';

const PollContext = createContext(null);
export const usePoll = () => useContext(PollContext);

export const PollProvider = ({ children }) => {
    const socket = useSocket();
    const { user } = useUser();

    const [currentPoll, setCurrentPoll] = useState(null); 
    const [pollResults, setPollResults] = useState(null); 
    const [hasVotedThisPoll, setHasVotedThisPoll] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [pollError, setPollError] = useState('');
    const [pastPolls, setPastPolls] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [isPollLoading, setIsPollLoading] = useState(false);

   
    useEffect(() => {
        let timerId;
        if (user?.role === 'student' && currentPoll?.status === 'active' && timeLeft > 0 && !hasVotedThisPoll) {
            timerId = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerId);
                        
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerId);
    }, [user, currentPoll, timeLeft, hasVotedThisPoll]);


    
    const createPoll = useCallback((question, options, timeLimit) => {
        if (socket && user?.role === 'teacher') {
            setIsPollLoading(true);
            setPollError('');
            console.log('PollContext: Emitting createPoll', { question, options, timeLimit });
            socket.emit('createPoll', { question, options, timeLimit });
        }
        else {
        
        console.error('PollContext: createPoll blocked. Socket available:', !!socket, 'User role is teacher:', user?.role === 'teacher');
        setPollError('You must be a teacher to create a poll. Please re-login if issue persists.');
        setIsPollLoading(false);
    }
    }, [socket, user]);

    const closePollManual = useCallback(() => {
        if (socket && user?.role === 'teacher' && currentPoll?.status === 'active') {
            setPollError('');
            console.log('PollContext: Emitting closePollManual');
            socket.emit('closePollManual');
        }
    }, [socket, user, currentPoll]);

    const fetchPastPolls = useCallback(() => {
        if (socket && user?.role === 'teacher') {
            setPollError('');
            console.log('PollContext: Emitting getPastPolls');
            socket.emit('getPastPolls');
        }
    }, [socket, user]);

    const kickStudent = useCallback((studentId) => {
        if (socket && user?.role === 'teacher') {
            console.log(`PollContext: Emitting kickStudent for ID: ${studentId}`);
            socket.emit('kickStudent', studentId);
        }
    }, [socket, user]);


    
    const submitAnswer = useCallback((pollId, optionIndex) => {
        if (socket && user?.role === 'student' && currentPoll?.id === pollId && !hasVotedThisPoll && timeLeft > 0) {
            setIsPollLoading(true);
            setPollError('');
            console.log('PollContext: Emitting submitAnswer', { pollId, optionIndex });
            socket.emit('submitAnswer', { pollId, optionIndex });
        }
    }, [socket, user, currentPoll, hasVotedThisPoll, timeLeft]);


    
    useEffect(() => {
        if (!socket) return;

        const handleNewPoll = (pollData) => { 
            console.log('PollContext: Received newPoll', pollData);
            setCurrentPoll({ 
                id: pollData.id,
                question: pollData.question,
                options: pollData.options,
                timeLimit: pollData.timeLimit,
                status: 'active' 
            });
            setPollResults(null); 
            setHasVotedThisPoll(false);
            setTimeLeft(pollData.timeLimit);
            setPollError('');
            setIsPollLoading(false);
        };

        const handlePollCreated = (pollData) => { 
            console.log('PollContext: Received pollCreated (for teacher)', pollData);
            setCurrentPoll(pollData); 
            setPollResults({ id: pollData.id, options: pollData.options }); 
            setHasVotedThisPoll(false); 
            setTimeLeft(pollData.timeLimit);
            setPollError('');
            setIsPollLoading(false);
        };

        const handlePollStatus = (pollData) => { 
            console.log('PollContext: Received pollStatus (for rejoining teacher)', pollData);
            setCurrentPoll(pollData);
            setPollResults({ id: pollData.id, options: pollData.options });
            setTimeLeft(pollData.timeLimit - Math.floor((Date.now() - pollData.startTime) / 1000) );
            setPollError('');
            setIsPollLoading(false);
        };

        const handlePollResultsUpdate = (resultsData) => {
            console.log('PollContext: Received pollResultsUpdate', resultsData);
            setPollResults(resultsData);
            
            if (user?.role === 'student' && currentPoll?.id === resultsData.id && !hasVotedThisPoll) {
                 // Check if *this* student's vote is reflected (more complex) or just assume they voted
                // For simplicity, if they emitted submitAnswer, they should set hasVotedThisPoll themselves.
                // This event just updates the results for everyone.
            }
            setIsPollLoading(false);
        };

        const handlePollClosed = (closedData) => {
            console.log('PollContext: Received pollClosed', closedData);
            setCurrentPoll(prevPoll => prevPoll && prevPoll.id === closedData.id ? { ...prevPoll, status: 'closed'} : null);
            setPollResults({ id: closedData.id, options: closedData.options, question: closedData.question });
            setTimeLeft(0);
            setHasVotedThisPoll(true);
            if (user?.role === 'teacher') fetchPastPolls(); 
            setIsPollLoading(false);
            if(closedData.errorSavingToDb) {
                setPollError("Poll closed, but failed to save to database.");
            }
        };

        const handlePastPollsData = (pollsArray) => {
            console.log('PollContext: Received pastPollsData', pollsArray);
            setPastPolls(pollsArray);
        };

        const handleActiveUsers = (usersArray) => {
            console.log('PollContext: Received activeUsers', usersArray);
            setActiveUsers(usersArray);
        };

        const handlePollError = (errorData) => {
            console.error('PollContext: Received server error for poll:', errorData.message);
            setPollError(errorData.message || 'A poll error occurred.');
            setIsPollLoading(false);
        };

        socket.on('newPoll', handleNewPoll);
        socket.on('pollCreated', handlePollCreated);
        socket.on('pollStatus', handlePollStatus);
        socket.on('pollResultsUpdate', handlePollResultsUpdate);
        socket.on('pollClosed', handlePollClosed);
        socket.on('pastPollsData', handlePastPollsData);
        socket.on('activeUsers', handleActiveUsers);
        socket.on('error', handlePollError);

        return () => {
            socket.off('newPoll', handleNewPoll);
            socket.off('pollCreated', handlePollCreated);
            socket.off('pollStatus', handlePollStatus);
            socket.off('pollResultsUpdate', handlePollResultsUpdate);
            socket.off('pollClosed', handlePollClosed);
            socket.off('pastPollsData', handlePastPollsData);
            socket.off('activeUsers', handleActiveUsers);
            socket.off('error', handlePollError);
        };
    }, [socket, user, fetchPastPolls]);

    
    useEffect(() => {
        if (isPollLoading && user?.role === 'student' && currentPoll) {
            // This is a bit of a hack, better to confirm vote via server
            // For now, assume if student initiated submitAnswer, they voted.
            // This will be more robust if submitAnswer handler on server confirms vote to specific client.
        }
    }, [isPollLoading, user, currentPoll]);


    const value = {
        currentPoll, setCurrentPoll, 
        pollResults, setPollResults,
        hasVotedThisPoll, setHasVotedThisPoll,
        timeLeft,
        pollError, setPollError,
        pastPolls,
        activeUsers,
        isPollLoading,
        createPoll,
        submitAnswer,
        closePollManual,
        fetchPastPolls,
        kickStudent,
    };

    return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
};