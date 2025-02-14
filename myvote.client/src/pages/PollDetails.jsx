import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../contexts/UserContext";
import PollDetailsFlip from "../components/PollDetailsFlip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./PollDetails.css";

const PollDetails = () => {
    const { pollId } = useParams();
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userVoted, setUserVoted] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isPollExpired, setIsPollExpired] = useState(false);
    const { userId } = useUser();
    const navigate = useNavigate();
    const pollResultsRef = useRef();

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054/api"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/poll/${pollId}`);
                if (!response.ok) throw new Error(`Failed to fetch poll data. Status: ${response.status}`);

                const data = await response.json();
                setPoll(data);

                const endTime = new Date(data.dateEnded).getTime();
                const startTime = new Date(data.dateCreated).getTime();
                setTimeRemaining(Math.max(0, endTime - Date.now()));

                if (endTime <= Date.now()) {
                    setIsPollExpired(true);
                } else {
                    startCountdown(endTime, startTime);
                }

                let hasVoted = false;
                let votedChoiceId = null;
                for (const choice of data.choices) {
                    if (choice.userIds.includes(userId)) {
                        hasVoted = true;
                        votedChoiceId = choice.choiceId;
                        break;
                    }
                }
                setUserVoted(hasVoted);
                setSelectedChoice(votedChoiceId);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPoll();
    }, [pollId, userId]);

    const handleVote = async (choiceId) => {
        if (isPollExpired) return; // Prevent voting after expiration

        try {
            const responseBody = {
                choiceId: choiceId,
                userId: userId
            };
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(responseBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Vote submission failed.");
            }

            setUserVoted(true);
            setSelectedChoice(choiceId);

            const updatedPoll = await fetch(`${API_BASE_URL}/poll/${pollId}`).then(res => res.json());
            setPoll(updatedPoll);
        } catch (error) {
            alert(error.message);
        }
    };

    const startCountdown = (endTime, startTime) => {
        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = endTime - now;

            if (timeLeft <= 0) {
                setTimeRemaining(0);
                setIsPollExpired(true);
                clearInterval(timer);
            } else {
                setTimeRemaining(timeLeft);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleShareClick = (event) => {
        event.stopPropagation(); // Prevents the poll card click event
        navigate(`/poll-link/${poll.pollId}`);
    };

    const handleGeneratePDF = async () => {
        const input = pollResultsRef.current;
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
        pdf.save('poll-results.pdf');
    };

    const progress = poll
        ? Math.max(0, (timeRemaining / (new Date(poll.dateEnded) - new Date(poll.dateCreated))) * 100)
        : 0;

    if (loading) return <p>Loading poll...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="poll-details-container">
            <div className="poll-details-card">
                <h2 className="poll-title">{poll.title}</h2>

                {/* Circular Timer */}
                <div className="timer-container">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="timer-background" cx="50" cy="50" r="45" />
                        <circle
                            className="timer-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray="283"
                            strokeDashoffset={`${(progress / 100) * 283}`}
                        />
                        <text x="50" y="55" textAnchor="middle" fontSize="18px" fill="white">
                            {formatTime(timeRemaining)}
                        </text>
                    </svg>
                </div>

                {isPollExpired || userVoted ? (
                    <PollDetailsFlip poll={poll} />
                ) : (
                    <p>{poll.description}</p>
                )}

                {isPollExpired || userVoted ? (
                    <div className="poll-results" ref={pollResultsRef}>
                        {poll.choices.map((choice) => {
                            const totalVotes = poll.choices.reduce((sum, c) => sum + c.numVotes, 0);
                            const percentage = totalVotes > 0 ? ((choice.numVotes / totalVotes) * 100).toFixed(1) : 0;
                            return (
                                <div key={choice.choiceId} className="poll-choice result-container">
                                    <div
                                        className={`result-bar ${choice.choiceId === selectedChoice ? "selected-bar" : ""}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                    <p className={choice.choiceId === selectedChoice ? "selected" : ""}>
                                        {choice.name} - {percentage}% ({choice.numVotes} votes)
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    poll.choices.length > 0 ? (
                        poll.choices.map((choice) => (
                            <button
                                key={choice.choiceId}
                                className="poll-choice"
                                onClick={() => handleVote(choice.choiceId)}
                                disabled={isPollExpired}
                            >
                                {choice.name}
                            </button>
                        ))
                    ) : (
                        <p>No choices available.</p>
                    )
                )}

                {isPollExpired && (
                    <button className="generate-pdf-button" onClick={handleGeneratePDF}>
                        Generate PDF
                    </button>
                )}

                <FaPaperPlane
                    className="poll-icon"
                    onClick={handleShareClick}
                />
            </div>
        </div>
    );
};

export default PollDetails;

