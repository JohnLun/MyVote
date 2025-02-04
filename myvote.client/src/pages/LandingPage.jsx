import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LandingPage.css';
import CreatePollButton from '../components/CreatePollButton';
import Header from '../components/Header';
import CreatePoll from './CreatePoll';
import PollDetails from './PollDetails';
import { useEffect } from 'react';
import UserProfile from './UserProfile';

function LandingPage() {
    return (
        <Router>
            <div className="main-container">
                <Header />

                <div className="main-content">
                    <Routes>
                        <Route path="/createpoll" element={<CreatePoll />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/poll/:pollId" element={<PollDetails />} />
                        <Route path="/user/:userId" element={<UserProfile />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

// Separate component for home to use hooks
function Home() {
    const [pollId, setPollId] = useState('');
    const navigate = useNavigate();

    const handleGoClick = () => {
        if (pollId.trim()) {
            navigate(`/poll/${pollId}`);
        }
    };

    return (
        <>
            <h1>MyVote</h1>
            <h3>Enter a Poll ID</h3>

            <div className="header-search">
                <input
                    type="text"
                    placeholder="Enter poll ID"
                    value={pollId}
                    onChange={(e) => setPollId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGoClick()}
                />
            </div>

            <button type="button" onClick={handleGoClick}>
                GO
            </button>

            <div className="polls-container">
                <CreatePollButton />
            </div>
        </>
    );
}

export default LandingPage;

