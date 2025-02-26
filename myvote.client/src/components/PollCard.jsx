import React, { useState, useEffect } from "react";
import { FaPaperPlane, FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "./PollCard.css";

export default function PollCard({ poll, onDelete, activeTab }) {
    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

    const navigate = useNavigate();
    const { userId } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
    const [isFadingOut, setIsFadingOut] = useState(false);


    function calculateTimeRemaining() {
        const endTime =
            window.location.hostname === "localhost"
                ? new Date(poll.dateEnded).getTime()
                : new Date(poll.dateEnded + "Z").getTime();
        return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    }

    useEffect(() => {
        if (timeRemaining <= 0) return;
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
        event.stopPropagation();
        navigate(`/poll-link/${poll.pollId}`);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    const confirmDelete = async () => {
        setShowModal(false); // Close the modal immediately
    
        setTimeout(() => {
            setIsFadingOut(true); // Start fade-out animation after modal closes
        }, 100); // Small delay ensures modal fully disappears first
    
        setTimeout(async () => {
            try {
                const url =
                    activeTab === "voted"
                        ? `${API_BASE_URL}/api/${poll.pollId}/user/${userId}`
                        : `${API_BASE_URL}/api/poll/${poll.pollId}`;
    
                const response = await fetch(url, { method: "DELETE" });
    
                if (!response.ok) {
                    throw new Error("Failed to delete poll");
                }
    
                onDelete(poll.pollId); // Notify parent component
                setIsFadingOut(false); // Reset fade-out state for future polls
            } catch (error) {
                console.error("Error deleting poll:", error);
            }
        }, 1100); // Match this delay to the animation duration (1s)
    };
    
    

    return (
        <>
            <div className={`poll-card ${isFadingOut ? "fade-out" : ""}`} onClick={handleGoClick}>
                <div className="poll-header">
                    <div className="poll-card-title">{poll.title}</div>
                    <FaPaperPlane className="poll-icon" onClick={handleShareClick} />
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(true);
                        }}
                    />
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <p>Are you sure you want to delete this poll?</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)}>Back</button>
                            <button onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
