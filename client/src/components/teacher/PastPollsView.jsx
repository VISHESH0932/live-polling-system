import React, { useEffect } from 'react';
import { usePoll } from '../../contexts/PollContext';
import PollResultsChart from '../shared/PollResultChart'; 
import './PastPollsView.css';

const PastPollsView = () => {
    const { pastPolls, fetchPastPolls, pollError, setPollError } = usePoll();

    useEffect(() => {
        
        setPollError('');
        fetchPastPolls(); 
    }, [fetchPastPolls, setPollError]);

    if (!pastPolls) { 
        return (
            <div className="past-polls-container">
                <h3>Past Polls</h3>
                <p>Loading past polls...</p>
            </div>
        );
    }
    
    if (pollError) { 
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
                   
                </div>
            ))}
        </div>
    );
};

export default PastPollsView;