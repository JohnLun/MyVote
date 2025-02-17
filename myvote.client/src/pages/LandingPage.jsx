import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LandingPage.css';
import { toast } from 'react-toastify';
import CreatePollButton from '../components/CreatePollButton';
import searchArrow from '../assets/submitUpArrow.svg';

// Separate component for home to use hooks
function Home() {
    const [pollId, setPollId] = useState('');
    const navigate = useNavigate();

    const handleGoClick = () => {
        if (pollId.trim()) {
            navigate(`/poll/${pollId}`);
        } else {
            toast.error("Please enter Poll Code", {autoClose: 3000}); 
        }
    };

    return (
        <>
            {/* <h1>Search for a poll or create one below</h1> */}
            <div className="search-poll">
                
                <div className="header-search">
                    <label className={pollId ? "floating-label active" : "floating-label"}>
                        Enter Poll Code
                    </label>
                    <input
                        type="text"
                        
                        value={pollId}
                        onChange={(e) => setPollId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGoClick()}
                    />
                </div>
                

                <button className="go-btn" type="button" onClick={handleGoClick}>
                    <img src={searchArrow} alt="Search" width={30} />
                </button>
                
            </div>

            <div className="create-poll">
                <CreatePollButton />
            </div>
        </>
    );
}

export default Home;

