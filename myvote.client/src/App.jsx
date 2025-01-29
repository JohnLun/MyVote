import { useEffect, useState } from 'react';
import './App.css';
import PollCard from './components/PollCard';

function App() {
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        fetchPolls();
    }, []);

    const contents = polls.length === 0
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started.</em></p>
        : polls.map(poll => <PollCard key={poll.pollId} poll={poll} />);

    return (
        <div>
            <h1>MyVote</h1>
            {contents}
        </div>
    );

    async function fetchPolls() {
        const dummyPolls = [
            {
                pollId: 1,
                title: "Favorite Programming Language",
                description: "Vote for your favorite programming language.",
                timeLimit: new Date().toISOString(),
                isActive: true,
                choices: [
                    { choiceId: 1, name: "JavaScript", numVotes: 10 },
                    { choiceId: 2, name: "Python", numVotes: 15 },
                    { choiceId: 3, name: "Java", numVotes: 5 }
                ],
                userId: 1,
                user: { userId: 1, userName: "admin" },
                userPolls: []
            },
            {
                pollId: 2,
                title: "Best Frontend Framework",
                description: "Vote for the best frontend framework.",
                timeLimit: new Date().toISOString(),
                isActive: true,
                choices: [
                    { choiceId: 1, name: "React", numVotes: 20 },
                    { choiceId: 2, name: "Vue", numVotes: 10 },
                    { choiceId: 3, name: "Angular", numVotes: 5 }
                ],
                userId: 1,
                user: { userId: 1, userName: "admin" },
                userPolls: []
            }
        ];

        setPolls(dummyPolls);
    }
}

export default App;