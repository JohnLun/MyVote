import React from 'react';
import './Header.css';
import { FaUserCircle, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaBell } from "react-icons/fa";
import myImage from '../assets/voteIcon.svg';

function Header() {
    const navigate = useNavigate();

    const handleUserIconClick = () => {
        navigate('/user');
    };

    const handleHomeIconClick = () => {
        navigate('/');
    };

    const handleBellClick = () => {
        navigate('/notifications');
    }
    
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
                <div className="bell-icon">
                    <FaBell size={24} onClick={handleBellClick}/>
                </div>
                <div className="header-icon" onClick={handleUserIconClick}>
                    <FaUserCircle size={24} />
                </div>
            </div>
        </header>
    );
}

export default Header;