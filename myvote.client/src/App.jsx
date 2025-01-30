import { useEffect, useState } from 'react';
import './App.css';
import PollCard from './components/PollCard';

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
        <div>
            <h1>MyVote</h1>
            {contents}
        </div>
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
            console.error('There was a problem with the fetch operation:', error);
        } finally {
            setLoading(false);
        }
    }
}

export default App;