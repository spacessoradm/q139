import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';
import './index.css';

const BackArrowButton = ({ to }) => {
  const navigate = useNavigate();

  return (
    <button
      className="back-button"
      onClick={() => navigate(to)}
      onMouseOver={(e) => e.target.classList.add('hover')}
      onMouseOut={(e) => e.target.classList.remove('hover')}
    >
      <FaAngleLeft className="icon" />
    </button>
  );
};

export default BackArrowButton;
