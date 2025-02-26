import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import './PollCard.css';

export default function PollCard({ poll, onDelete, activeTab }) {
    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

    const navigate = useNavigate();

    const { userId } = useUser();

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

    const handleDelete = async (event) => {
        event.stopPropagation();

        try {
            if (activeTab=="voted") {
                const response = await fetch(`${API_BASE_URL}/api/${poll.pollId}/user/${userId}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete poll');
                }
            } else {
                const response = await fetch(`${API_BASE_URL}/api/poll/${poll.pollId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete poll');
                }
            }
            

            onDelete(poll.pollId); // Update the state in UserProfile
        } catch (error) {
            console.error("Error deleting poll:", error);
        }
    };

    return (
        <div className="poll-card" onClick={handleGoClick}>
            <div className="poll-header">
                <div className="poll-card-title">{poll.title}</div>
                <FaPaperPlane
                    className="poll-icon"
                    onClick={handleShareClick}
                />
            </div>
            <div className="poll-card-description">{poll.description}</div>
            <div className="status-container">
                <p>
                    {timeRemaining > 0 
                        ? `Time Remaining: ${formatTime(timeRemaining)}` 
                        : "Status: Inactive"}
                </p>
                <FaRegTrashAlt
                    className="delete-icon"
                    onClick={handleDelete}
                />
            </div>

        </div>
    );
}
