import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaAngleUp, FaChevronDown} from "react-icons/fa"; // Icons for toggle button
import PropTypes from "prop-types"; // Import PropTypes for props validation
import userNavBarItems from "../UserNavBarItems";
import "./index.css"; // Side navigation styles

const SideNavBar = ({ isCollapsed, toggleSidebar }) => {
    // const [expandedDropdown, setExpandedDropdown] = useState(null); // For dropdowns
    const [expandedDropdown, setExpandedDropdown] = useState({}); // Keep track of dropdown states

    // const toggleDropdown = (index) => {
    //     // If isCollapsed is true, expand the sidebar first
    //     if (isCollapsed) {
    //       toggleSidebar(); // This will set isCollapsed to false
    //     }
    //     // Then toggle the dropdown state
    //     setExpandedDropdown(expandedDropdown === index ? null : index);
    //   };
    const toggleDropdown = (key) => {
      // Expand sidebar first if collapsed
      if (isCollapsed) {
          toggleSidebar();
      }
      // Toggle the specific dropdown
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

    // Close dropdowns when isCollapsed is true
    useEffect(() => {
      if (isCollapsed) {
        // setExpandedDropdown(null);
        setExpandedDropdown({});
      }
    }, [isCollapsed]);

    return (
        <div className={`side-nav-container ${isCollapsed ? "collapsed" : ""}`}>
            {/* Toggle button */}
            <div className="toggle-btn" onClick={toggleSidebar}>
                {isCollapsed ? <FaBars /> : <FaTimes />}
            </div>

            {/* Navigation Items */}
            {}

<ul className="side-nav-items">
                {userNavBarItems.map((item, index) => (
                    <li key={index} className="side-nav-item">
                        {item.dropdown ? (
                            <>
                                {/* <div
                                    className="dropdown-header"
                                    onClick={() => toggleDropdown(index)}
                                > */}
                                <div className="dropdown-header">
                                  {item.link ? (
                                        <NavLink
                                            to={item.link}
                                            className={({ isActive }) =>
                                                isActive ? "active" : ""
                                            }
                                        >
                                            <div className="nav-icon">{item.icon}</div>
                                            <span className="nav-title">{item.title}</span>
                                        </NavLink>
                                    ) : (
                                        <div
                                            onClick={() => toggleDropdown(index)}
                                            className="dropdown-toggle"
                                        >
                                            <div className="nav-icon">{item.icon}</div>
                                            <span className="nav-title">{item.title}</span>
                                        </div>
                                    )}
                                    
                                    {/* <div className="nav-icon">{item.icon}</div>
                                    <span className="nav-title">{item.title}</span> */}
                                    {/* Arrow icon for dropdown toggle */}
                                    <div
                                        className="dropdown-arrow"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent triggering the link
                                          toggleDropdown(index);
                                        }}
                                        >
                                        {expandedDropdown[index] ? (
                                            <FaAngleUp />
                                        ) : (
                                            <FaChevronDown />
                                        )}
                                    </div>
                                      {/* {expandedDropdown[index] ? (
                                          <FaAngleUp className="dropdown-arrow" />
                                      ) : (
                                          <FaChevronDown className="dropdown-arrow" />
                                      )} */}
                                </div>
                                <ul
                                    className={`nested-menu ${
                                        expandedDropdown[index] ? "expanded" : ""
                                    }`}
                                >
                                    {item.items.map((subItem, subIndex) => (
                                        <li key={subIndex} className="nested-item">
                                            {subItem.dropdown ? (
                                                <>
                                                    <div
                                                        className="dropdown-header"
                                                        onClick={() =>
                                                            toggleSubDropdown(index, subIndex)
                                                        }
                                                    >
                                                        <span className="nested-title">
                                                            {subItem.title}
                                                        </span>
                                                        {expandedDropdown[index]?.[subIndex] ? (
                                                            <FaAngleUp className="dropdown-arrow" />
                                                        ) : (
                                                            <FaChevronDown className="dropdown-arrow" />
                                                        )}
                                                    </div>
                                                    <ul
                                                        className={`nested-menu ${
                                                            expandedDropdown[index]?.[subIndex]
                                                                ? "expanded"
                                                                : ""
                                                        }`}
                                                    >
                                                        {subItem.items.map(
                                                            (nestedItem, nestedIndex) => (
                                                                <li
                                                                    key={nestedIndex}
                                                                    className="nested-item"
                                                                >
                                                                    <NavLink
                                                                        to={nestedItem.link}
                                                                        className={({ isActive }) =>
                                                                            isActive ? "active" : ""
                                                                        }
                                                                    >
                                                                        {nestedItem.title}
                                                                    </NavLink>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </>
                                            ) : (
                                                <NavLink
                                                    to={subItem.link}
                                                    className={({ isActive }) =>
                                                        isActive ? "active" : ""
                                                    }
                                                >
                                                    {subItem.title}
                                                </NavLink>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <NavLink
                                to={item.link}
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
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
