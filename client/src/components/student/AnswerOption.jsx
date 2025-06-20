import React from 'react';
import './AnswerOption.css';

const AnswerOptions = ({ options, onSelectOption, selectedOptionIndex, disabled }) => {
    return (
        <ul className="answer-options-list">
            {options.map((option, index) => (
                <li key={index}>
                    <button
                        className={`option-button ${selectedOptionIndex === index ? 'selected' : ''}`}
                        onClick={() => onSelectOption(index)}
                        disabled={disabled}
                    >
                        <span className="option-number-student">{index + 1}</span>
                        <span className="option-text-student">{option.text}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
};
export default AnswerOptions;