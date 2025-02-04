import React from 'react';
import './Header.css';
import { FaUserCircle, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const handleUserIconClick = () => {
        navigate('/user'); // Replace '2' with the actual user ID if needed
    };

    return (
        <header className="header">
            <div className="header-icon" onClick={handleUserIconClick}>
                <FaUserCircle size={24} />
            </div>
            
            
        </header>
    );
}

export default Header;