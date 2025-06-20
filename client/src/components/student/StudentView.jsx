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
        setHasVotedThisPoll, 
        timeLeft,
        pollError,
        isPollLoading
    } = usePoll();
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        
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
            setHasVotedThisPoll(true); 
        }
    };

    
    if (pollError) {
        return <div className="student-view error-message">{pollError}</div>;
    }

    
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

    if (pollResults && pollResults.options) {
        const questionText = currentPoll?.question || pollResults.question || "Poll Results";
        return (
            <div className="student-view poll-results-view">
                 <div className="poll-question-header">
                    <QuestionDisplay question={questionText} />
                  
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

    return (
        <div className="student-view waiting-view page-center"> 
            <div className="intervue-poll-chip">✨ Intervue Poll</div>
            <div className="loading-spinner-placeholder">🔄</div>
            <h2>Wait for the teacher to ask questions..</h2>
        </div>
    );
};
export default StudentView;