import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/profile">My Profile</Link></li>
        <li><Link to="/items">Search Items</Link></li>
        <li><Link to="/items/sell-items">Sell Items</Link></li>
        <li><Link to="/order-history">Orders History</Link></li>
        <li><Link to="/deliver-items">Deliver Items</Link></li>
        <li><Link to="/cart">My Cart</Link></li>
        <li><Link to="/chat/start">Support</Link></li>
        <li>
          <button 
            onClick={handleLogout} 
            className="logout-button"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;