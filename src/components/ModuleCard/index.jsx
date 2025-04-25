import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "../../config/supabaseClient";

const ModuleCard = ({ module }) => {
    const navigate = useNavigate();
    const profileId = localStorage.getItem("profileId");
    const [progress, setProgress] = useState({
        correct: 0,
        incorrect: 0,
        attempted: 0,
        attTotal: 0
    });

    useEffect(() => {
        const fetchProgress = async () => {
            const title = module.title;

            // 1. Correct answers
            const { count: correct } = await supabase
                .from('test_records')
                .select('*', { count: 'exact', head: true })
                .eq('subcategory_name', title)
                .eq('profile_id', profileId)
                .eq('result', true);

            // 2. Incorrect answers
            const { count: incorrect } = await supabase
                .from('test_records')
                .select('*', { count: 'exact', head: true })
                .eq('subcategory_name', title)
                .eq('profile_id', profileId)
                .eq('result', false);

            // 3. Attempted questions
            const { count: attempted } = await supabase
                .from('test_records')
                .select('*', { count: 'exact', head: true })
                .eq('subcategory_name', title)
                .eq('profile_id', profileId);

            // 4. Total questions for module
            const { count: attTotal } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('sub_category', title);

            setProgress({
                correct: correct || 0,
                incorrect: incorrect || 0,
                attempted: attempted || 0,
                attTotal: attTotal || 0
            });
        };

        fetchProgress();
    }, [module.title, profileId]);
    
    const handleStartQuiz = () => {
        // Navigate to the questions page with the category name as a parameter
        navigate(`/test_module_2A_questions/${module.title}`);
    };

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


    const DualProgressBar = ({ correct, incorrect, attempted }) => {
        const total = attempted;
        const correctPercent = total > 0 ? (correct / total) * 100 : 0;
        const incorrectPercent = total > 0 ? (incorrect / total) * 100 : 0;
    
        return (
            <div style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#e0e0e0",
                borderRadius: "4px",
                position: "relative",
                marginTop: "4px",
                marginBottom: "8px",
                overflow: "hidden"
            }}>
                {/* Green: correct from left */}
                <div style={{
                    width: `${correctPercent}%`,
                    height: "100%",
                    backgroundColor: "#00b300",
                    position: "absolute",
                    left: 0,
                    top: 0
                }} />
                
                {/* Red: incorrect from right */}
                <div style={{
                    width: `${incorrectPercent}%`,
                    height: "100%",
                    backgroundColor: "#cc0000",
                    position: "absolute",
                    right: 0,
                    top: 0
                }} />
            </div>
        );
    };
    
    
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
                    <span>({progress.correct}/{progress.incorrect})</span>
                </div>
                <DualProgressBar 
                    correct={progress.correct} 
                    incorrect={progress.incorrect} 
                    attempted={progress.attempted}
                />

                
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span>Attempted/Total</span>
                    <span>({progress.attempted}/{progress.attTotal})</span>
                </div>
                <ProgressBar filled={progress.attempted} total={progress.attTotal} color="#88c2c2" />
            </div>
            
            <button 
                onClick={handleStartQuiz}
                style={{
                    backgroundColor: "#004c4c",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 40px",
                    marginTop: "15px",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                Start
            </button>
        </div>
    );
};

export default ModuleCard;