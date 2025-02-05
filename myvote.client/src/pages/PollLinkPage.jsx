import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PollLinkPage = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();

    const handleGoToPoll = () => {
        navigate(`/poll/${pollId}`);
    };

    return (
        <div className="poll-link-page">
            <h2>Poll Created Successfully!</h2>
            <p>Your poll ID is: {pollId}</p>
            <button onClick={handleGoToPoll}>Go to Poll</button>
        </div>
    );
};

export default PollLinkPage;