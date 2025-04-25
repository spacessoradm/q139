import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  House,
  FileText,
  ChartNoAxesGantt,
} from 'lucide-react';
import './UserSidebar.css';

const UserSidebar = () => {
  const [module, setModule] = useState('');

  useEffect(() => {
    const storedModule = localStorage.getItem("module");
    if (storedModule && storedModule !== 'value') {
      setModule(storedModule);
    }
  }, []);

  const getLink = () => {
    if (module === '2A') return '/user_dashboard_2A';
    if (module === 'Physics') return '/user_dashboard_Physics';
    return '#'; // fallback if module not set or invalid
  };

  const getModuleLink = () => {
    if (module === '2A') return '/test_module_2A';
    if (module === 'Physics') return '/test_module_physics';
    return '#'; // fallback if module not set or invalid
  };

  return (
    <aside className="sidebar" style={{ background: '#004c4c' }}>
      <div className="sidebar-logo">
        <img
          src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg"
          style={{ width: '80px', height: '80px' }}
          alt="ACEFRCR Logo"
        />
      </div>
      <div className="sidebar-icons">
        <div className="icon-block"><ChartNoAxesGantt /></div>
        <div className="icon-block"><House /><span>Home</span></div>
        <a href={getLink()} className={`icon-block ${!module ? 'disabled-link' : ''}`}>
            <LayoutDashboard /><span>Dashboard</span>
        </a>
        <a href={getModuleLink()} className={`icon-block ${!module ? 'disabled-link' : ''}`}>
          <FileText /><span>Modules</span>
        </a>
        <div className="icon-block"><MessageSquareText /><span>Contact</span></div>
      </div>
    </aside>
  );
};

export default UserSidebar;
