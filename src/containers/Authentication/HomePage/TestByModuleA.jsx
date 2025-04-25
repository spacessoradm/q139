import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from "../../../config/supabaseClient";
import UserHeader from '../../../components/UserHeader/index';
import UserSidebar from '../../../components/UserSideBar/index';
import ModuleCard from '../../../components/ModuleCard';

import './FRCRDashboard.css';


const TestByModuleA = () => {
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

            // Get base modules data
            const { data: subcategories, error: subcategoriesError } = await supabase
            .from('question_subcategory')
            .select('id, subcategory_name, icon_url, parent')
            .eq('parent', '3');
            
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
                .eq('category', 'Part 2A')
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

    const handleStart = () => {
        navigate("/module_2A", { state: { module } });
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
      <UserSidebar />
      
      {/* Main Content */}
      <main className="main-content">
        <UserHeader profile={profile} />
        
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

export default TestByModuleA;