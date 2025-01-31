import React, { useState } from 'react';
import './PollDetails.css';

const PollDetails = () => {
    const API_BASE_URL =
        window.location.hostname === 'localhost'
            ? 'https://localhost:7054/api'
            : 'https://myvote-a3cthpgyajgue4c9.canadacentral-01.azurewebsites.net/api';
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [choices, setChoices] = useState(['', '']);

            return(
                <div>
                    <p>hello</p>
                </div>
            );
}

export default PollDetails;