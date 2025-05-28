// client/src/components/Student/StudentView.js
import React, { useState, useEffect } from 'react';
import { usePoll } from '../../contexts/PollContext';
import QuestionDisplay from './QuestionDisplay';
import AnswerOptions from './AnswerOption';
import Timer from '../shared/Timer';
import PollResultsChart from '../shared/PollResultChart';
import './StudentView.css'; 

const StudentView = () => {
    const {
        currentPoll,
        pollResults,
        submitAnswer,
        hasVotedThisPoll,
        setHasVotedThisPoll, // Allow setting it directly on submit
        timeLeft,
        pollError,
        isPollLoading
    } = usePoll();
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        // Reset selected option when a new poll arrives
        setSelectedOption(null);
    }, [currentPoll?.id]);

    const handleSelectOption = (index) => {
        if (!hasVotedThisPoll && timeLeft > 0) {
            setSelectedOption(index);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedOption !== null && currentPoll && !hasVotedThisPoll) {
            submitAnswer(currentPoll.id, selectedOption);
            setHasVotedThisPoll(true); // Optimistically set, server confirms via results update
        }
    };

    // Determine view based on state
    if (pollError) {
        return <div className="student-view error-message">{pollError}</div>;
    }

    // View 1: Poll is active, student hasn't voted, time is left (Figma: Frame 6)
    if (currentPoll && currentPoll.status === 'active' && !hasVotedThisPoll && timeLeft > 0) {
        return (
            <div className="student-view poll-active-view">
                <div className="poll-question-header">
                    {/* Assuming question number isn't strictly needed unless backend provides it */}
                    <QuestionDisplay question={currentPoll.question} />
                    <Timer initialSeconds={timeLeft} />
                </div>
                <AnswerOptions
                    options={currentPoll.options}
                    onSelectOption={handleSelectOption}
                    selectedOptionIndex={selectedOption}
                    disabled={isPollLoading}
                />
                <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null || isPollLoading}
                    className="primary submit-answer-btn"
                >
                    {isPollLoading ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        );
    }

    // View 2: Student has voted OR time is up OR poll is closed -> Show results (Figma: Frame 7)
    if (pollResults && pollResults.options) {
         // Check if currentPoll exists for its question, fallback to pollResults question
        const questionText = currentPoll?.question || pollResults.question || "Poll Results";
        return (
            <div className="student-view poll-results-view">
                 <div className="poll-question-header">
                    <QuestionDisplay question={questionText} />
                    {/* Optionally show timer at 00:00 if it was active */}
                    {timeLeft <=0 && currentPoll?.status !== 'closed' && <Timer initialSeconds={0} />}
                </div>
                <PollResultsChart options={pollResults.options} />
                <p className="status-message">
                    {hasVotedThisPoll && timeLeft > 0 && currentPoll?.status === 'active'
                        ? "You have submitted your answer. Waiting for poll to end..."
                        : "The poll has ended. Here are the results."}
                </p>
                <p className="status-message">Wait for the teacher to ask a new question...</p>
            </div>
        );
    }

    // View 3: Waiting for teacher to start a poll (Figma: Frame 5 & 9)
    return (
        <div className="student-view waiting-view page-center"> {/* Reuse page-center from LandingPage.css */}
            <div className="intervue-poll-chip">✨ Intervue Poll</div>
            <div className="loading-spinner-placeholder">🔄</div> {/* Replace with actual spinner component */}
            <h2>Wait for the teacher to ask questions..</h2>
        </div>
    );
};
export default StudentView;