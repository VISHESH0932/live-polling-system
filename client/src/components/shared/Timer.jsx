
import React from 'react';
import './Timer.css';

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const Timer = ({ initialSeconds }) => {
   
    return (
        <div className="timer-display">
            🕒 {formatTime(initialSeconds)}
        </div>
    );
};

export default Timer;