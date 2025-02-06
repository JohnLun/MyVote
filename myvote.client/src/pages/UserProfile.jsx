import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PollCard from '../components/PollCard';
import './UserProfile.css';

const UserProfile = () => {
    const { userId } = useUser();
    const [activeTab, setActiveTab] = useState('voted');
    const [polls, setPolls] = useState([]);
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
            
            const endpoint = activeTab === 'voted' ? 'polls/voted' : 'polls/owned';

            try {
                const response = await fetch(`${API_BASE_URL}/${endpoint}/${userId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch polls (${response.status})`);
                }
                const data = await response.json();
                setPolls(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPolls();
    }, [userId, activeTab]);

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
                        Owned Polls
                    </button>
                </div>
            </div>

            <div className="poll-list">
                {loading ? (
                    <p>Loading polls...</p>
                ) : error ? (
                    <p className="error">Error: {error}</p>
                ) : polls.length > 0 ? (
                    polls.map((poll) => <PollCard key={poll.pollId} poll={poll} />)
                ) : (
                    <p>No polls found.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
