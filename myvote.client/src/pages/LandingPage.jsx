import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LandingPage.css';
import { toast } from 'react-toastify';
import CreatePollButton from '../components/CreatePollButton';
import searchArrow from '../assets/submitUpArrow.svg';
import { FaArrowUpLong } from "react-icons/fa6";




// Separate component for home to use hooks
function Home() {
    const [pollId, setPollId] = useState('');
    const navigate = useNavigate();

    const handleGoClick = () => {
        if (pollId.trim()) {
            navigate(`/poll/${pollId}`);
        } else {
            toast.error("Please enter Poll Code", {
                autoClose: 3000,
                onClick: () => toast.dismiss(),
                
                style: { cursor: "pointer" },
                theme: 'colored'
            }); 
        }
    };

    return (
        <div className="LandingPage">
            {/* <h1>Search for a poll or create one below</h1> */}
            <h1>Welcome!</h1>
            <div className="search-poll">
                
            <div className="header-search">
                <label htmlFor="pollCode" className={pollId ? "floating-label active" : "floating-label"}>
                    Enter Poll Code
                </label>
                <input
                    type="text"
                    id="pollCode"  // Added id to associate with the label
                    value={pollId}
                    onChange={(e) => setPollId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGoClick()}
                />
            </div>
                

                <button className="go-btn" type="button" onClick={handleGoClick}>
                    {/* <img src={searchArrow} alt="Search" width={30} /> */}
                    

                    <FaArrowUpLong className="searchArrow"/>
                </button>
                
            </div>

            <p>or</p>

            <div className="create-poll">
                <CreatePollButton />
            </div>
        </div>
    );
}

export default Home;

