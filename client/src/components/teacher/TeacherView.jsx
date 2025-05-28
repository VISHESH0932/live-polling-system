// client/src/components/Teacher/TeacherView.js
import React, { useState, useEffect } from 'react';
import { usePoll } from '../../contexts/PollContext';
import CreatePollForm from './CreatePollForm';
import PollResultsChart from '../shared/PollResultChart';
import Timer from '../shared/Timer';
import PastPollsView from './PastPollsView';
import './TeacherView.css';

const TeacherView = () => {
    const {
        currentPoll,
        setCurrentPoll, // <-- Add if you need to force clear it from TeacherView
        pollResults,
        setPollResults, // <-- Add to clear last poll's results display
        closePollManual,
        pollError,
        setPollError,
        fetchPastPolls
    } = usePoll();
    const [showPastPolls, setShowPastPolls] = useState(false);

    // This effect will ensure that if the PollContext clears currentPoll (e.g. after 'pollClosed')
    // and we are not showing past polls, we are in creation mode.
    useEffect(() => {
        if (!currentPoll && !pollResults?.options && !showPastPolls) {
            // This state naturally leads to showing CreatePollForm
        }
    }, [currentPoll, pollResults, showPastPolls]);


    const handleAskNewPoll = () => {
        setShowPastPolls(false); // Ensure we are not in past polls view
        setPollError('');

        // Clear local/contextual representations of the ended poll so CreatePollForm shows
        // The PollContext should ideally handle resetting currentPoll when a poll truly ends
        // or before a new one is created. Forcing it here ensures UI updates.
        if (setCurrentPoll) setCurrentPoll(null); // If available from context, tell it to reset
        if (setPollResults) setPollResults(null); // Clear the last poll's results from view

        // The server validates if a new poll can be asked.
        // The UI will now fall into the condition that shows CreatePollForm.
    };

    const togglePastPollsView = () => {
        if (!showPastPolls) {
            fetchPastPolls();
        }
        setShowPastPolls(prev => !prev);
        setPollError('');
    };

    if (showPastPolls) {
        return (
            <div className="teacher-view">
                <button onClick={togglePastPollsView} className="primary view-toggle-btn">
                    ← Back to Polls
                </button>
                <PastPollsView />
            </div>
        );
    }

    // Active Poll View
    if (currentPoll && currentPoll.status === 'active') {
        return (
            <div className="teacher-view live-poll-view">
                <div className="teacher-view-header">
                    <h3>Live Poll</h3>
                    <button onClick={togglePastPollsView} className="secondary-btn">
                        View Past Polls
                    </button>
                </div>
                <div className="poll-header-info">
                    <h2>{currentPoll.question}</h2>
                    <Timer initialSeconds={currentPoll.timeLimit} />
                </div>
                {/* For teacher, pollResults from context will update live */}
                <PollResultsChart options={pollResults?.options || currentPoll.options} />
                <button onClick={closePollManual} className="primary end-poll-btn">End Poll Now</button>
                {pollError && <p className="error-message">{pollError}</p>}
            </div>
        );
    }
    // Poll Ended View (but currentPoll might be null if already reset by context)
    // We rely on pollResults having data for the *last* poll
    else if (pollResults && pollResults.options && (!currentPoll || currentPoll.status === 'closed')) {
        return (
            <div className="teacher-view poll-ended-view">
                <div className="teacher-view-header">
                    <h3>Poll Ended</h3>
                    <button onClick={togglePastPollsView} className="secondary-btn">
                        View Past Polls
                    </button>
                </div>
                <h2>{pollResults.question}</h2> {/* Use question from pollResults */}
                <PollResultsChart options={pollResults.options} />
                <button onClick={handleAskNewPoll} className="primary ask-new-btn">
                    + Ask a New Poll
                </button>
                {pollError && <p className="error-message">{pollError}</p>}
            </div>
        );
    }
    // Default to Poll Creation Form
    else {
        return (
            <div className="teacher-view">
                <div className="teacher-view-header">
                    <h3>Create New Poll</h3>
                    <button onClick={togglePastPollsView} className="secondary-btn">
                        View Past Polls
                    </button>
                </div>
                <CreatePollForm />
                {pollError && <p className="error-message">{pollError}</p>}
            </div>
        );
    }
};
export default TeacherView;