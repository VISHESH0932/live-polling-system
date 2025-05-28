// client/src/components/Teacher/StudentList.js
import React from 'react';
import { useUser } from '../../contexts/UserContext'; // To know if current user is teacher
import './StudentList.css'; // Create this

const StudentList = ({ students, onKick }) => {
    const { user } = useUser(); // Get current user role

    if (!students || students.length === 0) {
        return <p className="no-students">No students currently connected.</p>;
    }

    return (
        <div className="student-list-container">
            {/* Figma shows "Name" and "Action" headers for kick out view */}
            {user?.role === 'teacher' && onKick && (
                <div className="student-list-header">
                    <span>Name</span>
                    <span>Action</span>
                </div>
            )}
            <ul>
                {students.map((student) => (
                    <li key={student.id} className="student-item">
                        <span className="student-name">{student.name}</span>
                        {user?.role === 'teacher' && onKick && ( // Show kick button only for teacher and if onKick is provided
                            <button className="kick-button" onClick={() => onKick(student.id)}>
                                Kick out
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default StudentList;