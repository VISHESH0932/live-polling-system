// client/src/components/Teacher/PastPollsView.js
import React, { useEffect } from 'react';
import { usePoll } from '../../contexts/PollContext';
import PollResultsChart from '../shared/PollResultChart'; // Re-use the chart
import './PastPollsView.css'; // We created this CSS earlier

const PastPollsView = () => {
    const { pastPolls, fetchPastPolls, pollError, setPollError } = usePoll();

    useEffect(() => {
        // Clear any existing poll errors when viewing past polls
        setPollError('');
        fetchPastPolls(); // Fetch when component mounts or becomes visible
    }, [fetchPastPolls, setPollError]);

    if (!pastPolls) { // Check if pastPolls is null (e.g., during initial fetch or if fetch failed without setting an empty array)
        return (
            <div className="past-polls-container">
                <h3>Past Polls</h3>
                <p>Loading past polls...</p> {/* Or a spinner component */}
            </div>
        );
    }
    
    if (pollError) { // Display error if fetching past polls failed
         return (
            <div className="past-polls-container">
                <h3>Past Polls</h3>
                <p className="error-message">{pollError}</p>
            </div>
        );
    }

    if (pastPolls.length === 0) {
        return (
            <div className="past-polls-container">
                <h3>Past Polls</h3>
                <p>No past polls found for you.</p>
            </div>
        );
    }

    return (
        <div className="past-polls-container">
            <h3>Past Polls</h3>
            {pastPolls.map(poll => (
                <div key={poll._id || poll.id} className="past-poll-item">
                    {/* Pass the question to the chart component if it supports it */}
                    <PollResultsChart question={poll.question} options={poll.options} />
                    <div className="past-poll-meta">
                        <p>
                            Asked on: {new Date(poll.startTime || poll.createdAt).toLocaleDateString()}
                            {' '}
                            {new Date(poll.startTime || poll.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {poll.endedAt && (
                            <p>
                                Ended on: {new Date(poll.endedAt).toLocaleDateString()}
                                {' '}
                                {new Date(poll.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                    {/* You could add more details here, like timeLimit, number of voters if stored */}
                </div>
            ))}
        </div>
    );
};

export default PastPollsView;