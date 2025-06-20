import React, { useState } from 'react';
import { usePoll } from '../../contexts/PollContext';
import './CreatePollForm.css';

const CreatePollForm = () => {
    const { createPoll, isPollLoading, pollError, setPollError } = usePoll();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); 
    const [timeLimit, setTimeLimit] = useState(60);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 10) { 
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) { 
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPollError(''); 
        if (!question.trim()) {
            setPollError('Poll question cannot be empty.');
            return;
        }
        const validOptions = options.map(opt => opt.trim()).filter(opt => opt);
        if (validOptions.length < 2) {
            setPollError('Please provide at least two valid options.');
            return;
        }
        createPoll(question.trim(), validOptions, parseInt(timeLimit, 10));
        
    };

    return (
        <div className="create-poll-form-container">
            <div className="intervue-poll-chip-form">✨ Intervue Poll</div>
            <h2>Let's Get Started</h2>
            <p className="form-subtitle">You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group question-group">
                    <label htmlFor="poll-question">Enter your question</label>
                    <textarea
                        id="poll-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="E.g., What is your favorite programming language?"
                        maxLength={200}
                        rows={3}
                    />
                    <span className="char-count">{question.length}/200</span>
                </div>

                <label>Edit Options</label>
                {options.map((option, index) => (
                    <div key={index} className="form-group option-group">
                         <span className="option-number-form">{index + 1}</span>
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                        />
                        {options.length > 2 && (
                            <button type="button" onClick={() => removeOption(index)} className="remove-option-btn">
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addOption} disabled={options.length >= 10} className="add-option-btn">
                    + Add More option
                </button>

                <div className="form-group time-limit-group">
                    <label htmlFor="time-limit">Time limit</label>
                    <select id="time-limit" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={90}>90 seconds</option>
                        <option value={120}>120 seconds</option>
                    </select>
                </div>

                {pollError && <p className="error-message">{pollError}</p>}
                <button type="submit" className="primary ask-question-btn" disabled={isPollLoading}>
                    {isPollLoading ? 'Starting Poll...' : 'Ask Question'}
                </button>
            </form>
        </div>
    );
};
export default CreatePollForm;