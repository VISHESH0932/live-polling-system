
import React from 'react';
import { useUser } from '../../contexts/UserContext'; 
import './StudentList.css';

const StudentList = ({ students, onKick }) => {
    const { user } = useUser(); 

    if (!students || students.length === 0) {
        return <p className="no-students">No students currently connected.</p>;
    }

    return (
        <div className="student-list-container">
           
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
                        {user?.role === 'teacher' && onKick && ( 
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