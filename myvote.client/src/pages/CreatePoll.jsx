import React, { useState } from 'react';
import './CreatePoll.css';

const CreatePoll = () => {
    const API_BASE_URL =
        window.location.hostname === 'localhost'
            ? 'https://localhost:7054/api'
            : 'https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [choices, setChoices] = useState(['', '']);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleTimeLimitChange = (e) => {
        setTimeLimit(e.target.value);
    };

    const handleTimeLimitKeyDown = (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    };

    const handleChoiceChange = (index, e) => {
        const newChoices = [...choices];
        newChoices[index] = e.target.value;
        setChoices(newChoices);
    };

    const addChoice = () => {
        setChoices([...choices, '']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        /*const poll = {
            title,
            description,
            timeLimit: parseFloat(timeLimit),
            choices: choices.map(choice => ({ name: choice }))
        };

        try {
            const response = await fetch(`${API_BASE_URL}/poll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(poll)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Poll created:', data);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error.message);
        }*/
    };

    return (
        <div className="create-poll-container">
            <div className="create-poll-card">
                <h1>Create a Poll</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Title:</label>
                        <br></br>
                        <input type="text" value={title} onChange={handleTitleChange} />
                    </div>
                    <div>
                        <label>Description:</label>
                        <br></br>
                        <textarea value={description} onChange={handleDescriptionChange} />
                    </div>
                    <div>
                        <label>Time Limit (in hours):</label>
                        <br></br>
                        <input
                            type="number"
                            min="0"
                            value={timeLimit}
                            onChange={handleTimeLimitChange}
                            onKeyDown={handleTimeLimitKeyDown}
                        />
                    </div>
                    <div>
                        <label>Choices:</label>
                        <br></br>
                        {choices.map((choice, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(index, e)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="button-container">
                        <button type="button" className="add-choice-button" onClick={addChoice}>Add Choice</button>
                        <button type="submit">Create Poll</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePoll;