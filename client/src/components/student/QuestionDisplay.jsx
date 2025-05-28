// client/src/components/Student/QuestionDisplay.js
import React from 'react';

const QuestionDisplay = ({ question, questionNumber }) => {
    return (
        <div className="question-display-header">
            {/* Figma shows "Question 1", could be dynamic or just "Question" */}
            <h3>{questionNumber ? `Question ${questionNumber}` : "Question"}</h3>
            <p className="question-text">{question}</p>
        </div>
    );
};
export default QuestionDisplay;