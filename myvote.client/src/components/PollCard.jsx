import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './PollCard.css';

export default function PollCard({ poll }) {
    const navigate = useNavigate();

    const calculateTimeRemaining = () => {
        const endTime = (window.location.hostname === "localhost")
        ? new Date(poll.dateEnded).getTime()
        : new Date(poll.dateEnded + "Z").getTime();; // Ensure UTC
        const now = Date.now(); // UTC time
        return Math.max(0, Math.floor((endTime - now) / 1000)); // Return time in seconds
    };

    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

    useEffect(() => {
        if (timeRemaining <= 0) return; // Stop updating if already expired

        const interval = setInterval(() => {
            setTimeRemaining((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    const handleGoClick = () => {
        if (poll.pollId) {
            navigate(`/poll/${poll.pollId}`);
        }
    };

    const handleShareClick = (event) => {
        event.stopPropagation(); // Prevents the poll card click event
        navigate(`/poll-link/${poll.pollId}`);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
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
            <p>
                {timeRemaining > 0 
                    ? `Time Remaining: ${formatTime(timeRemaining)}` 
                    : "Status: Inactive"}
            </p>
        </div>
    );
}
