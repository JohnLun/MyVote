import React, { useState } from 'react';
import PollGraph from './PollGraph';
import './PollDetailsFlip.css';

function PollDetailsFlip({ poll }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <div className="flip-card-inner">
                <div className="flip-card-front">
                    <PollGraph />
                    <i className="flip-icon fas fa-sync-alt"></i>
                </div>
                <div className="flip-card-back">
                    <p>{poll.description}</p>
                    <i className="flip-icon fas fa-sync-alt"></i>
                </div>
            </div>
        </div>
    );
}

export default PollDetailsFlip;