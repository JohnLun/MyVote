import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "./PollDetails.css";

const PollDetails = () => {
    const { pollId } = useParams();
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userVoted, setUserVoted] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState(null);
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

                // Check if the user has already voted
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
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPoll();
    }, [pollId, userId]);

    const handleVote = async (choiceId) => {
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

            // Refresh poll data after voting
            const updatedPoll = await fetch(`${API_BASE_URL}/poll/${pollId}`).then(res => res.json());
            setPoll(updatedPoll);

        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <p>Loading poll...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="poll-details-container">
            <div className="poll-details-card">
                <h1 className="poll-title">{poll.title}</h1>
                <p className="poll-desc">{poll.description}</p>
                <p className="poll-limit">Time Remaining: {poll.timeLimit} hours</p>

                {userVoted ? (
                    <div className="poll-results">
                        <h3>Results:</h3>
                        {poll.choices.map((choice) => {
                            const totalVotes = poll.choices.reduce((sum, c) => sum + c.numVotes, 0);
                            const percentage = totalVotes > 0 ? ((choice.numVotes / totalVotes) * 100).toFixed(1) : 0;
                            return (
                                <p key={choice.choiceId} className={choice.choiceId === selectedChoice ? "selected" : ""}>
                                    {choice.name}: {choice.numVotes} votes ({percentage}%)
                                </p>
                            );
                        })}
                    </div>
                ) : (
                    poll.choices.length > 0 ? (
                        poll.choices.map((choice) => (
                            <button
                                key={choice.choiceId}
                                className="poll-choice"
                                onClick={() => handleVote(choice.choiceId)}>
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
