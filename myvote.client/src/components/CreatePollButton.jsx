import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePollButton.css';

const CreatePollButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/createpoll');
    };

    return (
        <button className="create-poll-button" onClick={handleClick}>
            Create Poll
        </button>
    );
};

export default CreatePollButton;