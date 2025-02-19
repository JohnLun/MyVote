import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../contexts/UserContext";
import PollDetailsFlip from "../components/PollDetailsFlip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as signalR from "@microsoft/signalr";
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
    const pollDetailsRef = useRef();
    const timerRef = useRef(null);
    const [connection, setConnection] = useState(null);

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/poll/${pollId}`);
                if (!response.ok) throw new Error(`Failed to fetch poll data. Status: ${response.status}`);

                const data = await response.json();

                const dateCreatedUtc = (window.location.hostname === "localhost")
                    ? new Date(data.dateCreated)
                    : new Date(data.dateCreated + "Z");

                const dateEndedUtc = (window.location.hostname === "localhost")
                    ? new Date(data.dateEnded)
                    : new Date(data.dateEnded + "Z");

                setPoll(data);

                const endTime = dateEndedUtc.getTime();
                const startTime = dateCreatedUtc.getTime();
                const nowUtc = new Date().getTime();
                setTimeRemaining(Math.max(0, endTime - nowUtc));

                if (endTime <= nowUtc) {
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

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/voteHub`, {
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                console.log("Connected to SignalR");

                newConnection.on("ReceiveVoteUpdate", (updatedPoll) => {
                    setPoll(updatedPoll);
                });

                console.log("Listener added");
            })
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => {
            newConnection.stop();
        };
    }, [pollId]);

    const handleVote = async (choiceId) => {
        if (isPollExpired) return; // Prevent voting after expiration

        try {
            const responseBody = {
                choiceId: choiceId,
                userId: userId
            };
            const response = await fetch(`${API_BASE_URL}/api/vote`, {
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

        } catch (error) {
            alert(error.message);
        }
    };

    const handleMakeInactive = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/poll/${pollId}/end`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to make poll inactive.");
            }

            // Re-fetch the updated poll after marking it as inactive
            const data = await response.json();
            setPoll(data);
            setIsPollExpired(true);
            setTimeRemaining(0);

            clearInterval(timerRef.current);
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
                clearInterval(timerRef.current);
            } else {
                setTimeRemaining(timeLeft);
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const getTimerColor = () => {
        const totalDuration = new Date(poll.dateEnded) - new Date(poll.dateCreated);
        const percentageRemaining = (timeRemaining / totalDuration) * 100;

        if (percentageRemaining > 60) {
            return "#4CAF50"; // Green
        } else if (percentageRemaining > 20) {
            return "#FFEB3B"; // Yellow
        } else {
            return "#F44336"; // Red
        }
    };

    const handleShareClick = (event) => {
        event.stopPropagation(); // Prevents the poll card click event
        navigate(`/poll-link/${poll.pollId}`);
    };

    const handleGeneratePDF = async () => {
        const input = pollDetailsRef.current;

        // Temporarily hide elements you don't want in the PDF
        const elementsToHide = input.querySelectorAll('.hide-in-pdf, .poll-results, .flip-card-back');
        elementsToHide.forEach(el => el.style.display = 'none');

        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add title, description, date created, and date expired
        pdf.setFontSize(16);
        pdf.setTextColor("#000000");
        pdf.setFillColor("#f0f0f0");
        pdf.rect(5, 5, pageWidth - 10, 20, "F");
        pdf.text(poll.title, pageWidth / 2, 15, { align: "center" });

        pdf.setFontSize(12);
        pdf.setFillColor("#f0f0f0");
        pdf.rect(5, 30, pageWidth - 10, 20, "F");
        pdf.text(`Description: ${poll.description}`, pageWidth / 2, 40, { align: "center" });

        pdf.setFillColor("#f0f0f0");
        pdf.rect(5, 55, pageWidth - 10, 20, "F");
        pdf.text(`Date Created: ${new Date(poll.dateCreated).toLocaleString()}`, pageWidth / 2, 65, { align: "center" });
        pdf.text(`Date Expired: ${new Date(poll.dateEnded).toLocaleString()}`, pageWidth / 2, 75, { align: "center" });

        // Add poll details including the graph
        const maxWidth = 180;
        const maxHeight = 160;
        let imgWidth = canvas.width;
        let imgHeight = canvas.height;

        if (imgWidth > maxWidth || imgHeight > maxHeight) {
            const widthRatio = maxWidth / imgWidth;
            const heightRatio = maxHeight / imgHeight;
            const ratio = Math.min(widthRatio, heightRatio);
            imgWidth *= ratio;
            imgHeight *= ratio;
        }

        pdf.setFillColor("#f0f0f0");
        pdf.rect(5, 80, pageWidth - 10, imgHeight + 10, "F");
        pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 85, imgWidth, imgHeight);

        // Add poll choices as text
        let yPosition = 95 + imgHeight;
        const lineHeight = 10;
        pdf.setFontSize(12);
        pdf.setFillColor("#f0f0f0");
        pdf.rect(5, yPosition, pageWidth - 10, 20, "F");
        poll.choices.forEach((choice, index) => {
            const totalVotes = poll.choices.reduce((sum, c) => sum + c.numVotes, 0);
            const percentage = totalVotes > 0 ? ((choice.numVotes / totalVotes) * 100).toFixed(1) : 0;
            if (yPosition + lineHeight > pageHeight) {
                pdf.addPage();
                yPosition = 10;
            }
            pdf.text(`${index + 1}. ${choice.name} - ${percentage}% (${choice.numVotes} votes)`, pageWidth / 2, yPosition + 10, { align: "center" });
            yPosition += lineHeight;
        });

        pdf.save(`poll-results-${poll.title}.pdf`);

        // Restore the display of hidden elements
        elementsToHide.forEach(el => el.style.display = '');
    };

    const progress = poll
        ? Math.max(0, (timeRemaining / (new Date(poll.dateEnded) - new Date(poll.dateCreated))) * 100)
        : 0;

    const isFlashing = progress <= 5 && timeRemaining > 0;

    if (loading) return <p>Loading poll...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="poll-details-container" ref={pollDetailsRef}>
            <div className="poll-details-card">
                <h2 className="poll-title">{poll.title}</h2>

                {/* Circular Timer */}
                <div className={`timer-container hide-in-pdf ${isFlashing ? "timer-flash" : ""}`}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="timer-background" cx="50" cy="50" r="45" />
                        <circle
                            className="timer-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray="283"
                            strokeDashoffset={`${(progress / 100) * 283}`}
                            style={{ stroke: getTimerColor() }}
                        />
                        <text x="50" y="55" textAnchor="middle" fontSize="18px" fill="white">
                            {formatTime(timeRemaining)}
                        </text>
                    </svg>
                </div>

                {/* Show Results if Poll is Expired or User Voted */}
                {(isPollExpired || userVoted) ? (
                    <>
                        <PollDetailsFlip poll={poll} />
                        <div className="poll-results">
                            {poll.choices && poll.choices.length > 0 ? (
                                poll.choices.map((choice) => {
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
                                })
                            ) : (
                                <p>No choices available.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <p>{poll.description}</p>
                )}

                {/* Render Choices Only If Poll is Active and User Has Not Voted */}
                {!isPollExpired && !userVoted && poll && poll.choices && poll.choices.length > 0 ? (
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
                    <p></p>
                )}

                <div className="bttm-pdf-share">
                    {isPollExpired && (
                        <button className="generate-pdf-button hide-in-pdf" onClick={handleGeneratePDF}>
                            Generate PDF
                        </button>
                    )}

                    {!isPollExpired && poll && poll.userId === userId && (
                        <button className="make-inactive-button" onClick={handleMakeInactive}>
                            Make Poll Inactive
                        </button>
                    )}

                    <FaPaperPlane
                        className="poll-icon-vote"
                        onClick={handleShareClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default PollDetails;