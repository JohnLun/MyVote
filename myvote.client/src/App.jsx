import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PollCard from './components/PollCard';
import CreatePollButton from './components/CreatePollButton';
import Header from './components/Header';
import CreatePoll from './pages/CreatePoll';

function App() {
    const API_BASE_URL =
        window.location.hostname === 'localhost'
            ? 'https://localhost:7054/api'
            : 'https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api';

    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolls();
    }, []);

    const contents = loading
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started.</em></p>
        : polls.map(poll => <PollCard key={poll.pollId} poll={poll} />);

    return (
        <Router>
            <div className="main-container">
                <Header />
                <div className="spacer"></div>
              
                <div className="main-content">
                    <Routes>
                        <Route path="/createpoll" element={<CreatePoll />} />
                        <Route path="/" element={
                            <>
                                <h1>MyVote</h1>
                                <div className="polls-container">
                                    {contents}
                                    <CreatePollButton />
                                </div>
                            </>
                        } />
                    </Routes>
                </div>
            </div>
        </Router>
    );

    async function fetchPolls() {
        try {
            const response = await fetch(`${API_BASE_URL}/polls`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPolls(data);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error.message);
        } finally {
            setLoading(false);
        }
    }
}

export default App;