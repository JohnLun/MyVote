import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PollLinkPage.css';

const PollLinkPage = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();

    const handleGoToPoll = () => {
        navigate(`/poll/${pollId}`);
    };

    const handleCopyLink = () => {
        const pollUrl = `${window.location.origin}/poll/${pollId}`;
        navigator.clipboard.writeText(pollUrl)
            .then(() => {
                alert('Poll link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="poll-link-page">
            <h2>Poll Created Successfully!</h2>
            <p>Your poll ID is: {pollId}</p>
            <button onClick={handleGoToPoll}>Go to Poll</button>
            <button onClick={handleCopyLink}>Copy Poll Link</button>
        </div>
    );
};

export default PollLinkPage;