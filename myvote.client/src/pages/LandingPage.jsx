import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './LandingPage.css';
import CreatePollButton from '../components/CreatePollButton';
import Header from '../components/Header';
import CreatePoll from './CreatePoll';
import PollDetails from './PollDetails';
import { useEffect } from 'react';
import UserProfile from './UserProfile';


function LandingPage() {
    const API_BASE_URL = window.location.hostname === "localhost"
        ? "https://localhost:7054/api"
        : "https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api";

    useEffect(() => {
        console.log("Checking cookies:", document.cookie);

        fetch(`${API_BASE_URL}/track`, {
            method: "GET",
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            console.log("User ID:", data.userId);
        })
        .catch(error => console.error("Error tracking user:", error));
    }, []);

    return (
        <Router>
            <div className="main-container">
                <Header />

                <div className="main-content">
                    <Routes>
                        <Route path="/createpoll" element={<CreatePoll />} />
                        <Route path="/" element={
                            <>
                                <h1>MyVote</h1>
                                <div className="polls-container">
                                    <CreatePollButton />
                                </div>
                            </>
                        } />
                        <Route path="/poll/:pollId" element={<PollDetails />} />
                        <Route path="/user/:userId" element={<UserProfile />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default LandingPage;
