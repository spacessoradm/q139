import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const AdminNavigation = () => {
  return (
    <nav className="admin-nav">
      <ul>
        <li>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/users">Manage Users</Link>
        </li>
        <li>
          <Link to="/admin/recipes">Manage Recipes</Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavigation;
