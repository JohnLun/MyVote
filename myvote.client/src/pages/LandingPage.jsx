import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LandingPage.css';
import CreatePollButton from '../components/CreatePollButton';
import searchArrow from '../assets/searchArrowNew.svg';

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
            {/* <h1>Search for a poll below</h1> */}
            <div className="search-poll">
                
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
                    <img src={searchArrow} alt="Search" width={25} />
                </button>
                
            </div>

            <div className="create-poll">
                <CreatePollButton />
            </div>
        </>
    );
}

export default Home;

