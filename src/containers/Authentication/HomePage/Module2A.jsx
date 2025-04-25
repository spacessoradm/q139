import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import supabase from "../../../config/supabaseClient";
import "./index.css";
import { ChevronDown, Check, ArrowUp } from "lucide-react"

import UserHeader from '../../../components/UserHeader/index';
import UserSidebar from '../../../components/UserSideBar/index';

const Module2A = () => {
    const userId = localStorage.getItem("profileId");
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState('');

    const [questions, setQuestions] = useState([]);
    const [originalQuestions, setOriginalQuestions] = useState([]); // Store original question order
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [cycle, setCycle] = useState(0);

    // navigation stuff here
    const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    };
    
    const handleSignOut = () => {
        localStorage.removeItem("profileId"); // Clear token
        setIsLoggedIn(false);
        window.location.href = "/Chiongster/homepage"; // Redirect to homepage (optional)
    };
    
    const handleAccept = () => {
        console.log("Button clicked! Hiding cookie notice...");
        setIsVisible(false);
    };

    useEffect(() => {
        // Check if user is logged in
        const profileId = localStorage.getItem("profileId");
        setIsLoggedIn(!!profileId);

        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("tbl_sequence")
                .select("category")
                .neq("category", "Demo Question")
                .order("category", { ascending: true });

            if (error) {
                console.error("Error fetching categories:", error);
            } else {
                setCategories(data);
            }

            const { data: userRoleData, error: userRoleDataError } = await supabase
                .from("profiles")
                .select("role_id, is_PA, is_Physics")
                .eq("id", profileId);


            if (userRoleDataError) {
                console.error("Error fetching role data:", userRoleDataError);
            } else {
                setUserRole(userRoleData);
            }
        };

        if (profileId) {
        fetchCategories();
        }
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            let { data: questionsData, error: questionsError } = await supabase
                .from("questions")
                .select("*")
                .eq('question_type', 'single');

            if (questionsError) {
                console.error("Error fetching questions:", questionsError);
                return;
            }

            setOriginalQuestions(questionsData);

            // Fetch saved progress from database
            const { data: progressData, error: progressError } = await supabase
                .from("user_quiz_progress")
                .select("*")
                .eq("user_id", userId)
                .eq("quiz_type", "single")
                .order("cycle", { ascending: false }) // Get the latest cycle first
                .limit(1)
                .single();

            console.log(progressData);

            if (progressData) {
                // Restore progress from database
                const savedProgress = JSON.parse(progressData.progress_data);

                if (savedProgress.completed) {
                    const newCycle = savedProgress.cycle + 1;
                    setCycle(newCycle);

                    const shuffledQuestions = shuffleArray(questionsData);
                    setQuestions(shuffledQuestions);
                    resetProgress(shuffledQuestions, newCycle); // Pass new cycle value
                } else if (savedProgress.currentIndex == 0) {
                    // 继续上次进度
                    setCycle(savedProgress.cycle || 1);
                    setCurrentIndex(savedProgress.currentIndex || 0);
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
                    console.log(reorderedQuestions);
                } 
                else {
                    // 继续上次进度
                    setCycle(savedProgress.cycle || 1);
                    setCurrentIndex((savedProgress.currentIndex || 0) + 1);
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
                    console.log(reorderedQuestions);
                }
            } else {
                // 没有进度，开始新的 cycle
                setCycle(1);
                const shuffledQuestions = shuffleArray(questionsData);
                setQuestions(shuffledQuestions);
                resetProgress(shuffledQuestions);
            }
        };

        fetchQuestions();
    }, [userId]);

    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const resetProgressOld = async (newQuestions) => {
        const newProgress = {
            cycle,
            currentIndex: 0,
            selectedAnswers: {},
            correctAnswersCount: 0,
            correctQuestions: [],
            incorrectQuestions: [],
            questionOrder: newQuestions.map((q) => q.id),
            completed: false,
        };

        await supabase.from("user_quiz_progress").upsert({
            user_id: userId,
            quiz_type: "single",
            progress_data: JSON.stringify(newProgress),
        });

        localStorage.setItem(`quizProgress_${userId}`, JSON.stringify(newProgress));
    };

    const resetProgress = async (newQuestions, newCycle) => {
        const newProgress = {
            cycle: newCycle, // Use new cycle number
            currentIndex: 0,
            selectedAnswers: {},
            correctAnswersCount: 0,
            correctQuestions: [],
            incorrectQuestions: [],
            questionOrder: newQuestions.map((q) => q.id),
            completed: false,
        };
    
        await supabase.from("user_quiz_progress").insert({
            user_id: userId,
            quiz_type: "single",
            cycle: newCycle, // Ensure each cycle is stored separately
            progress_data: JSON.stringify(newProgress),
        });
    
        localStorage.setItem(`quizProgress_${userId}`, JSON.stringify(newProgress));
    };
    

    const saveProgress = async (isComplete = false) => {
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

        console.log("Before Saving:", JSON.stringify(progress));

        console.log("Cycle:", cycle);

        const { error } = await supabase
            .from("user_quiz_progress")
            .update({ progress_data: JSON.stringify(progress) })
            .eq("user_id", userId)
            .eq("cycle", cycle);

        localStorage.setItem(`quizProgress_${userId}`, JSON.stringify(progress));
    };

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

    const handleSubmit = () => {
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

        if (isCorrect) {
            setCorrectAnswersCount(prev => prev + 1);
            setCorrectQuestions(prev => [...prev, currentIndex]);
        } else {
            setIncorrectQuestions(prev => [...prev, currentIndex]);
        }

        saveProgress(); // 保存进度
    };

    const handleNext = () => {
        setSubmitted(false);
        setShowExplanation(false);
    
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            saveProgress(); // Save progress for each step
        }
    };
    
    const handleFinalSubmit = async () => {
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
    
        console.log("Final Progress:", finalProgress);
    
        await supabase
            .from("user_quiz_progress")
            .update({ progress_data: JSON.stringify(finalProgress) })
            .eq("user_id", userId)
            .eq("cycle", cycle);
    
        localStorage.setItem(`quizProgress_${userId}`, JSON.stringify(finalProgress));
    
        setShowResults(true); // Show all answered questions
    };

    return (
        <div className="dashboard-container">
        
            {/* Sidebar */}
            <UserSidebar />

            <main className="main-content">
                <UserHeader profile={userRole}/>

                <div className="question-display-container" style={{
                    display: "flex",
                    backgroundColor: "white",
                    minHeight: "100vh",
                    fontFamily: "Poppins"
                }}>
                    {/* Sidebar */}
                    <div className="sidebar-progress" style={{
                        width: "300px",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        paddingTop: "40px",
                        boxShadow: "2px 0 4px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ fontWeight: "600", fontSize: "18px", marginBottom: "16px" }}>TEST BY MODULES</h3>

                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            backgroundColor: "#004d47",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: "16px"
                        }}>
                            <img src="/path/to/your/icon.png" alt="module icon" style={{ width: "50%", height: "50%" }} />
                        </div>

                        <div style={{
                            backgroundColor: "#00796b",
                            padding: "12px 24px",
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "4px",
                            marginBottom: "24px"
                        }}>
                            Gastrointestinal
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            justifyContent: "center"
                        }}>
                            {questions.map((_, index) => {
                                let backgroundColor = "#e0e0e0"; // default

                                if (index === currentIndex) backgroundColor = "#b2dfdb";
                                else if (correctQuestions.includes(index)) backgroundColor = "#80cbc4";
                                else if (incorrectQuestions.includes(index)) backgroundColor = "#ef9a9a";

                                return (
                                    <div key={index} style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor,
                                        fontWeight: "bold"
                                    }}>
                                        {index + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="question-content" style={{
                        flex: 1,
                        padding: "48px",
                        maxWidth: "calc(100% - 300px)"
                    }}>
                        {!showResults ? (
                            <>
                                <h3 style={{ fontWeight: "600" }}>
                                    {currentIndex + 1}. {questions[currentIndex].question_text}
                                </h3>

                                {JSON.parse(questions[currentIndex].options).map((optionText, index) => {
                                    const letter = String.fromCharCode(65 + index);
                                    const isCorrect = (questions[currentIndex].correct_answer || "").split(",").map(a => a.trim()).includes(letter);
                                    const isSelected = selectedAnswers[currentIndex]?.includes(letter);
                                    const isIncorrect = isSelected && !isCorrect;

                                    return (
                                        <div key={index} style={{
                                            padding: "12px 16px",
                                            border: "1px solid #ccc",
                                            borderRadius: "8px",
                                            marginBottom: "12px",
                                            backgroundColor: submitted ? (isCorrect ? "#c8e6c9" : isIncorrect ? "#ffcdd2" : "#fff") : "#fff"
                                        }}>
                                            <label style={{ display: "flex", alignItems: "center", cursor: submitted ? "default" : "pointer" }}>
                                                <input
                                                    type={questions[currentIndex].question_type === "multiple" ? "checkbox" : "radio"}
                                                    name="answer"
                                                    value={letter}
                                                    checked={isSelected}
                                                    disabled={submitted}
                                                    onChange={() => handleSelectAnswer(letter)}
                                                    style={{ marginRight: "10px" }}
                                                />
                                                <span>{letter}. {optionText}</span>
                                            </label>
                                        </div>
                                    );
                                })}

                                <div style={{ marginTop: "24px" }}>
                                    {!submitted ? (
                                        <button onClick={handleSubmit} style={{
                                            padding: "14px 40px",
                                            fontSize: "16px",
                                            borderRadius: "12px",
                                            backgroundColor: "#00796b",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer"
                                        }}>Submit</button>
                                    ) : (
                                        <>
                                            {currentIndex < questions.length - 1 ? (
                                                <button onClick={handleNext} style={{
                                                    padding: "14px 40px",
                                                    fontSize: "16px",
                                                    borderRadius: "12px",
                                                    backgroundColor: "#00796b",
                                                    color: "white",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}>Next</button>
                                            ) : (
                                                <button onClick={handleFinalSubmit} style={{
                                                    padding: "14px 40px",
                                                    fontSize: "16px",
                                                    borderRadius: "12px",
                                                    backgroundColor: "#00796b",
                                                    color: "white",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}>Final Submit</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div>
                                <h2>Results</h2>
                                <p>Correct Answers: {correctAnswersCount}/{questions.length}</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Module2A;
