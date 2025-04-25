import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const UserNavigation = () => {
  return (
    <nav className="admin-nav">
      <ul>
        <li>
          <Link to="/user/dashboard">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default UserNavigation;
