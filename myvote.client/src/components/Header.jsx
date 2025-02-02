import React from 'react';
import './Header.css';
import { FaUserCircle, FaFilter } from 'react-icons/fa';

function Header() {
    return (
        <header className="header">
            <div className="header-icon">
                <FaUserCircle size={24} />
            </div>
            <div className="header-search">
                <input type="text" placeholder="Find poll" />
            </div>
            <div className="header-icon">
                <FaFilter size={24} />
            </div>
        </header>
    );
}

export default Header;