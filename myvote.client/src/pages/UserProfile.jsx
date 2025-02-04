import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PollCard from '../components/PollCard';
import './UserProfile.css';

const UserProfile = () => {
    const { userId } = useUser();
    const [polls, setPolls] = useState([]); // State to store polls

    const API_BASE_URL = window.location.hostname === "localhost"
        ? "https://localhost:7054/api"
        : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/polls/${userId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("Fetched Polls:", data);
                setPolls(data); // Store polls in state
            } catch (error) {
                console.error('Error fetching polls:', error.message);
            }
        };

        if (userId) {
            fetchPolls();
        }
    }, [userId]); // Fetch when userId is available

    return (
        <div className="user-profile">
            <h2 className="headingtext">Your Polls</h2>
            <div className="poll-list">
                {polls.length > 0 ? (
                    polls.map((poll) => (
                        <PollCard key={poll.pollId} poll={poll} /> // Use poll.id as the key
                    ))
                ) : (
                    <p>No polls found.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
