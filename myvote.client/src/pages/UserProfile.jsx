import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PollCard from '../components/PollCard';
import './UserProfile.css';

const UserProfile = () => {
    const { userId } = useUser();
    const [activeTab, setActiveTab] = useState('voted');
    const [votedPolls, setVotedPolls] = useState([]);
    const [ownedPolls, setOwnedPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = window.location.hostname === "localhost"
        ? "https://localhost:7054/api"
        : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

    useEffect(() => {
        const fetchPolls = async () => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
                // Fetch both voted and owned polls simultaneously
                const [votedResponse, ownedResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/polls/voted/${userId}`),
                    fetch(`${API_BASE_URL}/polls/owned/${userId}`)
                ]);

                if (!votedResponse.ok || !ownedResponse.ok) {
                    throw new Error('Failed to fetch polls');
                }

                const [votedData, ownedData] = await Promise.all([
                    votedResponse.json(),
                    ownedResponse.json()
                ]);

                setVotedPolls(votedData);
                setOwnedPolls(ownedData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPolls();
    }, [userId]);

    const displayedPolls = activeTab === 'voted' ? votedPolls : ownedPolls;

    return (
        <div className="user-profile">
            <div className="title-nav">
                <h1 className="headingtext">Your Polls</h1>

                {/* Tabs for selecting "Voted" or "Owned" */}
                <div className="tabs">
                    <button 
                        className={activeTab === 'voted' ? 'active' : ''} 
                        onClick={() => setActiveTab('voted')}
                    >
                        Voted Polls
                    </button>
                    <button 
                        className={activeTab === 'owned' ? 'active' : ''} 
                        onClick={() => setActiveTab('owned')}
                    >
                        Created Polls
                    </button>
                </div>
            </div>

            <div className="poll-list">
                {loading ? (
                    <p>Loading polls...</p>
                ) : error ? (
                    <p className="error">Error: {error}</p>
                ) : displayedPolls.length > 0 ? (
                    displayedPolls.map((poll) => <PollCard key={poll.pollId} poll={poll} />)
                ) : (
                    <p>No polls found.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
