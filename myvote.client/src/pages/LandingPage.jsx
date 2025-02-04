import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './LandingPage.css';
import CreatePollButton from '../components/CreatePollButton';
import Header from '../components/Header';
import CreatePoll from './CreatePoll';
import PollDetails from './PollDetails';
import UserProfile from './UserProfile';

function LandingPage() {

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