import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../contexts/UserContext";
import PollGraph from "../components/PollGraph";
import PollDetailsFlip from "../components/PollDetailsFlip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from 'react-toastify';
import * as signalR from "@microsoft/signalr";
import "./PollDetails.css";
import { PDFDownloadLink } from '@react-pdf/renderer';
import PollPDF from "../components/PollPDF";
import CheckmarkAnimation from "../components/CheckmarkAnimation";

const PollDetails = () => {
    const { pollId } = useParams();
    const { connection } = useUser();
    const [selectedChoices, setSelectedChoices] = useState([]);
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userVoted, setUserVoted] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isPollExpired, setIsPollExpired] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const { userId } = useUser();
    const navigate = useNavigate();
    const pollDetailsRef = useRef();
    const timerRef = useRef(null);
    const [otherConnection, setConnection] = useState(null);
    const [graphImage, setGraphImage] = useState(null);
    const pollDetailsFlipRef = useRef();
    const [checkmarks, setCheckmarks] = useState([]);
    const [suggestionLimit, setSuggestionLimit] = useState(100);

    const { API_BASE_URL } = useUser();

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/poll/${pollId}`);
                if (!response.ok) {
                    toast.error("Poll Not Found", {
                        autoClose: 3000,
                        onClick: () => toast.dismiss(),
                        theme: "colored",
                        style: { cursor: 'pointer' }
                    })
                    navigate('/');
                }

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
        if (poll && poll.choices) {
            const userVotes = poll.choices
                .filter(choice => choice.userIds.includes(userId)) // Check if user voted for this choice
                .map(choice => choice.choiceId); // Extract choiceId(s)
    
            setSelectedChoices(userVotes); // Set selected choices on load
        }
    }, [poll, userId]);
    
    

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
                newConnection.on("ReceiveVoteUpdate", (updatedPoll) => {
                    setPoll(updatedPoll);
                    const xPosition = 10 + Math.random() * 80;
                    const id = Date.now();
                    setCheckmarks((prevCheckmarks) => [...prevCheckmarks, { id, xPosition }]);
                    setTimeout(() => {
                        setCheckmarks((prevCheckmarks) => prevCheckmarks.filter((checkmark) => checkmark.id !== id));
                    }, 2000);
                });
                
                newConnection.on("RemoveVoteUpdate", (updatedPoll) => {
                    setPoll(updatedPoll);
                })
            })
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => {
            newConnection.stop();
        };
    }, [pollId]);

    useEffect(() => {
        if (connection) {
            connection.on("UpdatedPoll", (updatedPoll) => {
                setPoll(updatedPoll);
            });

            connection.on("EndedPoll", (updatedPoll) => {
                setPoll(updatedPoll);
                setIsPollExpired(true);
                setTimeRemaining(0);
                clearInterval(timerRef.current);
            });
        }

        return () => {
            if (connection) {
                connection.off("UpdatedPoll");
                connection.off("EndedPoll") // Clean up the listener
            }
        };
    }, [connection]);

    useEffect(() => {
        captureGraphImage();
    }, [poll]);

    const handleVote = async (choiceId) => {
        if (isPollExpired) return;
    
        if (!poll.multiSelect) {
            // Single choice poll: if selected, just return
            let choice = poll.choices.filter(c => c.choiceId == choiceId);
            if (choice.length > 0 && choice[0].userIds.includes(userId)) {
                return;
            }
            const previousChoice = poll.choices.find(c => c.userIds.includes(userId));
            if (previousChoice && previousChoice.choiceId !== choiceId) {
                // Only remove the previous vote if it's a different choice
                await removeVote(previousChoice.choiceId);
            }
    
            // Cast new vote
            await submitVote(choiceId);
        } else {
            let choice = poll.choices.filter(c => c.choiceId == choiceId);
            // Multi-select poll: toggle selection
            if (choice.length > 0 && choice[0].userIds.includes(userId)) {
                await removeVote(choiceId);
            } else {
                await submitVote(choiceId);
            }
        }
    };
    
    const removeVote = async (choiceId) => {
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/poll/vote/remove`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, choiceId }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to remove vote");
            }
    
            // Update UI after removal, preserving order by choiceId
            setSelectedChoices((prev) => {
                const updatedChoices = prev.filter((id) => id !== choiceId);
                return updatedChoices; // Sort by choiceId
            });
        } catch (error) {
            console.error("Error removing vote:", error);
        }
    };
    
    const submitVote = async (choiceId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/poll/vote`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, choiceId }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to submit vote");
            }
    
            // Update UI after vote submission
            setSelectedChoices((prev) => {
                if (prev.includes(choiceId)) {
                    // If the choiceId is already selected, remove it
                    return prev.filter(id => id !== choiceId);
                } else {
                    // If the choiceId is not selected, add it
                    return [...prev, choiceId];
                }
            });
    
            setUserVoted(true);
        } catch (error) {
            console.error("Error submitting vote:", error);
        }
    };

    const handleSuggest = async (uId, pId, suggestion, pName) => {
        try {
            const responseBody = {
                userId: uId,
                suggestionName: suggestion,
                pollId: pId,
                pollName: pName
            };

            const response = await fetch(`${API_BASE_URL}/api/suggestion`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(responseBody)
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Vote submission failed.");
            }


        } catch (error) {
            console.log(error.message);
        }
    }

    const handleSubmit = () => {
        if (suggestion.trim() === "") {
            toast.error("Please enter a valid suggestion.", { position: "top-right", theme: "colored" });
            return;
        }

        // Call the function to handle suggestion submission
        handleSuggest(poll.userId, poll.pollId, suggestion, poll.title);

        // Show success toast notification
        toast.success("Your suggestion has been submitted!", {
            position: "top-right",
            autoClose: 3000, // Closes after 3 seconds
            hideProgressBar: false,
            closeOnClick: true,
            theme: "dark",
            pauseOnHover: true,
            draggable: true,
        });

        setIsModalOpen(false);
        setSuggestion("");
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

    const captureGraphImage = async () => {
        if (pollDetailsFlipRef.current && pollDetailsFlipRef.current.captureGraph) {
            const graphImage = await pollDetailsFlipRef.current.captureGraph();

            const img = new Image();
            img.src = graphImage;
            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;

                setGraphImage({ src: graphImage, width: originalWidth, height: originalHeight });
            };
        }
    };


    const handleShareClick = (event) => {
        event.stopPropagation(); // Prevents the poll card click event
        navigate(`/poll-link/${poll.pollId}`);
    };

    const progress = poll
        ? Math.max(0, (timeRemaining / (new Date(poll.dateEnded) - new Date(poll.dateCreated))) * 100)
        : 0;

    const isFlashing = progress <= 5 && timeRemaining > 0;

    if (loading) return <p>Loading poll...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="poll-details-container" ref={pollDetailsRef}>

            <div className="poll-vote-header">
                <div className="poll-title-description">
                    <h2 className="poll-title">{poll.title}</h2>
                    <p className="poll-description">{poll?.description}</p>
                </div>
                <div className={`timer-container hide-in-pdf ${isFlashing ? "timer-flash" : ""}`}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="timer-background" cx="50" cy="50" r="45" />
                        <circle
                            className="timer-progress"
                            cx="50" cy="50" r="45"
                            strokeDasharray="283"
                            strokeDashoffset={`${(progress / 100) * 283}`}
                            style={{ stroke: getTimerColor() }}
                        />
                        <text x="50" y="55" textAnchor="middle" fontSize="18px" fill="white">
                            {formatTime(timeRemaining)}
                        </text>
                    </svg>
                </div>
            </div>

            <div className="poll-details-card">
                
                
                {/* Poll Results and Graph Card */}
                <div className="poll-results-card">
                    <h3>Results</h3>
                    
                    <div className="poll-graph">
                        <PollGraph poll={poll} />
                    </div>

                    <div className="poll-results">
                        {poll.choices?.length > 0 ? (
                            poll.choices.map((choice) => {
                                const totalVotes = poll.choices.reduce((sum, c) => sum + c.numVotes, 0);
                                const percentage = totalVotes > 0 ? ((choice.numVotes / totalVotes) * 100).toFixed(1) : 0;
                                return (
                                    <div key={choice.choiceId} className="result-container">
                                        <div className="result-bar" style={{ width: `${percentage}%` }}></div>
                                        <p>{choice.name} - {percentage}% ({choice.numVotes} votes)</p>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No choices available.</p>
                        )}
                    </div>
                </div>
                
                {/* Vote Choices */}
                {!isPollExpired && poll.choices?.length > 0 && (
                    <div className="vote-choices">
                        <p className="selection-info">{poll.multiSelect ? "Select multiple choices" : "Select one choice"}</p>
                        {poll.choices.sort((a, b) => a.choiceId - b.choiceId).map((choice) => (
                            <button
                                key={choice.choiceId}
                                className={`poll-choice ${choice.userIds.includes(userId) ? "selected" : ""}`}
                                onClick={() => handleVote(choice.choiceId)}
                            >
                                {choice.name}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Suggest, End Poll, and Share Buttons */}
                <div className="bttm-pdf-share">
                    {!isPollExpired && (
                        <button className="blue-button" onClick={() => setIsModalOpen(true)}>
                            Suggest <FaPen className="poll-icon-suggest" />
                        </button>
                    )}
                    {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3 className="modal-title">Suggest an Edit</h3>

                            <input
                                type="text"
                                value={suggestion}
                                onChange={(e) => {
                                    setSuggestion(e.target.value);
                                    setSuggestionLimit(100 - e.target.value.length);
                                }}
                                placeholder="Enter your suggestion"
                                maxLength={100}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault(); // Prevents new line if input is a textarea
                                        handleSubmit();
                                        setSuggestionLimit(100);
                                    }
                                }}
                                autoFocus
                            />

                            <div className="suggest-limit">{suggestionLimit}</div>

                            <div className="modal-button">
                                <button
                                    className="blue-button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSuggestion("");
                                        setSuggestionLimit(100);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="blue-button"
                                    onClick={() => {
                                        if (isPollExpired) {
                                            setIsModalOpen(false);
                                            toast.error("Poll no longer active", {
                                                autoClose: 3000,
                                                onClick: () => {
                                                    toast.dismiss();
                                                },
                                                style: { cursor: "pointer" },
                                            })
                                        } else {
                                            handleSubmit();
                                            setSuggestionLimit(100);
                                        }
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                    {isPollExpired && (
                        <PDFDownloadLink document={<PollPDF poll={poll} graphImage={graphImage} />} fileName={`poll-results-${poll.title}.pdf`}>
                            {({ loading }) => (
                                <button className="generate-pdf-button">
                                    {loading ? "Loading PDF..." : "Download PDF"}
                                </button>
                            )}
                        </PDFDownloadLink>
                    )}
                    {!isPollExpired && poll.userId === userId && (
                        <button className="make-inactive-button" onClick={handleMakeInactive}>End Poll</button>
                    )}
                    <FaPaperPlane className="poll-icon-vote" onClick={handleShareClick} />
                </div>
            </div>
        </div>
    );
};

export default PollDetails;

