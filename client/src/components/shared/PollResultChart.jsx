
import React from 'react';
import './PollResultChart.css';

const PollResultsChart = ({ options, question }) => {
    if (!options || options.length === 0) {
        return <p>No results to display yet.</p>;
    }

    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

    return (
        <div className="poll-results-chart-container">
            {question && <h3 className="poll-question-title">{question}</h3>}
            <ul className="results-list">
                {options.map((option, index) => {
                    const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(0) : 0;
                    return (
                        <li key={index} className="result-item">
                            <div className="option-label-container">
                                <span className="option-number">{index + 1}</span>
                                <span className="option-text">{option.text}</span>
                            </div>
                            <div className="result-bar-container">
                                <div
                                    className="result-bar"
                                    style={{ width: `${percentage}%` }}
                                >
                                </div>
                            </div>
                            <span className="percentage-text">{percentage}%</span>
                        </li>
                    );
                })}
            </ul>
             
        </div>
    );
};
export default PollResultsChart;