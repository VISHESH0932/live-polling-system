// client/src/pages/KickedOutPage.js
import React from 'react';
import './LandingPage.css'; // Reuse some styles

const KickedOutPage = ({ message }) => {
    return (
        <div className="landing-container page-center">
            <div className="intervue-poll-chip">✨ Intervue Poll</div>
            <h1>You've been Kicked out!</h1>
            <p className="subtitle">
                {message || "Looks like the teacher has removed you from the poll system. Please try again sometime."}
            </p>
            {/* Optionally, a button to go back to login or close the tab */}
            {/* <button onClick={() => window.location.reload()}>Try to Rejoin</button> */}
        </div>
    );
};

export default KickedOutPage;