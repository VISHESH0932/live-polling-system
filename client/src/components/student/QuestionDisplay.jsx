import React from 'react';

const QuestionDisplay = ({ question, questionNumber }) => {
    return (
        <div className="question-display-header">
           
            <h3>{questionNumber ? `Question ${questionNumber}` : "Question"}</h3>
            <p className="question-text">{question}</p>
        </div>
    );
};
export default QuestionDisplay;