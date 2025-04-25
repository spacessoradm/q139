import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import supabase from "../../config/supabaseClient";
import "./index.css"; // Admin layout-specific styles

const UserLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`admin-layout-container ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <SideNavBar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="admin-content-wrapper">
        {/* Admin Header */}
        <header className="admin-header">

          {/* Sidebar Toggle Button */}
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FaBars size={20} />
          </button>

          {/* Profile Section */}
          <div className="profile-section">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Replace with actual image path
              alt=""
              className="profile-image"
              onClick={toggleDropdown}
            />

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => console.log("View Profile clicked")} style={{ color: "black" }}>
                  View Profile
                </button>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    localStorage.clear();
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                    navigate("/login");
                  }} 
                  style={{ color: "black" }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">{children}</div>

        {/* Optional: Footer */}
        <footer className="admin-footer">
          <p>Ace FRCR User Panel &copy; 2025</p>
        </footer>
      </div>
    </div>
  );
};

UserLayout.propTypes = {
  children: PropTypes.node.isRequired, // Page content
};

export default UserLayout;
