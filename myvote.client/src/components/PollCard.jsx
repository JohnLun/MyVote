import React from 'react';
import './PollCard.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

export default function PollCard({poll}) {
  const navigate = useNavigate();
  const handleGoClick = () => {
    if (poll.pollId) {
        navigate(`/poll/${poll.pollId}`);
    }
  };
  return (
    <div className="poll-card"
      onClick={handleGoClick}
    >
      <h2>{poll.title}</h2>
      <p>{poll.description}</p>
      <p>Time Limit: {new Date(poll.timeLimit).toLocaleString()}</p>
      <p>Status: {poll.isActive == "t" ? 'Active' : 'Inactive'}</p>
    </div>
  );
}