import React from 'react';
import './Header.css';
import { FaUserCircle, FaHome, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import myImage from '../assets/voteIcon.svg';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { useUser } from '../contexts/UserContext'; // Import context
import BellIcon from 'react-bell-icon';
import { useHover } from "@uidotdev/usehooks";
import ForwardedBellIcon from './ForwardedBellIcon';

function Header() {
    const navigate = useNavigate();
    const { suggestions } = useUser(); // Access suggestions from context
    const [ref, hovering] = useHover();

    const handleUserIconClick = () => {
        navigate('/user');
    };

    const handleHomeIconClick = () => {
        navigate('/');
    };

    const handleBellClick = () => {
        navigate('/notifications');
    };

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
                <div className="bell-icon" onClick={handleBellClick}>
                    <Badge 
                        badgeContent={suggestions.length} 
                        color="secondary" 
                        invisible={suggestions.length === 0}
                    >
                        <ForwardedBellIcon width='24' height='24' active={suggestions.length > 0} ref={ref} animate={hovering} color='white' />
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
