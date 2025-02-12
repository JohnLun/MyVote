import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import PollDetailsFlip from "../components/PollDetailsFlip";
import "./PollDetails.css";

const PollDetails = () => {
    const { pollId } = useParams();
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userVoted, setUserVoted] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [isPollExpired, setIsPollExpired] = useState(false);
    const { userId } = useUser();

    const API_BASE_URL =
        window.location.hostname === "localhost"
            ? "https://localhost:7054/api"
            : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/poll/${pollId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch poll data. Status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data);

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
                setPoll(data);

                // Initialize the countdown
                startCountdown(data.dateEnded);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPoll();
    }, [pollId, userId]);

    const startCountdown = (pollEndTime) => {
        if (!pollEndTime) return;
    
        let timerInterval; // Define timerInterval before using it
    
        const updateTimer = () => {
            const currentTime = new Date(); 
            const endTime = new Date(pollEndTime); 
            const timeDiff = endTime - currentTime; 
    
            if (timeDiff <= 0) {
                setTimeRemaining("00:00");
                setIsPollExpired(true);
                clearInterval(timerInterval); // Clear interval properly
                return;
            }
    
            const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            const seconds = Math.floor((timeDiff / 1000) % 60);
    
            setTimeRemaining(
                `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };
    
        updateTimer(); // Run immediately
        timerInterval = setInterval(updateTimer, 1000);
    
        return () => clearInterval(timerInterval); // Ensure cleanup on unmount
    };
    

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
            startCountdown(updatedPoll.pollEndTime);

        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <p>Loading poll...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="poll-details-container">
            <div className="poll-details-card">
                <h2 className="poll-title">{poll.title}</h2>
                <p className="poll-limit">Time Remaining: {timeRemaining}</p>

                {isPollExpired || userVoted ? (
                    <PollDetailsFlip poll={poll} />
                ) : (
                    <p>{poll.description}</p>
                )}

                {isPollExpired || userVoted ? (
                    <div className="poll-results">
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
                                disabled={isPollExpired} // Disable voting if expired
                            >
                                {choice.name}
                            </button>
                        ))
                    ) : (
                        <p>No choices available.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default PollDetails;
