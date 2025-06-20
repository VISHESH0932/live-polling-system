
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './LandingPage.css';

const LandingPage = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [name, setName] = useState('');
    const [step, setStep] = useState(1); 
    const { login, userError, setUserError, isUserLoading } = useUser();

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setUserError('');
    };

    const handleRoleContinue = () => {
        if (!selectedRole) {
            setUserError('Please select a role.');
            return;
        }
        setStep(2);
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setUserError('Please enter your name.');
            return;
        }
        if (!selectedRole) { 
            setUserError('Role not selected. Please go back.');
            return;
        }
        login(name.trim(), selectedRole);
    };

    if (step === 1) {
        return (
            <div className="landing-container page-center">
                <div className="intervue-poll-chip">✨ Intervue Poll</div>
                <h1>Welcome to the Live Polling System</h1>
                <p className="subtitle">Please select the role that best describes you to begin using the system</p>
                <div className="role-selection">
                    <div
                        className={`role-box ${selectedRole === 'student' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelect('student')}
                    >
                        <h2>I'm a Student</h2>
                        <p>Submit answers and view live poll results in real-time</p>
                    </div>
                    <div
                        className={`role-box ${selectedRole === 'teacher' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelect('teacher')}
                    >
                        <h2>I'm a Teacher</h2>
                        <p>Ask questions and view live poll results in real-time.</p>
                    </div>
                </div>
                {userError && <p className="error-message">{userError}</p>}
                <button className="primary" onClick={handleRoleContinue} disabled={!selectedRole || isUserLoading}>
                    {isUserLoading ? 'Joining...' : 'Continue'}
                </button>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="landing-container page-center">
                 <div className="intervue-poll-chip">✨ Intervue Poll</div>
                <h1>Let's Get Started</h1>
                <p className="subtitle">
                    {selectedRole === 'student'
                        ? "If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates"
                        : "You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time."}
                </p>
                <form onSubmit={handleNameSubmit} className="name-input-form">
                    <label htmlFor="nameInput">Enter your Name</label>
                    <input
                        type="text"
                        id="nameInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={selectedRole === 'student' ? "Rahul Bajaj" : "Prof. Snape"}
                        required
                    />
                    {userError && <p className="error-message">{userError}</p>}
                    <button type="submit" className="primary" disabled={isUserLoading}>
                        {isUserLoading ? 'Joining...' : (selectedRole === 'student' ? 'Continue' : 'Start Managing Polls')}
                    </button>
                     <button type="button" onClick={() => { setStep(1); setUserError(''); setName(''); setSelectedRole('');}} className="back-button">
                        Back to Role Selection
                    </button>
                </form>
            </div>
        );
    }
    return null; 
};

export default LandingPage;

