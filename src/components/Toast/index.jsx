import React, { useState } from 'react';
import {FaTimes} from "react-icons/fa";
import './index.css';

const Toast = ({ message, type = 'info', duration = 3000 }) => {
    const [visible, setVisible] = useState(true);

    // Automatically hide toast after the specified duration
    React.useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return (
        <div className={`toast toast-${type}`}>
            <span>{message}</span>
            <FaTimes className="close-toast" onClick={() => setVisible(false)} />
        </div>
    );
};

export default Toast;
