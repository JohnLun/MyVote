import React, { useEffect, useState } from 'react';
import PollCard from '../components/PollCard';
import './UserProfile.css';

const UserProfile = () => {
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        // Uncomment the following code when the API endpoint is available
        /*
        const fetchPolls = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/polls/user/2`); // Replace with actual user ID
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPolls(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error.message);
            }
        };

        fetchPolls();
        */

        // Dummy polls for now
        const dummyPolls = [
            {
                id: 1,
                title: 'Poll 1',
                description: 'Description for Poll 1',
                timeLimit: new Date().toISOString(),
                isActive: true,
                choices: [
                    { choiceId: 1, name: 'Choice 1', numVotes: 10 },
                    { choiceId: 2, name: 'Choice 2', numVotes: 5 }
                ]
            },
            {
                id: 2,
                title: 'Poll 2',
                description: 'Description for Poll 2',
                timeLimit: new Date().toISOString(),
                isActive: false,
                choices: [
                    { choiceId: 3, name: 'Choice 3', numVotes: 7 },
                    { choiceId: 4, name: 'Choice 4', numVotes: 3 }
                ]
            }
        ];
        setPolls(dummyPolls);
    }, []);

    return (
        <div className="user-profile">
            <h2 className="headingtext">Your Polls</h2>
            <div className="poll-list">
                {polls.map(poll => (
                    <PollCard poll={poll} />
                ))}
            </div>
        </div>
    );
};

export default UserProfile;