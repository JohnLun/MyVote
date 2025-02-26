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
            setShowModal(false); // Close modal
        } catch (error) {
            console.error("Error deleting poll:", error);
        }
    };

    return (
        <>
            <div className="poll-card" onClick={handleGoClick}>
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
                <div className="modal-overlay">
                    <div className="modal">
                        <p>Are you sure you want to delete this poll?</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            <button onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
