import React from 'react';
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './PollCard.css';

export default function PollCard({ poll }) {
    const navigate = useNavigate();

    const handleGoClick = () => {
        if (poll.pollId) {
            navigate(`/poll/${poll.pollId}`);
        }
    };

    const handleShareClick = (event) => {
        event.stopPropagation(); // Prevents the poll card click event
        navigate(`/poll-link/${poll.pollId}`);
    };

    return (
        <div className="poll-card" onClick={handleGoClick}>
            <div className="poll-header">
                <h2>{poll.title}</h2>
                <FaPaperPlane
                    className="poll-icon"
                    onClick={handleShareClick}
                />
            </div>
            <p>{poll.description}</p>
            <p>Time Limit: {new Date(poll.timeLimit).toLocaleString()}</p>
            <p>Status: {poll.isActive === "t" ? 'Active' : 'Inactive'}</p>
        </div>
    );
}
