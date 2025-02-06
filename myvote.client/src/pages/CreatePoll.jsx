import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './CreatePoll.css';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';

const CreatePoll = () => {
    const API_BASE_URL =
        window.location.hostname === 'localhost'
            ? 'https://localhost:7054/api'
            : 'https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [choices, setChoices] = useState(['', '']);
    const [errors, setErrors] = useState({});

    const { userId } = useUser();
    const navigate = useNavigate();

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

    const removeChoice = (index) => {
        const newChoices = choices.filter((_, i) => i !== index);
        setChoices(newChoices);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!timeLimit || parseFloat(timeLimit) <= 0) {
            newErrors.timeLimit = 'Time limit must be a positive number';
        }
        const nonEmptyChoices = choices.filter(choice => choice.trim());
        if (nonEmptyChoices.length < 2) {
            newErrors.choices = 'At least two non-empty choices are required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const currentTime = new Date();
        const pollEndTime = new Date(currentTime.getTime() + parseFloat(timeLimit) * 60 * 60 * 1000);
        const isActive = pollEndTime > currentTime;

        const newPollDto = {
            userId: userId,
            title: title,
            description: description,
            timeLimit: parseFloat(timeLimit),
            isActive: isActive ? "t" : "f",
            choices: choices.map(choice => ({ Name: choice, NumVotes: 0 }))
        };
        console.log(newPollDto);

        try {
            const response = await fetch(`${API_BASE_URL}/poll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPollDto)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Poll created:', data);

            // Navigate to PollLinkPage with the new poll ID
            navigate(`/poll-link/${data.pollId}`);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error.message);
        }
    };

    return (
        <div className="create-poll-container">
            <div className="create-poll-card">
                <h1>Create a Poll</h1>
                <form onSubmit={handleSubmit}>
                    <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
                        <label>Title:</label>
                        <br></br>
                        <input type="text" value={title} onChange={handleTitleChange} />
                        {errors.title && <p className="error-message">{errors.title}</p>}
                    </div>
                    <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                        <label>Description:</label>
                        <br></br>
                        <textarea value={description} onChange={handleDescriptionChange} />
                        {errors.description && <p className="error-message">{errors.description}</p>}
                    </div>
                    <div className={`form-group ${errors.timeLimit ? 'has-error' : ''}`}>
                        <label>Time Limit (in hours):</label>
                        <br></br>
                        <input
                            type="number"
                            min="0"
                            value={timeLimit}
                            onChange={handleTimeLimitChange}
                            onKeyDown={handleTimeLimitKeyDown}
                        />
                        {errors.timeLimit && <p className="error-message">{errors.timeLimit}</p>}
                    </div>
                    <div className={`form-group ${errors.choices ? 'has-error' : ''}`}>
                        <label>Choices:</label>
                        {choices.map((choice, index) => (
                            <div key={index} className="choice-container">
                                <input
                                    type="text"
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(index, e)}
                                />
                                {index >= 2 ? (
                                    <FaRegTrashAlt
                                        onClick={() => removeChoice(index)}
                                        className="trash-icon"
                                    />
                                ) : (
                                    <div className="placeholder-icon"></div> // Keeps alignment
                                )}
                            </div>
                        ))}
                        {errors.choices && <p className="error-message">{errors.choices}</p>}
                    </div>
                    <div className="add-container">
                        <button type="button" className="add-choice-button" onClick={addChoice}>
                            <FaPlus className="plus-icon" />
                            Add Choice
                        </button>
                    </div>
                    <div className="button-container">
                        <button type="submit">Create Poll</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePoll;
