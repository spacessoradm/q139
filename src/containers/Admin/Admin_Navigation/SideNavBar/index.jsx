import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaAngleUp, FaChevronDown } from "react-icons/fa";
import PropTypes from "prop-types";
import adminNavBarItems from "../AdminNavBarItems";
import "./index.css";

const SideNavBar = ({ isCollapsed, toggleSidebar }) => {
    const [expandedDropdown, setExpandedDropdown] = useState({});

    const toggleDropdown = (key) => {
        if (isCollapsed) toggleSidebar();
        setExpandedDropdown((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleSubDropdown = (key, subKey) => {
        setExpandedDropdown((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [subKey]: !prev[key]?.[subKey],
            },
        }));
    };

    useEffect(() => {
        if (isCollapsed) setExpandedDropdown({});
    }, [isCollapsed]);

    return (
        <div className={`side-nav-container ${isCollapsed ? "collapsed" : ""}`}>
            {/*<div className="toggle-btn" onClick={toggleSidebar}>
                {isCollapsed ? <FaBars /> : <FaTimes />}
            </div>*/}

            <div className="toggle-btn" style={{background: 'white'}}>
                {isCollapsed ?  <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg" alt="Logo" className="toggle-logo-expand" /> : <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg" alt="Logo" className="toggle-logo-expand" />}
            </div>
            <ul className="side-nav-items">
                {adminNavBarItems.map((item, index) => (
                    <li key={index} className="side-nav-item">
                        {item.dropdown ? (
                            <>
                                <div className="dropdown-header">
                                    {item.link ? (
                                        <NavLink to={item.link} className={({ isActive }) => isActive ? "active" : ""}>
                                            <div className="nav-icon">{item.icon}</div>
                                            <span className="nav-title">{item.title}</span>
                                        </NavLink>
                                    ) : (
                                        <div onClick={() => toggleDropdown(index)} className="dropdown-toggle">
                                            <div className="nav-icon">{item.icon}</div>
                                            <span className="nav-title">{item.title}</span>
                                        </div>
                                    )}
                                    <div className="dropdown-arrow" onClick={(e) => { e.stopPropagation(); toggleDropdown(index); }}>
                                        {expandedDropdown[index] ? <FaAngleUp style={{ width: '20px', color:'#004c4c' }} /> : <FaChevronDown />}
                                    </div>
                                </div>
                                <ul className={`nested-menu ${expandedDropdown[index] ? "expanded" : ""}`}>
                                    {item.items.map((subItem, subIndex) => (
                                        <li key={subIndex} className="nested-item">
                                            {subItem.dropdown ? (
                                                <>
                                                    <div className="dropdown-header" onClick={() => toggleSubDropdown(index, subIndex)}>
                                                        <span className="nested-title">{subItem.title}</span>
                                                        {expandedDropdown[index]?.[subIndex] ? <FaAngleUp /> : <FaChevronDown />}
                                                    </div>
                                                    <ul className={`nested-menu ${expandedDropdown[index]?.[subIndex] ? "expanded" : ""}`}>
                                                        {subItem.items.map((nestedItem, nestedIndex) => (
                                                            <li key={nestedIndex} className="nested-item">
                                                                <NavLink to={nestedItem.link} className={({ isActive }) => isActive ? "active" : ""}>
                                                                    {nestedItem.title}
                                                                </NavLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            ) : (
                                                <NavLink to={subItem.link} className={({ isActive }) => isActive ? "active" : ""}>
                                                    {subItem.title}
                                                </NavLink>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <NavLink to={item.link} className={({ isActive }) => isActive ? "active" : ""}>
                                <div className="nav-icon">{item.icon}</div>
                                <span className="nav-title">{item.title}</span>
                            </NavLink>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

SideNavBar.propTypes = {
    isCollapsed: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
};

export default SideNavBar;
