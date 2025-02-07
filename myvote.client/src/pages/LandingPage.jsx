import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LandingPage.css';
import CreatePollButton from '../components/CreatePollButton';

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
            <div className="search-poll">
                <h1>MyVote</h1>
                <div className="header-search">
                    <label className={pollId ? "floating-label active" : "floating-label"}>
                        Enter Poll ID
                    </label>
                    <input
                        type="text"
                        
                        value={pollId}
                        onChange={(e) => setPollId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGoClick()}
                    />
                </div>
                

                <button className="go-btn" type="button" onClick={handleGoClick}>
                    GO
                </button>
                
            </div>

            <div className="create-poll">
                <CreatePollButton />
            </div>
        </>
    );
}

export default Home;

