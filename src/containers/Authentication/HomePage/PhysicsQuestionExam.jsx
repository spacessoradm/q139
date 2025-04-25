import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import supabase from "../../../config/supabaseClient";
import "./index.css";
import "./physicQ.css";
import { ChevronDown, Check, ArrowUp } from "lucide-react"

const PhysicsQuestionExam = () => {
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
                .select("role_id")
                .eq("id", profileId);


            console.log(userRoleData);

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
                .eq('question_type', 'subq');

            if (questionsError) {
                console.error("Error fetching questions:", questionsError);
                return;
            }

            const questionList = [];

            for (const question of questionsData) {
                const { data: subquestionsData, error: subquestionError } = await supabase
                    .from("subquestions")
                    .select("id, subquestion_text, subquestion_answer, subquestion_explanation")
                    .eq("parent_id", question.id);

                if (subquestionError) {
                    console.error("Error fetching subquestions:", subquestionError);
                    return;
                }

                if (subquestionsData.length === 5) {
                    questionList.push({
                        id: question.id,
                        question_text: question.question_text,
                        explanation: question.explanation,
                        subquestions: subquestionsData
                    });
                }
            }

            setOriginalQuestions(questionList);

            // Fetch saved progress from database
            const { data: progressData, error: progressError } = await supabase
                .from("user_quiz_progress")
                .select("*")
                .eq("user_id", userId)
                .eq("quiz_type", "subq")
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
                    setCycle(savedProgress.cycle || 1);
                    setCurrentIndex(savedProgress.currentIndex || 0);
                    setSelectedAnswers(savedProgress.selectedAnswers || {});
                    setCorrectAnswersCount(savedProgress.correctAnswersCount || 0);
                    setCorrectQuestions(savedProgress.correctQuestions || []);
                    setIncorrectQuestions(savedProgress.incorrectQuestions || []);
                    

                    const reorderedQuestions = savedProgress.questionOrder
                        ? savedProgress.questionOrder.map((id) =>
                            questionList.find((q) => q.id === id) // ✅ Use `questionList` instead of `questionsData`
                        )
                        : questionList; // ✅ Ensure we use the version with subquestions


                    setQuestions(reorderedQuestions);
                    console.log(reorderedQuestions);
                } else {
                    setCycle(savedProgress.cycle || 1);
                    setCurrentIndex((savedProgress.currentIndex || 0) + 1);
                    setSelectedAnswers(savedProgress.selectedAnswers || {});
                    setCorrectAnswersCount(savedProgress.correctAnswersCount || 0);
                    setCorrectQuestions(savedProgress.correctQuestions || []);
                    setIncorrectQuestions(savedProgress.incorrectQuestions || []);
                    

                    const reorderedQuestions = savedProgress.questionOrder
                        ? savedProgress.questionOrder.map((id) =>
                            questionList.find((q) => q.id === id) // ✅ Use `questionList` instead of `questionsData`
                        )
                        : questionList; // ✅ Ensure we use the version with subquestions


                    setQuestions(reorderedQuestions);
                    console.log(reorderedQuestions);
                }
            } else {
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
            quiz_type: "subq",
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
            quiz_type: "subq",
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

    const handleSelectAnswer = (subqId, value) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [subqId]: value
        }));
    };
    
    const allSubquestionsAnswered = (questionId) => {
        const relatedSubquestions = subquestions.filter((sq) => sq.parent_id === questionId);
        return relatedSubquestions.every((sq) => selectedAnswers[sq.id] && selectedAnswers[sq.id].length > 0);
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
        <main className="main">
            {/* Top navigation bar */}

            {/* Main navigation */}
            <header className="main-nav" style={{ fontFamily: 'Poppins' }}>
                <div className="flex items-center">
                <a href="/Chiongster/homepage" className="logo">
                    <img src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg" alt="logo" style={{ width: '100px', height: '100px' }} />
                </a>
                </div>

                <nav className="nav-menu">
                <div className="nav-item">
                    <span className="text-gray-600">Product</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <div className="nav-item">
                    <span className="text-gray-600">Use cases</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                <a href="#" className="nav-link">
                    Pricing
                </a>
                <div className="nav-item">
                    <span className="text-gray-600">Resources</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-600" />
                </div>
                {isLoggedIn && (
                <div className="nav-item relative">
                    <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                    <span className="text-gray-600">Question Bank</span>
                    <ChevronDown
                        className={`h-4 w-4 ml-1 text-gray-600 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                    </div>

                    {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <a
                          href={isLoggedIn ? "exam" : "#"}
                          aria-disabled={!isLoggedIn}
                          onClick={(e) => !isLoggedIn && e.preventDefault()} // Prevent navigation
                      >
                          2A Exam
                      </a>
                    </div>
                    )}
                </div>
                )}
                </nav>

                <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                <>
                <a
                    href={isLoggedIn ? (userRole[0]?.role_id === 1 ? "admin/dashboard" : "user/examrecords") : "#"}
                    className={`btn btn-dashboard ${!isLoggedIn ? "disabled-link" : ""}`}
                    aria-disabled={!isLoggedIn}
                    onClick={(e) => !isLoggedIn && e.preventDefault()} // Prevent navigation when not logged in
                >
                    Dashboard
                </a>

                <button onClick={handleSignOut} className="btn btn-outline">
                    Sign Out
                </button>
                </>
            ) : (
                <>
                <a href="/Chiongster/login" className="btn btn-outline">
                    Sign in
                </a>
                <a href="/Chiongster/demo" className="btn btn-primary">
                    Try a Demo
                </a>
                </>
            )}
                </div>
            </header>
            <div className="question-display-container" style={{ backgroundColor: "white", minHeight: "100vh", padding: "24px", display: "flex", fontFamily: "Poppins"  }}>
                <div className="sidebar" style={{ flex: "30%", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px" }}>
                    <div className="score-section" style={{ textAlign: "center", marginBottom: "16px" }}>
                        <h3>Score: {((correctAnswersCount / questions.length) * 100).toFixed(1)}%</h3>
                        <h4>Points: {correctAnswersCount} / {questions.length}</h4>
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
                    maxWidth: "70%",  // Ensures it does not exceed 70% width
                    alignSelf: "flex-start", // Prevents it from stretching
                    flexShrink: 0, // Prevents shrinking when space is available
                    flexGrow: 0, }}>
                    {!showResults ? (
                        questions.length > 0 && (
                            <div>
                                <h2>{questions[currentIndex].question_text}</h2>
                                
                                {/* Iterate through subquestions */}
                                {questions[currentIndex].subquestions.map((subq, subIndex) => {
                                    const userAnswer = selectedAnswers[subq.id] || ""; // User's selected answer
                                    const correctAnswer = subq.subquestion_answer; // Correct answer
                                    const isCorrect = submitted && userAnswer === correctAnswer; // User got it right
                                    const isIncorrect = submitted && userAnswer !== correctAnswer; // User got it wrong

                                    return (
                                        <div key={subq.id} className="subquestion">
                                            {/* Subquestion Text */}
                                            <h4 style={{ paddingTop: "16px" }}>{subIndex + 1}. {subq.subquestion_text}</h4>

                                            {/* True Option */}
                                            <label 
                                                className={`option ${
                                                    submitted 
                                                        ? userAnswer === "true" 
                                                            ? (isCorrect ? "correct" : "wrong") // Highlight selected answer
                                                            : (correctAnswer === "true" ? "correct" : "") // Highlight correct answer if wrong
                                                        : ""
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`subq-${subq.id}`}
                                                    value="true"
                                                    checked={userAnswer === "true"}
                                                    onChange={() => handleSelectAnswer(subq.id, "true")}
                                                    disabled={submitted}
                                                />
                                                True
                                            </label>

                                            {/* False Option */}
                                            <label 
                                                className={`option ${
                                                    submitted 
                                                        ? userAnswer === "false" 
                                                            ? (isCorrect ? "correct" : "wrong") // Highlight selected answer
                                                            : (correctAnswer === "false" ? "correct" : "") // Highlight correct answer if wrong
                                                        : ""
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`subq-${subq.id}`}
                                                    value="false"
                                                    checked={userAnswer === "false"}
                                                    onChange={() => handleSelectAnswer(subq.id, "false")}
                                                    disabled={submitted}
                                                />
                                                False
                                            </label>

                                            {/* Show Explanation Only After Submission */}
                                            {submitted && subq.subquestion_explanation && (
                                                <p 
                                                    className="explanation"
                                                    dangerouslySetInnerHTML={{ __html: subq.subquestion_explanation }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                                {submitted && questions[currentIndex].explanation && (
                                    <div className="main-explanation">
                                        <h3>Explanation:</h3>
                                        <p dangerouslySetInnerHTML={{ __html: questions[currentIndex].explanation }} />
                                    </div>
                                )}


                                {!submitted ? (
                                    <button onClick={handleSubmit}>Submit</button>
                                ) : (
                                    <>
                                        {currentIndex < questions.length - 1 ? (
                                            <button onClick={handleNext}>Next</button>
                                        ) : (
                                            <button onClick={handleFinalSubmit}>Final Submit</button>
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    ) : (
                        <div>
                            <h2>Results</h2>
                            <p>Correct Answers: {correctAnswersCount}/{questions.length}</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default PhysicsQuestionExam;
