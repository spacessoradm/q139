import React, { useState, useEffect } from "react";
import supabase from "../../../config/supabaseClient";
import "./index.css";
import { ChevronDown, Check, ArrowUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';


const QuestionDisplay = () => {
    // navigation stuff here
    const userId = localStorage.getItem("profileId");
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState('');

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0); // Only increase after submission
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);

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
                .neq('question_type', 'subq');

            if (questionsError) {
                console.error("Error fetching questions:", questionsError);
                return;
            }

            setQuestions(shuffleArray(questionsData));
        };

        fetchQuestions();
    }, []);

    const shuffleArray = (array) => {
        let shuffled = [...array]; 
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; 
        }
        return shuffled;
    };

    const handleSelectAnswer = (value) => {
        const currentQuestion = questions[currentIndex];
        if (currentQuestion.question_type === "multiple") {
            setSelectedAnswers(prev => {
                const updated = prev[currentIndex] ? [...prev[currentIndex]] : [];
                return { ...prev, [currentIndex]: updated.includes(value) ? updated.filter(v => v !== value) : [...updated, value] };
            });
        } else {
            setSelectedAnswers({ ...selectedAnswers, [currentIndex]: [value] });
        }
    };

    const handleSubmit2 = () => {
        setSubmitted(true);
        setShowExplanation(true);

        const question = questions[currentIndex];
        const userAnswerRaw = selectedAnswers[currentIndex] || [];
        const userAnswer = Array.isArray(userAnswerRaw) ? userAnswerRaw : [userAnswerRaw];

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
        }
    };

    const handleSubmit = () => {
        setSubmitted(true);
        setShowExplanation(true);
    
        const question = questions[currentIndex];
        const userAnswerRaw = selectedAnswers[currentIndex] || [];
        const userAnswer = Array.isArray(userAnswerRaw) ? userAnswerRaw : [userAnswerRaw];
    
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
            setCorrectQuestions(prev => [...prev, currentIndex]); // Store correct question index
        } else {
            setIncorrectQuestions(prev => [...prev, currentIndex]); // Store incorrect question index
        }
    };
    

    const handleNext = () => {
        setSubmitted(false);
        setShowExplanation(false);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handleShowExplanation = () => {
        setShowExplanation(true);
    };

    return (

        <main className="main">
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
                <a href="/Chiongster/demo" className="btn btn-dashboard">
                    Try a Demo
                </a>
                </>
            )}
                </div>
            </header>

            <div className="question-display-container" style={{ backgroundColor: "white", minHeight: "100vh", padding: "24px", display: "flex", fontFamily: "Poppins" }}>
                <div className="sidebar" style={{ flex: "30%", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px" }}>
                    <div className="score-section" style={{ textAlign: "center", marginBottom: "16px" }}>
                        <h3>Sample of 2A Test</h3>
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
                                    {index + 1}
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

                                {(() => {
                                    let correctAnswers = [];
                                    try {
                                        if (Array.isArray(questions[currentIndex].correct_answer)) {
                                            // If already an array, use it directly
                                            correctAnswers = questions[currentIndex].correct_answer;
                                        } else if (typeof questions[currentIndex].correct_answer === "string") {
                                            // If it's a comma-separated string like "A,B", split it into an array
                                            correctAnswers = questions[currentIndex].correct_answer.includes(",")
                                                ? questions[currentIndex].correct_answer.split(",").map(a => a.trim()) 
                                                : [questions[currentIndex].correct_answer]; 
                                        }
                                    } catch (error) {
                                        console.error("Invalid correct_answer format:", error);
                                    }
                                    
                                    return JSON.parse(questions[currentIndex].options).map((optionText, index) => {
                                        const letter = String.fromCharCode(65 + index); // A, B, C, D
                                        const isCorrect = correctAnswers.includes(letter);
                                        const isSelected = selectedAnswers[currentIndex]?.includes(letter);
                                        const isIncorrect = isSelected && !isCorrect;

                                        return (
                                            <div 
                                                key={index} 
                                                className={`option ${isSelected ? "selected" : ""} 
                                                    ${submitted ? (isCorrect ? "correct" : isIncorrect ? "wrong" : "") : ""}`}
                                                onClick={() => !submitted && handleSelectAnswer(letter)}
                                                style={{ border: "1px solid #000000", marginBottom: "20px" }}
                                            >
                                                <input
                                                    type={questions[currentIndex].question_type === "multiple" ? "checkbox" : "radio"}
                                                    name="answer"
                                                    value={letter}
                                                    checked={isSelected}
                                                    disabled={submitted} 
                                                    onChange={() => handleSelectAnswer(letter)}
                                                    style={{ display: "none" }} // Hide default input
                                                />
                                                {letter}. {optionText}
                                            </div>
                                        );
                                    });
                                })()}

                                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                                    {!submitted ? (
                                        <button 
                                            onClick={handleSubmit} 
                                            disabled={!selectedAnswers[currentIndex]} 
                                            style={{ width: "20%"}} // Adjust max-width as needed
                                        >
                                            Submit
                                        </button>
                                    ) : (
                                        <button disabled style={{ display: "none" }}>Submitted</button>
                                    )}

                                    {submitted && (
                                        <button 
                                            onClick={handleNext} 
                                            style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }} // Adjust spacing
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>


                                {submitted && showExplanation && (
                                    <div 
                                        className="explanation"
                                        style={{ border: "1px solid #000000", borderRadius: "5px", marginTop: "10px"}} // Adjust spacing
                                    >
                                        <h3
                                            style={{ backgroundColor: "lightgreen", padding: "8px", textAlign: "center"}}
                                        >
                                            Explanation
                                        </h3>
                                        <div style={{padding: '12px'}} dangerouslySetInnerHTML={{ __html: questions[currentIndex].explanation }} />
                                    </div>
                                )}

                            </div>
                        )
                    ) : (
                        <div>
                            <h2>Results</h2>
                            <p>Correct Answers: {correctAnswersCount}/{questions.length}</p>
                            <button onClick={handleShowExplanation}>Show Explanations</button>
                            {showExplanation && (
                                <div className="explanation-container">
                                    {questions.map((q, index) => (
                                        <div key={index} className="explanation-card">
                                            <h3>Q{index + 1}: {q.question_text}</h3>
                                            <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
                                            <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </main>
    );
};

export default QuestionDisplay;
