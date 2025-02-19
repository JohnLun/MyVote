import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PollCard from '../components/PollCard';
import './UserProfile.css';
import filterIcon from '../assets/filter.svg'; // Renamed for clarity

const UserProfile = () => {
    const { userId } = useUser();
    const [activeTab, setActiveTab] = useState('voted');
    const [pollFilter, setPollFilter] = useState('all'); 
    const [votedPolls, setVotedPolls] = useState([]);
    const [ownedPolls, setOwnedPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilter, setShowFilter] = useState(false); // State to control dropdown visibility

    const API_BASE_URL = window.location.hostname === "localhost"
        ? "https://localhost:7054/api"
        : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

    useEffect(() => {
        const fetchPolls = async () => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
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

    // Function to filter polls based on status
    const getFilteredPolls = () => {
        const polls = activeTab === 'voted' ? votedPolls : ownedPolls;

        return polls.filter(poll => {
            if (pollFilter === 'active') return poll.isActive === "t";
            if (pollFilter === 'inactive') return poll.isActive === "f";
            return true; 
        });
    };

    return (
        <div className="user-profile">
            <div className="title-nav">
                <h1 className="headingtext">Your Polls</h1>

                {/* <div className="nav-tabs-status"> */}
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

                    {/* Filter icon */}
                    <div className="filter-icon" onClick={() => setShowFilter(!showFilter)}>
                        <img src={filterIcon} alt="Filter" />
                    </div>

                    {/* Conditionally render the dropdown */}
                    {showFilter && (
                        <div className="poll-status">
                            <button 
                                className={`poll-status-btn ${pollFilter === 'all' ? 'active' : ''}`} 
                                onClick={() => setPollFilter('all')}
                            >
                                All Polls
                            </button>

                            <button 
                                className={`poll-status-btn ${pollFilter === 'active' ? 'active' : ''}`} 
                                onClick={() => setPollFilter('active')}
                            >
                                Active
                            </button>

                            <button 
                                className={`poll-status-btn ${pollFilter === 'inactive' ? 'active' : ''}`} 
                                onClick={() => setPollFilter('inactive')}
                            >
                                Inactive
                            </button>
                        </div>
                    )}
                {/* </div> */}
            </div>

            <div className="poll-list">
                

                {loading ? (
                    <p>Finding your polls...</p>
                ) : error ? (
                    <p className="error">Error: {error}</p>
                ) : getFilteredPolls().length > 0 ? (
                    getFilteredPolls().map((poll) => <PollCard key={poll.pollId} poll={poll} />)
                ) : (
                    <p>No polls found.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
