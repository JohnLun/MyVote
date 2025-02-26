import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../contexts/UserContext";
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

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net";

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/poll/${pollId}`);
                if (!response.ok) {
                    toast.error("Poll Not Found", {
                        autoClose: 3000,
                        onClick: () => toast.dismiss(),
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
                    const xPosition = 10 + Math.random() * 80; // Set random x position within 10% to 90%
                    const id = Date.now(); // Use timestamp as unique ID
                    setCheckmarks((prevCheckmarks) => [...prevCheckmarks, { id, xPosition }]);
                    setTimeout(() => {
                        setCheckmarks((prevCheckmarks) => prevCheckmarks.filter((checkmark) => checkmark.id !== id));
                    }, 2000); // Hide checkmark after 2 seconds
                });

                console.log("Listener added");
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
        }

        return () => {
            if (connection) {
                connection.off("UpdatedPoll"); // Clean up the listener
            }
        };
    }, [connection]);

    useEffect(() => {
        captureGraphImage();
    }, [poll]);

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
            toast.error("Please enter a valid suggestion.", { position: "top-right" });
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
                        <PollDetailsFlip ref={pollDetailsFlipRef} poll={poll} />
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
                    <p className="poll-description">{poll.description}</p>
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
                {!isPollExpired &&
                    <>
                        <button
                            onClick={() => setIsModalOpen(true)}
                        >
                            Suggest <FaPen className="poll-icon-suggest" />
                        </button>
                    </>
                }
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
                            />
                            <div>{suggestionLimit}</div>
                            <div className="modal-buttons">
                                <button
                                    onClick={() => {
                                        handleSubmit();
                                        setSuggestionLimit(100);
                                    }}
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSuggestion("");
                                        setSuggestionLimit(100);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                )}

                <div className="bttm-pdf-share">
                    {isPollExpired && (
                        <PDFDownloadLink
                            document={<PollPDF poll={poll} graphImage={graphImage} />}
                            fileName={`poll-results-${poll.title}.pdf`}
                        >
                            {({ loading }) => (
                                <button className="generate-pdf-button">
                                    {loading ? "Loading PDF..." : "Download PDF"}
                                </button>
                            )}
                        </PDFDownloadLink>
                    )}


                    {!isPollExpired && poll && poll.userId === userId && (
                        <button className="make-inactive-button" onClick={handleMakeInactive}>
                            End Poll
                        </button>
                    )}

                    <FaPaperPlane
                        className="poll-icon-vote"
                        onClick={handleShareClick}
                    />
                </div>
            </div>
            {checkmarks.map((checkmark) => (
                <CheckmarkAnimation key={checkmark.id} xPosition={checkmark.xPosition} />
            ))}
        </div>
    );
};

export default PollDetails;

