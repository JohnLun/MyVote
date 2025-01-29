import { useEffect, useState } from 'react';
import './App.css';
import PollCard from './components/PollCard';

function App() {
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
            const response = await fetch('https://localhost:7054/api/polls');
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