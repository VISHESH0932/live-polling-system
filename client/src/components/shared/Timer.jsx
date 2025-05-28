// client/src/components/Shared/Timer.js
import React from 'react';
import './Timer.css'; // Create this

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const Timer = ({ initialSeconds }) => {
    // The actual countdown logic is now primarily in PollContext's timeLeft
    // This component just displays it.
    return (
        <div className="timer-display">
            {/* Replace with a proper clock icon */}
            🕒 {formatTime(initialSeconds)}
        </div>
    );
};

export default Timer;