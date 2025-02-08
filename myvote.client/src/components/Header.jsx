import React from 'react';
import './Header.css';
import { FaUserCircle, FaHome, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const handleUserIconClick = () => {
        navigate('/user'); // Replace '2' with the actual user ID if needed
    };

    const handleHomeIconClick = () => {
        navigate('/');
    };

    return (
        <header className="header">

            <div className="home-icon">
                <FaHome size={24} onClick={handleHomeIconClick}></FaHome>
            </div>
            <div className="header-icon" onClick={handleUserIconClick}>
                <FaUserCircle size={24} />
            </div>
            
            
            
        </header>
    );
}

export default Header;