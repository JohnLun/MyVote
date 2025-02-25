import React from 'react';
import './CheckmarkAnimation.css';

const CheckmarkAnimation = ({ xPosition }) => {
    return (
        <div className="checkmark-animation" style={{ left: `${xPosition}%` }}>
            &#10003;
        </div>
    );
};

export default CheckmarkAnimation;
