import React, { useEffect, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import './UserHeader.css';

const DashboardHeader = ({ profile }) => {
  const [currentModule, setCurrentModule] = useState(localStorage.getItem("module") || "");
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentModule(localStorage.getItem("module") || "");
    console.log(profile);
  }, []);

  const handleModuleChange = (module) => {
    localStorage.setItem("module", module);
    setCurrentModule(module);

    // Redirect accordingly
    if (module === "2A") {
      navigate("/user_dashboard_2A");
    } else if (module === "Physics") {
      navigate("/user_dashboard_Physics");
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        {/* Part 1 Physic Button */}
        <button
          onClick={() => profile?.is_Physics && handleModuleChange("Physics")}
          className={`part-button ${
            currentModule === "Physics" ? "part-button-selected" : ""
          } ${!profile?.is_Physics ? "disabled-link" : ""}`}
          disabled={!profile?.is_Physics}
        >
          Part 1 Physic
        </button>

        {/* Part 2A Button */}
        <button
          onClick={() => profile?.is_PA && handleModuleChange("2A")}
          className={`part-button ${
            currentModule === "2A" ? "part-button-selected" : ""
          } ${!profile?.is_PA ? "disabled-link" : ""}`}
          disabled={!profile?.is_PA}
        >
          Part 2A
        </button>
      </div>

      {/* Right Side: Welcome and Icons */}
      <div className="header-right">
        <span className="welcome-text">Welcome {profile?.username},</span>
        <button className="icon-button"><Bell size={18} /></button>
        <button className="icon-button"><User size={18} /></button>
        <button className="icon-button"><LogOut size={18} /></button>
      </div>
    </header>
  );
};

export default DashboardHeader;
