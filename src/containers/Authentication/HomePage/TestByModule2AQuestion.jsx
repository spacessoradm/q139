import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import supabase from "../../../config/supabaseClient";
import "./index.css";
import { ChevronDown, Check, ArrowUp } from "lucide-react"
import UserHeader from '../../../components/UserHeader/index';
import UserSidebar from '../../../components/UserSideBar/index';

const TestByModule2AQuestion = () => {
    const userId = localStorage.getItem("profileId");
    const navigate = useNavigate();
    const { categoryName } = useParams(); // Get category from URL parameter
    const [isVisible, setIsVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [currentCategory, setCurrentCategory] = useState(categoryName || '');

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

    // Helper function to shuffle array - moved outside component for better clarity
    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
    
    const handleSignOut = () => {
        localStorage.removeItem("profileId");
        setIsLoggedIn(false);
        navigate("/homepage");
    };
    
    const handleAccept = () => {
        setIsVisible(false);
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
        };
    
        try {
            await supabase.from("user_quiz_progress").insert({
                user_id: userId,
                quiz_type: "single",
                cycle: newCycle,
                category: category,
                progress_data: JSON.stringify(newProgress),
            });
        
            localStorage.setItem(`quizProgress_${userId}_${category}`, JSON.stringify(newProgress));
        } catch (error) {
            console.error("Error resetting progress:", error);
        }
    }, [userId]);
    
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
        };

        try {
            const { error } = await supabase
                .from("user_quiz_progress")
                .update({ progress_data: JSON.stringify(progress) })
                .eq("user_id", userId)
                .eq("cycle", cycle)
                .eq("category", currentCategory);

            if (error) {
                console.error("Error saving progress:", error);
            }

            localStorage.setItem(`quizProgress_${userId}_${currentCategory}`, JSON.stringify(progress));
        } catch (error) {
            console.error("Error in save progress:", error);
        }
    }, [cycle, currentIndex, selectedAnswers, correctAnswersCount, correctQuestions, incorrectQuestions, questions, userId, currentCategory]);

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
                    .eq("profile_id", userId);
                    
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
        const fetchQuestions = async () => {
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

                // Only proceed if we have a category to filter by
                if (!currentCategory) {
                    console.log("No category specified");
                    setLoading(false);
                    return;
                }

                // Query questions filtering by sub_category
                const { data: questionsData, error: questionsError } = await supabase
                    .from("questions")
                    .select("*")
                    .eq('question_type', 'single')
                    .eq('sub_category', currentCategory);

                if (questionsError) {
                    console.error("Error fetching questions:", questionsError);
                    setLoading(false);
                    return;
                }

                if (questionsData.length === 0) {
                    console.log(`No questions found for category: ${currentCategory}`);
                    setLoading(false);
                    return;
                }

                setOriginalQuestions(questionsData);

                // Fetch saved progress from database
                const { data: progressData, error: progressError } = await supabase
                    .from("user_quiz_progress")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("quiz_type", "single")
                    .eq("category", currentCategory)
                    .order("cycle", { ascending: false })
                    .limit(1)
                    .single();

                if (progressData) {
                    // Restore progress from database
                    const savedProgress = JSON.parse(progressData.progress_data);

                    if (savedProgress.completed) {
                        const newCycle = savedProgress.cycle + 1;
                        setCycle(newCycle);

                        const shuffledQuestions = shuffleArray(questionsData);
                        setQuestions(shuffledQuestions);
                        await resetProgress(shuffledQuestions, newCycle, currentCategory);
                    } else {
                        // Continue previous progress
                        setCycle(savedProgress.cycle || 1);
                        setCurrentIndex(savedProgress.currentIndex !== undefined ? savedProgress.currentIndex : 0);
                        setSelectedAnswers(savedProgress.selectedAnswers || {});
                        setCorrectAnswersCount(savedProgress.correctAnswersCount || 0);
                        setCorrectQuestions(savedProgress.correctQuestions || []);
                        setIncorrectQuestions(savedProgress.incorrectQuestions || []);
                        
                        const reorderedQuestions = savedProgress.questionOrder
                            ? savedProgress.questionOrder.map((id) =>
                                  questionsData.find((q) => q.id === id)
                              )
                            : questionsData;

                        setQuestions(reorderedQuestions);
                    }
                } else {
                    // Start a new cycle
                    setCycle(1);
                    const shuffledQuestions = shuffleArray(questionsData);
                    setQuestions(shuffledQuestions);
                    await resetProgress(shuffledQuestions, 1, currentCategory);
                }
            } catch (error) {
                console.error("Error in fetchQuestions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && currentCategory) {
            fetchQuestions();
        }
        
    }, [userId, currentCategory, resetProgress]);

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
            
            // Save quiz progress
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
            await saveProgress(); // Save progress for each step
            await updateLastSession(); // Update last session timestamp
        }
    };
    
    const handleFinalSubmit = async () => {
        try {
            const finalProgress = {
                cycle,
                currentIndex,
                selectedAnswers,
                correctAnswersCount,
                correctQuestions,
                incorrectQuestions,
                questionOrder: questions.map((q) => q.id),
                completed: true, // Mark as completed
            };
        
            const { error } = await supabase
                .from("user_quiz_progress")
                .update({ progress_data: JSON.stringify(finalProgress) })
                .eq("user_id", userId)
                .eq("cycle", cycle)
                .eq("category", currentCategory);
            
            if (error) {
                console.error("Error saving final progress:", error);
            }
        
            localStorage.setItem(`quizProgress_${userId}_${currentCategory}`, JSON.stringify(finalProgress));
            
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
                        <p>Loading questions...</p>
                    </div>
                </main>
            </div>
        );
    }

    // No questions state
    if (questions.length === 0 && currentCategory) {
        return (
            <div className="dashboard-container">
                <UserSidebar />
                <main className="main">
                    <UserHeader profile={userRole} />
                    <div className="question-display-container" style={{ backgroundColor: "white", minHeight: "100vh", padding: "24px", display: "flex", fontFamily: "Poppins" }}>
                        <div className="no-questions-message" style={{ margin: "auto", textAlign: "center" }}>
                            <h2>No questions available for category: {currentCategory}</h2>
                            <p>Please try another category or contact an administrator.</p>
                        </div>
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
                                    {JSON.parse(questions[currentIndex].options).map((optionText, index) => {
                                        const letter = String.fromCharCode(65 + index);
                                        const isCorrect = (questions[currentIndex].correct_answer || "").split(",").map(a => a.trim()).includes(letter);
                                        const isSelected = selectedAnswers[currentIndex]?.includes(letter);
                                        const isIncorrect = isSelected && !isCorrect;

                                        return (
                                            <div key={index} className={`option ${submitted ? (isCorrect ? "correct" : isIncorrect ? "wrong" : "") : ""}`}>
                                                <input
                                                    type={questions[currentIndex].question_type === "multiple" ? "checkbox" : "radio"}
                                                    name="answer"
                                                    value={letter}
                                                    checked={isSelected}
                                                    disabled={submitted} 
                                                    onChange={() => handleSelectAnswer(letter)}
                                                />
                                                {letter}. {optionText}
                                            </div>
                                        );
                                    })}

                                    {!submitted ? (
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={!selectedAnswers[currentIndex]}
                                            className={!selectedAnswers[currentIndex] ? "disabled-btn" : ""}
                                        >
                                            Submit
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

export default TestByModule2AQuestion;