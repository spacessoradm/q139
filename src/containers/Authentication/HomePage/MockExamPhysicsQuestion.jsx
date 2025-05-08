import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import supabase from "../../../config/supabaseClient";
import "./index.css";
import { ChevronDown, Check, ArrowUp } from "lucide-react"
import UserHeader from '../../../components/UserHeader/index';
import UserSidebar from '../../../components/UserSideBar/index';

const MockExamPhysicsQuestion = () => {
    const userId = localStorage.getItem("profileId");
    const location = useLocation();
    const navigate = useNavigate();

    const { sessionId } = location.state || {};
    const category = "Physics";
    const currentCategory = "Physics";
    const [isVisible, setIsVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState('');

    const [questions, setQuestions] = useState([]);
    const [originalQuestions, setOriginalQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [cycle, setCycle] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Exam session data
    const [examSession, setExamSession] = useState(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [examExpired, setExamExpired] = useState(false);

    const [subQuestions, setSubQuestions] = useState([]);
    const [subQuestionAnswers, setSubQuestionAnswers] = useState({});
    const [subQuestionResults, setSubQuestionResults] = useState({});

    // Helper function to shuffle array - moved outside component for better clarity
    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Format time remaining as HH:MM:SS
    const formatTimeRemaining = (seconds) => {
        if (seconds <= 0) return "00:00:00";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Session management functions
    const updateLastSession = async () => {
        if (!userId || !currentCategory) return;
        
        const now = new Date();
        
        try {
            // Check if a session already exists for this profile and category
            const { data: existingSession, error: sessionError } = await supabase
                .from("last_session")
                .select("*")
                .eq("profile_id", userId)
                .eq("open_session", currentCategory)
                .single();
            
            if (sessionError && sessionError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error("Error checking last session:", sessionError);
                return;
            }
            
            if (existingSession) {
                // Just update the modified_at if record exists
                const { error: updateError } = await supabase
                    .from("last_session")
                    .update({
                        modified_at: now
                    })
                    .eq("profile_id", userId)
                    .eq("open_session", currentCategory);
                    
                if (updateError) {
                    console.error("Error updating last session:", updateError);
                }
            } else {
                // Create new session record
                const { error: insertError } = await supabase
                    .from("last_session")
                    .insert({
                        open_session: currentCategory,
                        profile_id: userId,
                        session_id: sessionId,
                        created_at: now,
                        modified_at: now
                    });
                    
                if (insertError) {
                    console.error("Error creating last session:", insertError);
                }
            }
        } catch (error) {
            console.error("Session update error:", error);
        }
    };

    // Navigation functions
    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Progress management functions
    const resetProgress = useCallback(async (newQuestions, newCycle, category) => {
        const newProgress = {
            cycle: newCycle,
            currentIndex: 0,
            selectedAnswers: {},
            correctAnswersCount: 0,
            correctQuestions: [],
            incorrectQuestions: [],
            questionOrder: newQuestions.map((q) => q.id),
            completed: false,
            session_id: sessionId
        };
    
        try {
            await supabase.from("user_quiz_progress").insert({
                user_id: userId,
                quiz_type: "examphysics",
                cycle: newCycle,
                category: category,
                session_id: sessionId,
                progress_data: JSON.stringify(newProgress),
            });
        
            localStorage.setItem(`examProgress_${userId}_${sessionId}`, JSON.stringify(newProgress));
        } catch (error) {
            console.error("Error resetting progress:", error);
        }
    }, [userId, sessionId]);
    
    const saveProgress = useCallback(async (isComplete = false) => {
        const progress = {
            cycle,
            currentIndex,
            selectedAnswers,
            correctAnswersCount,
            correctQuestions,
            incorrectQuestions,
            questionOrder: questions.map((q) => q.id),
            completed: isComplete,
            session_id: sessionId
        };

        try {
            const { error } = await supabase
                .from("user_quiz_progress")
                .update({ progress_data: JSON.stringify(progress) })
                .eq("user_id", userId)
                .eq("quiz_type", "examphysics")
                .eq("session_id", sessionId);

            if (error) {
                console.error("Error saving progress:", error);
            }

            localStorage.setItem(`examProgress_${userId}_${sessionId}`, JSON.stringify(progress));
        } catch (error) {
            console.error("Error in save progress:", error);
        }
    }, [cycle, currentIndex, selectedAnswers, correctAnswersCount, correctQuestions, incorrectQuestions, questions, userId, sessionId]);

    // Save test record - create new or update existing
    const saveTestRecord = async (question, userAnswer, isCorrect) => {
        try {
            const now = new Date();
            
            // Check if record already exists
            const { data: existingRecord, error: checkError } = await supabase
                .from("test_records")
                .select("*")
                .eq("subcategory_name", currentCategory)
                .eq("question_id", question.id)
                .eq("profile_id", userId)
                .single();
                
            if (checkError && checkError.code !== 'PGRST116') {
                console.error("Error checking test record:", checkError);
                return;
            }
            
            if (existingRecord) {
                // Update existing record
                const { error: updateError } = await supabase
                    .from("test_records")
                    .update({
                        result: isCorrect ? 1 : 0,
                        selected_answer: JSON.stringify(userAnswer),
                        modified_at: now
                    })
                    .eq("subcategory_name", currentCategory)
                    .eq("question_id", question.id)
                    .eq("profile_id", userId)
                    
                if (updateError) {
                    console.error("Error updating test record:", updateError);
                }
            } else {
                // Create new record
                const { error: insertError } = await supabase
                    .from("test_records")
                    .insert({
                        subcategory_name: currentCategory,
                        question_id: question.id,
                        result: isCorrect ? 1 : 0,
                        selected_answer: JSON.stringify(userAnswer),
                        profile_id: userId,
                        created_at: now,
                        modified_at: now
                    });
                    
                if (insertError) {
                    console.error("Error creating test record:", insertError);
                }
            }
        } catch (error) {
            console.error("Error saving test record:", error);
        }
    };

    // Data fetching and initialization
    useEffect(() => {
        const fetchExamSessionAndQuestions = async () => {
            setLoading(true);
            
            try {
                // Update last session on component load
                await updateLastSession();
                
                // Fetch user role
                const { data: userRoleData, error: userRoleDataError } = await supabase
                    .from("profiles")
                    .select("role_id")
                    .eq("id", userId);

                if (userRoleDataError) {
                    console.error("Error fetching role data:", userRoleDataError);
                } else {
                    setUserRole(userRoleData);
                }

                console.log(sessionId)

                // Fetch exam session data using sessionId
                if (!sessionId) {
                    console.error("No session ID specified");
                    setLoading(false);
                    return;
                }

                const { data: sessionData, error: sessionError } = await supabase
                    .from("exam_sessions")
                    .select("*")
                    .eq("id", sessionId)
                    .single();

                if (sessionError) {
                    console.error("Error fetching exam session:", sessionError);
                    setLoading(false);
                    return;
                }

                if (!sessionData) {
                    console.error("No exam session found with ID:", sessionId);
                    setLoading(false);
                    return;
                }

                setExamSession(sessionData);
                //setCurrentCategory(sessionData.category || categoryName);

                // Calculate remaining time
                if (sessionData.timer_on != false){
                    const startTime = new Date(sessionData.start_time);
                    const endTime = new Date(startTime.getTime() + (180 * 60 * 1000)); // 180 minutes from start
                    const now = new Date();
                    const remainingSecs = Math.max(0, Math.floor((endTime - now) / 1000));
                    setRemainingTime(remainingSecs);
                    
                    if (remainingSecs <= 0) {
                        setExamExpired(true);
                    }
                } else {
                    console.log('here')
                }

                // Extract question IDs from session data
                let questionIds = [];
                try {
                    questionIds = Array.isArray(sessionData.question_ids) 
                        ? sessionData.question_ids 
                        : JSON.parse(sessionData.question_ids);
                } catch (e) {
                    console.error("Error parsing question IDs:", e);
                    setLoading(false);
                    return;
                }

                if (questionIds.length === 0) {
                    console.error("No question IDs found in exam session");
                    setLoading(false);
                    return;
                }

                // Fetch questions by IDs
                const { data: questionsData, error: questionsError } = await supabase
                    .from("questions")
                    .select("*")
                    .in('id', questionIds);

                if (questionsError) {
                    console.error("Error fetching questions:", questionsError);
                    setLoading(false);
                    return;
                }

                if (questionsData.length === 0) {
                    console.log(`No questions found for the provided IDs`);
                    setLoading(false);
                    return;
                }

                // Reorder questions to match the order in question_ids
                const orderedQuestions = questionIds.map(id => 
                    questionsData.find(q => q.id === id)
                ).filter(q => q !== undefined);

                setOriginalQuestions(orderedQuestions);
                setQuestions(orderedQuestions);

                // Fetch saved progress from database
                const { data: progressData, error: progressError } = await supabase
                    .from("user_quiz_progress")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("quiz_type", "examphysics")
                    .eq("session_id", sessionId)
                    .single();

                console.log(progressData);

                if (progressData) {
                    // Restore progress from database
                    const savedProgress = JSON.parse(progressData.progress_data);
                    setCycle(savedProgress.cycle || 1);
                    setCurrentIndex(savedProgress.currentIndex !== undefined ? savedProgress.currentIndex : 0);
                    setSelectedAnswers(savedProgress.selectedAnswers || {});
                    setCorrectAnswersCount(savedProgress.correctAnswersCount || 0);
                    setCorrectQuestions(savedProgress.correctQuestions || []);
                    setIncorrectQuestions(savedProgress.incorrectQuestions || []);
                    
                    if (savedProgress.completed) {
                        setShowResults(true);
                    }
                } else {
                    // Start a new cycle
                    setCycle(1);
                    await resetProgress(orderedQuestions, 1, currentCategory);
                }
            } catch (error) {
                console.error("Error in fetchExamSessionAndQuestions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && sessionId) {
            fetchExamSessionAndQuestions();
        }
        
    }, [userId, sessionId, resetProgress]);

    // Timer effect
    useEffect(() => {
        if (!examExpired && remainingTime > 0) {
            const timer = setInterval(() => {
                setRemainingTime(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        clearInterval(timer);
                        setExamExpired(true);
                        // Auto-submit when time expires
                        handleFinalSubmit();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [remainingTime, examExpired]);

    // Handle window beforeunload to save progress when user refreshes
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Just update last session on refresh/navigation
            updateLastSession();
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [userId, currentCategory, cycle, currentIndex, selectedAnswers, correctAnswersCount]);

    // Load sub-questions for the current question
    const loadSubQuestions = async () => {
        if (!questions || questions.length === 0 || currentIndex >= questions.length) {
        return;
        }
        
        const currentQuestion = questions[currentIndex];
        
        try {
        const { data: subQuestionsData, error: subQuestionsError } = await supabase
            .from("subquestions")
            .select("*")
            .eq('parent_id', currentQuestion.id);
                
        if (subQuestionsError) {
            console.error("Error fetching sub-questions:", subQuestionsError);
            return;
        }
            
        setSubQuestions(subQuestionsData || []);
        } catch (error) {
        console.error("Error loading sub-questions:", error);
        }
    };

    useEffect(() => {
        loadSubQuestions();
    }, [currentIndex, questions]);

    // Check if all sub-questions have been answered
    const allSubQuestionsAnswered = () => {
        if (!subQuestions || subQuestions.length === 0) return false;
        
        return subQuestions.every(sq => 
        subQuestionAnswers[sq.id] !== undefined && 
        (Array.isArray(subQuestionAnswers[sq.id]) ? 
            subQuestionAnswers[sq.id].length > 0 : 
            subQuestionAnswers[sq.id] !== null)
        );
    };

    const handleSubQuestionAnswer = (subQuestionId, value) => {
        setSubQuestionAnswers(prev => ({
          ...prev,
          [subQuestionId]: value
        }));
      };

    // Answer handling
    const handleSelectAnswer = (value) => {
        const currentQuestion = questions[currentIndex];
        if (currentQuestion.question_type === "multiple") {
            setSelectedAnswers(prev => {
                const updated = prev[currentIndex] ? [...prev[currentIndex]] : [];
                return { ...prev, [currentIndex]: updated.includes(value) ? updated.filter(v => v !== value) : [...updated, value] };
            });
        } else {
            setSelectedAnswers({ ...selectedAnswers, [currentIndex]: value });
        }
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setShowExplanation(true);

        const question = questions[currentIndex];
        const userAnswer = Array.isArray(selectedAnswers[currentIndex])
            ? selectedAnswers[currentIndex]
            : [selectedAnswers[currentIndex]];
        
        let correctAnswer;
        try {
            correctAnswer = typeof question.correct_answer === "string"
                ? question.correct_answer.includes(",")
                    ? question.correct_answer.split(",").map(a => a.trim())
                    : [question.correct_answer]
                : question.correct_answer;
        } catch (error) {
            console.error("Error parsing correct_answer:", error);
            correctAnswer = [];
        }

        if (!Array.isArray(correctAnswer)) correctAnswer = [correctAnswer];

        const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());

        // Update state
        if (isCorrect) {
            setCorrectAnswersCount(prev => prev + 1);
            setCorrectQuestions(prev => [...prev, currentIndex]);
        } else {
            setIncorrectQuestions(prev => [...prev, currentIndex]);
        }

        try {
            // Save or update test record
            await saveTestRecord(question, userAnswer, isCorrect);
            
            // Save quiz progress using the existing saveProgress function
            await saveProgress();
            
            // Update last session
            await updateLastSession();
        } catch (error) {
            console.error("Error in handle submit:", error);
        }
    };

    const handleNext = async () => {
        setSubmitted(false);
        setShowExplanation(false);
    
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            await saveProgress(); // Save progress using the existing function
            await updateLastSession(); // Update last session timestamp
        }
    };
    
    const handleFinalSubmit = async () => {
        try {
            // Use the existing saveProgress function with isComplete=true
            await saveProgress(true);
            
            // Update last session timestamp
            await updateLastSession();
        
            setShowResults(true); // Show all answered questions
        } catch (error) {
            console.error("Error in final submit:", error);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="dashboard-container">
                <UserSidebar />
                <main className="main">
                    <UserHeader profile={userRole} />
                    <div className="loading-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
                        <p>Loading exam questions...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <UserSidebar />

            <main className="main">
                {/* Top navigation bar */}
                <UserHeader profile={userRole} />

                <div className="question-display-container" style={{ backgroundColor: "white", minHeight: "100vh", padding: "24px", display: "flex", fontFamily: "Poppins"  }}>
                    <div className="" style={{ flex: "30%", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px" }}>
                        <div className="score-section" style={{ textAlign: "center", marginBottom: "16px" }}>
                        </div>

                        <ul className="progress-bar">
                            {questions.map((_, index) => {
                                let statusClass = "upcoming"; // Default: Gray

                                if (index === currentIndex) {
                                    statusClass = "active"; // Blue for current question
                                } else if (correctQuestions.includes(index)) {
                                    statusClass = "correct"; // Green if correctly answered
                                } else if (incorrectQuestions.includes(index)) {
                                    statusClass = "wrong"; // Red if incorrectly answered
                                }

                                return (
                                    <li key={index} className={`progress-item ${statusClass}`}>
                                        Q{index + 1}
                                    </li>
                                );
                            })}
                        </ul>

                    </div>

                    <div className="question-content" style={{ flex: "70%", 
                        paddingLeft: "16px", 
                        maxWidth: "70%",
                        alignSelf: "flex-start",
                        flexShrink: 0,
                        flexGrow: 0, }}>
                        {!showResults ? (
                            questions.length > 0 && (
                                <div>
                                    <h2>{questions[currentIndex].question_text}</h2>
                                    {/* Display sub-questions */}
                                    {subQuestions.map((subQuestion, sqIndex) => {
                                        const subQuestionResult = submitted ? subQuestionResults[subQuestion.id] : null;

                                        return (
                                            <div
                                            key={subQuestion.id}
                                            className="sub-question"
                                            style={{
                                                marginBottom: "20px",
                                                padding: "15px",
                                                borderRadius: "8px",
                                                border: "1px solid #eee",
                                                backgroundColor: submitted 
                                                    ? (subQuestionResult && subQuestionResult.isCorrect 
                                                        ? "#e8f5e9" // Light green for correct
                                                        : "#ffebee") // Light red for incorrect
                                                    : "#f9f9f9"
                                            }}
                                            >
                                            <h3>Sub-question {sqIndex + 1}: {subQuestion.subquestion_text}</h3>

                                            {/* Options rendering for True and False */}
                                            {!submitted && (
                                                <div className="options">
                                                <label style={{ 
                                                    marginRight: "20px", 
                                                    display: "inline-block",
                                                    padding: "8px 16px",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    backgroundColor: subQuestionAnswers[subQuestion.id] === "true" ? "#e3f2fd" : "transparent"
                                                }}>
                                                    <input
                                                    type="radio"
                                                    name={`subquestion-${subQuestion.id}`}
                                                    value="true"
                                                    checked={subQuestionAnswers[subQuestion.id] === "true"}
                                                    onChange={() => handleSubQuestionAnswer(subQuestion.id, "true")}
                                                    style={{ marginRight: "8px" }}
                                                    />
                                                    True
                                                </label>

                                                <label style={{ 
                                                    display: "inline-block",
                                                    padding: "8px 16px",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    backgroundColor: subQuestionAnswers[subQuestion.id] === "false" ? "#e3f2fd" : "transparent"
                                                }}>
                                                    <input
                                                    type="radio"
                                                    name={`subquestion-${subQuestion.id}`}
                                                    value="false"
                                                    checked={subQuestionAnswers[subQuestion.id] === "false"}
                                                    onChange={() => handleSubQuestionAnswer(subQuestion.id, "false")}
                                                    style={{ marginRight: "8px" }}
                                                    />
                                                    False
                                                </label>
                                                </div>
                                            )}

                                            {/* Show Result and Explanation after Submit */}
                                            {submitted && subQuestionResult && (
                                                <div>
                                                    <div style={{ 
                                                        marginTop: "10px", 
                                                        fontWeight: "bold", 
                                                        color: subQuestionResult.isCorrect ? "green" : "red" 
                                                    }}>
                                                        {subQuestionResult.isCorrect 
                                                            ? "✓ Correct" 
                                                            : `✗ Incorrect. The correct answer is: ${subQuestionResult.correctAnswer}`}
                                                    </div>
                                                    
                                                    {subQuestion.explanation && (
                                                        <div className="explanation" style={{ 
                                                            marginTop: "10px", 
                                                            padding: "10px",
                                                            backgroundColor: "#f5f5f5",
                                                            borderRadius: "4px"
                                                        }}>
                                                            <strong>Explanation:</strong> {subQuestion.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            </div>
                                        );
                                    })}

                                    {!submitted ? (
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={!allSubQuestionsAnswered()}
                                            className={!allSubQuestionsAnswered() ? "disabled-btn" : ""}
                                        >
                                            Submit All Answers
                                        </button>
                                    ) : (
                                        <>
                                            {currentIndex < questions.length - 1 ? (
                                                <button onClick={handleNext}>Next</button>
                                            ) : (
                                                <button onClick={handleFinalSubmit}>Final Submit</button>
                                            )}
                                        </>
                                    )}

                                    {/* Explanation section */}
                                    {submitted && showExplanation && questions[currentIndex].explanation && (
                                        <div className="explanation-section" style={{
                                            marginTop: "20px",
                                            padding: "15px",
                                            backgroundColor: "#f5f5f5",
                                            borderRadius: "8px",
                                            borderLeft: "4px solid #3f51b5"
                                        }}>
                                            <h4 style={{ marginTop: "0" }}>Explanation:</h4>
                                            <p dangerouslySetInnerHTML={{ __html: questions[currentIndex].explanation }} />
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="results-container">
                                <h2>Results</h2>
                                <p>Correct Answers: {correctAnswersCount}/{questions.length}</p>
                                <p>Score: {((correctAnswersCount / questions.length) * 100).toFixed(1)}%</p>
                                
                                <div className="results-review">
                                    <h3>Question Review</h3>
                                    {questions.map((q, index) => {
                                        const userAnswer = selectedAnswers[index];
                                        const isCorrect = correctQuestions.includes(index);
                                        
                                        return (
                                            <div key={index} className={`review-question ${isCorrect ? "correct-answer" : "wrong-answer"}`}>
                                                <h4>Question {index + 1}: {q.question_text}</h4>
                                                <p>Your answer: {userAnswer}</p>
                                                <p>Correct answer: {q.correct_answer}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <button onClick={() => navigate(`/module/${currentCategory}`)}>
                                    Return to Module
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MockExamPhysicsQuestion;