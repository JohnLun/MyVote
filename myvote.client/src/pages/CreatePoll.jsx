import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CreatePoll.css';
import UseAnimations from 'react-useanimations';
import trash2 from 'react-useanimations/lib/trash2';
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const CreatePoll = () => {
    const { API_BASE_URL } = useUser();

    const TITLE_LIMIT = 100;
    const DESCRIPTION_LIMIT = 500;
    const CHOICE_LIMIT = 100;

    const [multiSelect, setMultiSelect] = useState(false);
    const [pollType, setPollType] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [choices, setChoices] = useState(['', '']);
    const [errors, setErrors] = useState({});
    const [remainingChars, setRemainingChars] = useState({
        title: TITLE_LIMIT,
        description: DESCRIPTION_LIMIT,
        choices: choices.map(() => CHOICE_LIMIT)
    });

    const { userId } = useUser();
    const navigate = useNavigate();

    const handlePollTypeChange = (e) => {
        const value = e.target.value;
        setPollType(Number(value));
    }

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
        setRemainingChars((prev) => ({ ...prev, title: TITLE_LIMIT - value.length }));
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        setRemainingChars((prev) => ({ ...prev, description: DESCRIPTION_LIMIT - value.length }));
    };

    const handleTimeLimitChange = (e) => setTimeLimit(e.target.value);
    const handleTimeLimitKeyDown = (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    };

    const handleChoiceChange = (index, e) => {
        const value = e.target.value;
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);

        const newRemainingChars = [...remainingChars.choices];
        newRemainingChars[index] = CHOICE_LIMIT - value.length;
        setRemainingChars((prev) => ({ ...prev, choices: newRemainingChars }));
    };

    const addChoice = () => {
        setChoices([...choices, '']);
        setRemainingChars((prev) => ({ ...prev, choices: [...prev.choices, CHOICE_LIMIT] }));
    };

    const handleToggleMultiSelect = () => {
        setMultiSelect(!multiSelect);
    }

    const removeChoice = (index) => {
        setChoices(choices.filter((_, i) => i !== index));
        setRemainingChars((prev) => ({
            ...prev,
            choices: prev.choices.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        let showErrorToast = false;

        if (!title.trim()) {
            newErrors.title = true;
            showErrorToast = true;
        }
        if (!description.trim()) {
            newErrors.description = true;
            showErrorToast = true;
        }
        if (!timeLimit || parseFloat(timeLimit) <= 0) {
            newErrors.timeLimit = true;
            toast.error('Time limit must be a positive number');
        }
        const nonEmptyChoices = choices.filter(choice => choice.trim());
        if (nonEmptyChoices.length < 2) {
            newErrors.choices = true;
            toast.error('There must be at least two non-empty choices');
        }

        setErrors(newErrors);

        if (showErrorToast) {
            toast.error('Please fill in all required fields' );
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (pollType == 2) {
            setChoices([])
        }

        const currentTimeUTC = new Date(Date.now());
        const pollEndTime = new Date(currentTimeUTC.getTime() + parseFloat(timeLimit) * 60 * 1000);
        const newPollDto = {
            userId: userId,
            title: title,
            description: description,
            timeLimit: parseFloat(timeLimit),
            dateCreated: currentTimeUTC.toISOString(),
            dateEnded: pollEndTime.toISOString(),
            pollType: pollType,
            isActive: "t",
            choices: pollType === 2 ? [] : choices.map(choice => ({ Name: choice, NumVotes: 0 }))
        };
        

        try {
            const response = await fetch(`${API_BASE_URL}/api/poll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPollDto)
            });

            if (!response.ok) {
                toast.error('Failed to create poll. Please try again.');
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            toast.success('Poll created successfully!', {
                autoClose: 3000,
                theme: "dark",
                onClick: () => toast.dismiss(),
                style: { cursor: "pointer" }
            });

            setTimeout(() => {
                navigate(`/poll-link/${data.pollId}`);
            }, 500);

        } catch (error) {
            console.error('Fetch error:', error.message);
            toast.error('Failed to create poll. Please try again.');
        }
    };

    return (
        <div className="create-poll-container">
            <div className="create-poll-card">
                <div className="create-poll-header-container">
                    <h2 className="create-poll-header">Create a Poll</h2>
                    {/* Material UI Select for filtering */}
                    <FormControl
                        sx={{
                            minWidth: 150,
                            "& .MuiInputLabel-root": {
                                color: "white", // Label color
                            },
                            "& .MuiOutlinedInput-root": {
                                color: "white", // Text color
                                fontSize: "15px",
                                "& fieldset": {
                                    borderColor: "white", // Border color
                                },
                                "&:hover fieldset": {
                                    borderColor: "white", // Hover border color
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "white", // Focus border color
                                },
                                "& .MuiSvgIcon-root": {
                                    color: "white", // Dropdown arrow color
                                },
                            },
                        }}
                    >
                        {/* <InputLabel id="poll-filter-label">Filter</InputLabel> */}
                        <Select
                            className="poll-type-select"
                            value={pollType}
                            onChange={handlePollTypeChange}
                        >
                            <MenuItem value={0}>Multiple Choice</MenuItem>
                            <MenuItem value={1}>Multiple Select</MenuItem>
                            <MenuItem value={2}>Survey</MenuItem>
                        </Select>
                        
                    </FormControl>
                </div>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Title */}
                    <div className="form-group">
                        <div className="insert-format">
                            <label>Title {errors.title && <span className="error-asterisk">*</span>}</label>
                            <small className="char-rem">{remainingChars.title} characters</small>
                        </div>
                        
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            maxLength={TITLE_LIMIT}
                        />
                        
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <div className="insert-format">
                            <label>Description {errors.description && <span className="error-asterisk">*</span>}</label>
                            <small className="char-rem">{remainingChars.description} characters</small>
                        </div>
                        
                        <input
                            type="text"
                            value={description}
                            onChange={handleDescriptionChange}
                            maxLength={DESCRIPTION_LIMIT}
                        />
                        
                    </div>

                    {/* Time Limit */}
                    <div className="form-group">
                        <label>Time Limit (in minutes) {errors.timeLimit && <span className="error-asterisk">*</span>}</label>
                        <br />
                        <input
                            type="number"
                            min="0"
                            value={timeLimit}
                            onChange={handleTimeLimitChange}
                            onKeyDown={handleTimeLimitKeyDown}
                            required
                        />
                    </div>

                    {/* Choices */}
                    {pollType != 2 && (
                        <>
                            <div className="form-group">
                                <label>Choices {errors.choices && <span className="error-asterisk">*</span>}</label>
                                {choices.map((choice, index) => (
                                    <div key={index} className="choice-container">
                                        <div className="insert-format-choices">
                                            <small className="char-rem">{remainingChars.choices[index]} characters</small>
                                            <input
                                            required
                                            type="text"
                                            value={choice}
                                            onChange={(e) => handleChoiceChange(index, e)}
                                            maxLength={CHOICE_LIMIT}
                                            />
                                        </div>
                                        
                                        
                                        
                                        {index >= 2 ? (
                                            <UseAnimations animation={trash2}
                                                strokeColor="white"
                                                size="40"
                                                className="trash-icon"
                                                onClick={() => {
                                                    removeChoice(index)
                                                }}/>
                                        ) : (
                                            <div className="placeholder-icon"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="btm-choices">
                                <div className="add-container">
                                    <button type="button" className="add-choice-button" onClick={addChoice}>
                                        <FaPlus className="plus-icon" /> Add Choice
                                    </button>
                                </div>

                                
                            </div>
                        </>
                    )}
                    

                    
                    <div className="button-container">
                        <button type="submit">Create Poll</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePoll;
