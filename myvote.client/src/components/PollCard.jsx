import React from 'react';
import './PollCard.css';

export default function PollCard({ poll }) {
  return (
    <div className="poll-card">
      <h2>{poll.title}</h2>
      <p>{poll.description}</p>
      <p>Time Limit: {new Date(poll.timeLimit).toLocaleString()}</p>
      <p>Status: {poll.isActive ? 'Active' : 'Inactive'}</p>
      <h3>Choices:</h3>
      <ul>
        {poll.choices.map(choice => (
          <li key={choice.choiceId}>{choice.name} - Votes: {choice.numVotes}</li>
        ))}
      </ul>
    </div>
  );
}