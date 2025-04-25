import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FRCRDashboard.css';
import supabase from "../../../config/supabaseClient";
import {
  LayoutDashboard,
  MessageSquare,
  Home,
  FileText,
  BarChart3,
  Bell,
  User,
  LogOut,   
} from 'lucide-react';


const TestByModulePhysics = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("profileId");
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
  
    // Fetch modules data from Supabase
    useEffect(() => {
        const fetchData = async () => {
        try {

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('username, is_PA, is_Physics')
                .eq('id', userId)
                .single(); 

            if (profileError) {
                console.error('Error fetching profile:', profileError);
            } else {
                setProfile(profileData);
            }

            console.log(profileData);

            // Get base modules data
            const { data: subcategories, error: subcategoriesError } = await supabase
            .from('question_subcategory')
            .select('id, subcategory_name, icon_url, parent')
            .eq('parent', '4');
            
            if (subcategoriesError) {
            throw subcategoriesError;
            }

            // Initialize modules with base data
            const modulesData = subcategories.map(item => ({
            id: item.id,
            title: item.subcategory_name,
            icon: item.icon_url,
            parentCategory: item.parent,
            correct: 0,
            incorrect: 0,
            attempted: 0,
            attTotal: 0
            }));

            // If user is logged in, fetch their performance data
            if (userId) {
            // Get user's attempts data
            const { data: attemptsData, error: attemptsError } = await supabase
                .from('tblattempted')
                .select('*')
                .eq('profileid', userId);
            
            if (attemptsError) {
                throw attemptsError;
            }

            // Get total questions count for each subcategory
            const totalQuestionsPromises = modulesData.map(async (module) => {
                const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('category', 'Physics')
                .eq('sub_category', module.parentCategory);
                
                if (error) {
                return 0;
                }
                
                return { subcategory: module.parentCategory, count };
            });

            const totalQuestionsResults = await Promise.all(totalQuestionsPromises);
            
            // Map attempts data to modules
            modulesData.forEach(module => {
                // Find user attempts for this subcategory
                const subcategoryAttempts = attemptsData.filter(
                attempt => attempt.subcategory === module.parentCategory
                );
                
                // Calculate correct and incorrect
                let correct = 0;
                let incorrect = 0;
                
                subcategoryAttempts.forEach(attempt => {
                if (attempt.isCorrect) {
                    correct++;
                } else {
                    incorrect++;
                }
                });
                
                // Update module data
                module.correct = correct;
                module.incorrect = incorrect;
                module.attempted = correct + incorrect;
                
                // Find total questions for this subcategory
                const totalQuestions = totalQuestionsResults.find(
                result => result.subcategory === module.parentCategory
                );
                
                module.attTotal = totalQuestions ? totalQuestions.count : 0;
            });
            } else {
            // Set default values for non-logged in users
            modulesData.forEach(module => {
                module.correct = 75;
                module.incorrect = 75;
                module.attempted = 150;
                module.attTotal = 300;
            });
            }
            
            setModules(modulesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
        };
        
        fetchData();
    }, []);

    // Module icon component
    const ModuleIcon = ({ imageUrl }) => {
        // Check if the image URL is valid
        if (imageUrl && imageUrl.startsWith('https')) {
        return (
            <div className="module-icon" style={{ 
            width: "130px", 
            height: "80px", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden"
            }}>
            <img 
                src={imageUrl}
                alt="module icon" 
                style={{ width: "130px", height: "80px" }}
            />
            </div>
        );
        }
        
        // Fallback to default icon
        return (
        <div className="module-icon" style={{ 
            backgroundColor: "#004c4c", 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 10H30V30H10V10Z" stroke="white" strokeWidth="2" />
            <path d="M17 17H23V23H17V17Z" stroke="white" strokeWidth="2" />
            </svg>
        </div>
        );
    };

    // Progress bar component
    const ProgressBar = ({ filled, total, color }) => {
        const percentage = total > 0 ? (filled / total) * 100 : 0;
        return (
        <div className="progress-container" style={{ width: "100%", backgroundColor: "#e0e0e0", height: "8px", borderRadius: "4px", marginTop: "4px", marginBottom: "8px" }}>
            <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: color, height: "100%", borderRadius: "4px" }}></div>
        </div>
        );
    };

    // Module card component
    const ModuleCard = ({ module }) => {
        return (
        <div className="module-card" style={{ 
            backgroundColor: "white", 
            borderRadius: "20px", 
            padding: "20px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            width: "300px",
            margin: "15px"
        }}>
            <ModuleIcon imageUrl={module.icon} />
            
            <h3 style={{ 
            textAlign: "center", 
            marginTop: "15px", 
            fontSize: "16px", 
            fontWeight: "bold", 
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
            }}>
            {module.title}
            </h3>
            
            <div style={{ width: "100%", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>Correct/Incorrect</span>
                <span>({module.correct}/{module.correct + module.incorrect})</span>
            </div>
            <ProgressBar filled={module.correct} total={module.correct + module.incorrect} color="#004c4c" />
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>Attempted/Total</span>
                <span>({module.attempted}/{module.attTotal})</span>
            </div>
            <ProgressBar filled={module.attempted} total={module.attTotal} color="#88c2c2" />
            </div>
            
            <button style={{ 
            backgroundColor: "#004c4c", 
            color: "white", 
            border: "none", 
            borderRadius: "20px", 
            padding: "8px 40px", 
            marginTop: "15px",
            cursor: "pointer",
            fontWeight: "bold"
            }}>
            Start
            </button>
        </div>
        );
    };

    // Loading indicator
    const LoadingSpinner = () => (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div style={{ fontSize: "18px", color: "#004c4c" }}>Loading modules...</div>
        </div>
    );
  
  return (
    <div className="dashboard-container">
        
      {/* Sidebar */}
      <aside className="sidebar" style={{background: '#004c4c'}}>
        <div className="sidebar-logo">ACE</div>
        <div className="sidebar-icons">
          <div className="icon-block"><BarChart3 /></div>
          <div className="icon-block"><Home /><span>Home</span></div>
          <a href='/Chiongster/userdashboardphysics' className="icon-block"><LayoutDashboard /><span>Dashboard</span></a>
          <a href='/Chiongster/TestByModulePhysics' className="icon-block"><FileText /><span>Modules</span></a>
          <div className="icon-block"><MessageSquare /><span>Contact</span></div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
            {/* Left Side: Buttons */}
            <div className="header-left">
                <a
                    href={profile?.is_Physics ? "/Chiongster/userdashboardphysics" : "#"}
                    className={`part-button part-button-selected ${!profile?.is_Physics ? "disabled-link" : ""}`}
                    onClick={e => {
                        if (!profile?.is_Physics) e.preventDefault();
                    }}
                >
                    Part 1 Physic
                </a>

                <a
                    href={profile?.is_PA ? "/Chiongster/userdashboard" : "#"}
                    className={`part-button ${!profile?.is_PA ? "disabled-link" : ""}`}
                    onClick={e => {
                        if (!profile?.is_PA) e.preventDefault();
                    }}
                >
                    Part 2A
                </a>
            </div>
            {/* Right Side: Welcome + Icons */}
            <div className="header-right">
                <span className="welcome-text">Welcome {userId},</span>
                <button className="icon-button">
                <Bell size={18} />
                </button>
                <button className="icon-button">
                <User size={18} />
                </button>
                <button className="icon-button">
                <LogOut size={18} />
                </button>
            </div>
        </header>
        
        <h1 className="dashboard-title" style={{marginLeft: '50px', marginRight: '50px'}}>Test By Module</h1>
        
        {/* Module Cards Grid */}
        <div className="module-grid" style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          padding: "0 50px"
        }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            modules.map(module => (
              <ModuleCard key={module.id} module={module} />
            ))
          )}
        </div>
        
        <footer className="dashboard-footer">© 2025 ACEFRCR. All rights reserved.</footer>
      </main>
    </div>
  );
};

export default TestByModulePhysics;