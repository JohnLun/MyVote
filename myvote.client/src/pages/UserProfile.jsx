import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PollCard from '../components/PollCard';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import './UserProfile.css';

const UserProfile = () => {
    const { userId } = useUser();
    const [activeTab, setActiveTab] = useState('voted');
    const [pollFilter, setPollFilter] = useState('all');
    const [votedPolls, setVotedPolls] = useState([]);
    const [ownedPolls, setOwnedPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { API_BASE_URL } = useUser();

    useEffect(() => {
        const fetchPolls = async () => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
                const [votedResponse, ownedResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/polls/voted/${userId}`),
                    fetch(`${API_BASE_URL}/api/polls/owned/${userId}`)
                ]);

                if (!votedResponse.ok || !ownedResponse.ok) {
                    throw new Error('Failed to fetch polls');
                }

                const [votedData, ownedData] = await Promise.all([
                    votedResponse.json(),
                    ownedResponse.json()
                ]);

                setVotedPolls([...votedData].sort((a, b) => (b.isActive === "t" ? 1 : 0) - (a.isActive === "t" ? 1 : 0)));
                setOwnedPolls([...ownedData].sort((a, b) => (b.isActive === "t" ? 1 : 0) - (a.isActive === "t" ? 1 : 0)));


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

    const handlePollDelete = (pollId) => {
        if (activeTab === 'voted') {
            setVotedPolls(prevPolls => prevPolls.filter(poll => poll.pollId !== pollId));
        } else {
            setOwnedPolls(prevPolls => prevPolls.filter(poll => poll.pollId !== pollId));
            setVotedPolls(prevPolls => prevPolls.filter(poll => poll.pollId !== pollId));
        }
    };

    return (
        <div className="user-profile">
            
            <div className="title-nav">
                <div className="heading-div">
                    <h2 className="headingtext">Your Polls</h2>

                </div>
                
                <div className="button-div">
                    
                    {/* Material UI Toggle Buttons for tabs */}
                    <ToggleButtonGroup
                        sx={{
                            marginBottom: "10px",
                            "& .MuiToggleButton-root": {
                            color: "white",
                            fontSize: "12px",
                            backgroundColor: "#37383e",
                            minWidth: "75px",
                            "&.Mui-selected": {
                                backgroundColor: "#365FB7",
                                color: "white",
                            },
                            },
                        }}
                        color="primary"
                        value={activeTab}
                        exclusive
                        onChange={(event, newTab) => {
                            if (newTab !== null) setActiveTab(newTab);
                        }}
                        aria-label="Poll tabs"
                        >
                        <ToggleButton value="voted">Voted</ToggleButton>
                        <ToggleButton value="owned">Created</ToggleButton>
                    </ToggleButtonGroup>


                    {/* Material UI Select for filtering */}
                    <FormControl
                        sx={{
                            minWidth: 150,
                            "& .MuiInputLabel-root": {
                            color: "white", // Label color
                            },
                            "& .MuiOutlinedInput-root": {
                            color: "white", // Text color
                            fontSize: "15px",
                            "& fieldset": {
                                borderColor: "white", // Border color
                            },
                            "&:hover fieldset": {
                                borderColor: "white", // Hover border color
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "white", // Focus border color
                            },
                            "& .MuiSvgIcon-root": {
                                color: "white", // Dropdown arrow color
                            },
                            },
                        }}
                        >
                        <InputLabel id="poll-filter-label">Filter</InputLabel>
                        <Select
                            labelId="poll-filter-label"
                            id="poll-filter"
                            value={pollFilter}
                            onChange={(event) => setPollFilter(event.target.value)}
                            label="Filter"
                        >
                            <MenuItem value="all">All Polls</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                </div>
            </div>

            <div className="poll-list">
                {loading ? (
                    <p>Finding your polls...</p>
                ) : error ? (
                    <p className="error">Error: {error}</p>
                ) : getFilteredPolls().length > 0 ? (
                    getFilteredPolls().map((poll) => <PollCard key={poll.pollId} poll={poll} onDelete={handlePollDelete} activeTab={activeTab}/>)
                ) : (
                    <p>No polls found.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
