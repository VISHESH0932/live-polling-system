
import React from 'react';
import './LandingPage.css'; 

const KickedOutPage = ({ message }) => {
    return (
        <div className="landing-container page-center">
            <div className="intervue-poll-chip">✨ Intervue Poll</div>
            <h1>You've been Kicked out!</h1>
            <p className="subtitle">
                {message || "Looks like the teacher has removed you from the poll system. Please try again sometime."}
            </p>
          
        </div>
    );
};

export default KickedOutPage;