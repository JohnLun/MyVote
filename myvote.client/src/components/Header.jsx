import React, { useState, useEffect } from 'react';
import './Header.css';
import { FaUserCircle, FaHome, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import myImage from '../assets/voteIcon.svg';
import Badge from '@mui/material/Badge';
import { useUser } from '../contexts/UserContext'; // Import context
import { useHover } from "@uidotdev/usehooks";

function Header() {
    const navigate = useNavigate();
    const { suggestions } = useUser(); // Access suggestions from context
    const [ref, hovering] = useHover();
    const [animate, setAnimate] = useState(false);

    const handleUserIconClick = () => {
        navigate('/user');
    };

    const handleHomeIconClick = () => {
        navigate('/');
    };

    const handleBellClick = () => {
        navigate('/notifications');
    };

    useEffect(() => {
        let interval;
        if (suggestions.length > 0) {
            setAnimate(true);
            interval = setInterval(() => {
                setAnimate(true);
                setTimeout(() => setAnimate(false), 1000); // Fade out after 1 second
            }, 5000); // Animate every 5 seconds
        } else {
            setAnimate(false);
        }

        return () => clearInterval(interval);
    }, [suggestions.length]);

    return (
        <header className="header">
            {/* Left-aligned title */}
            <div className="header-left" onClick={handleHomeIconClick}>
                <img src={myImage} alt="icon" width={25} />
                <h4 className="header-title">MyVote</h4>
            </div>

            {/* Right-aligned icons */}
            <div className="header-right">
                <div className="home-icon">
                    <FaHome size={24} onClick={handleHomeIconClick} />
                </div>
                <div className="bell-icon" onClick={handleBellClick} ref={ref}>
                    <Badge
                        badgeContent={suggestions.length}
                        color="secondary"
                        invisible={suggestions.length === 0}
                    >
                        <FaBell
                            size={24}
                            className={`${hovering || animate ? 'bell-icon-animate' : ''}`}
                            color='white'
                        />
                    </Badge>
                </div>
                <div className="header-icon" onClick={handleUserIconClick}>
                    <FaUserCircle size={24} />
                </div>
            </div>
        </header>
    );
}

export default Header;


