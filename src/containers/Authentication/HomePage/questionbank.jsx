import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import "./index.css";
import BackButton from "../../../components/Button/BackArrowButton";

const QuestionBank = () => {
    const { categoryParam } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [timer, setTimer] = useState(null);
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data: sequenceData, error: sequenceError } = await supabase
                .from("tbl_sequence")
                .select("*")
                .eq("category", categoryParam)
                .single();

            if (sequenceError) {
                console.error("Error fetching sequence:", sequenceError);
                return;
            }

            const { shuffle, timer: fetchedTimer } = sequenceData;
            const questionIds = sequenceData.sequence.map(seq => seq.id);

            const { data: questionsData, error: questionsError } = await supabase
                .from("questions")
                .select("*")
                .in("id", questionIds);

            if (questionsError) {
                console.error("Error fetching questions:", questionsError);
                return;
            }

            setQuestions(shuffle ? shuffleArray(questionsData) : questionsData);
            
            if (fetchedTimer) {
                setTimer(fetchedTimer * 60);
            }
        };

        fetchQuestions();
    }, [categoryParam]);

    useEffect(() => {
        if (timer !== null && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    const newTime = prev - 1;
                    return newTime;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            setShowResults(true);
        }
    }, [timer]);

    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handleSelectAnswer = (value) => {
        const currentQuestion = questions[currentIndex];
        if (currentQuestion.question_type === "multiple") {
            setSelectedAnswers(prev => {
                const updated = prev[currentIndex] ? [...prev[currentIndex]] : [];
                return updated.includes(value)
                    ? { ...prev, [currentIndex]: updated.filter(v => v !== value) }
                    : { ...prev, [currentIndex]: [...updated, value] };
            });
        } else {
            setSelectedAnswers({ ...selectedAnswers, [currentIndex]: [value] });
        }
    };

    const correctAnswersCount = questions.reduce((count, question, index) => {
        const userAnswer = selectedAnswers[index] || [];
        let correctAnswer = question?.correct_answer;
        
        if (!Array.isArray(correctAnswer)) {
            correctAnswer = correctAnswer ? [correctAnswer] : [];
        }

        return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort()) ? count + 1 : count;
    }, 0);

    return (
        <div className="question-display-container" style={{ backgroundColor: "white", minHeight: "100vh", padding: "24px" }}>
            <BackButton to="/homepage" />
            <h2>Question Bank: {categoryParam}</h2>

            {timer !== null && !showResults && (
                <div className="timer">
                    <strong>Time Left:</strong> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </div>
            )}

            {!showResults ? (
                questions.length > 0 && (
                    <div>
                        <h2>{questions[currentIndex].question_text}</h2>
                        {["single", "multiple"].includes(questions[currentIndex].question_type) && (
                            <div>
                                {JSON.parse(questions[currentIndex].options).map((optionText, index) => {
                                    const letter = String.fromCharCode(65 + index);
                                    return (
                                        <div key={index} className="option">
                                            <input
                                                type={questions[currentIndex].question_type === "multiple" ? "checkbox" : "radio"}
                                                name="answer"
                                                value={letter}
                                                checked={
                                                    questions[currentIndex].question_type === "multiple"
                                                        ? Array.isArray(selectedAnswers[currentIndex]) && selectedAnswers[currentIndex].includes(letter)
                                                        : selectedAnswers[currentIndex]?.[0] === letter
                                                }
                                                onChange={() => handleSelectAnswer(letter)}
                                            />
                                            {letter}. {optionText}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button onClick={handleNext} disabled={!selectedAnswers[currentIndex]}>
                            {currentIndex < questions.length - 1 ? "Next" : "Submit"}
                        </button>
                    </div>
                )
            ) : (
                <div>
                    <h2>Results</h2>
                    <p>Correct Answers: {correctAnswersCount}/{questions.length}</p>
                    <p>Percentage: {((correctAnswersCount / questions.length) * 100).toFixed(2)}%</p>
                    <button onClick={() => setShowReview(true)}>Review All Questions</button>

                    {showReview && (
                        <div className="review-container">
                            {questions.map((question, index) => (
                                <div key={index} className="question-card">
                                    <h3 className="question-title">Q{index + 1}: {question.question_text}</h3>
                                    
                                    <div className="answer-section">
                                        <p><strong>Correct Answer:</strong> 
                                            <span className="correct-answer"> {Array.isArray(question.correct_answer) ? question.correct_answer.join(", ") : question.correct_answer}</span>
                                        </p>
                                        <p><strong>Your Answer:</strong> 
                                            <span className={`user-answer ${selectedAnswers[index] === question.correct_answer ? 'correct' : 'incorrect'}`}>
                                                {Array.isArray(selectedAnswers[index]) ? selectedAnswers[index].join(", ") : selectedAnswers[index] || "No Answer"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="explanation-section">
                                        <strong>Explanation:</strong>
                                        <div className="explanation-box" dangerouslySetInnerHTML={{ __html: question.explanation || "No explanation provided." }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                </div>
            )}
        </div>
    );
};

export default QuestionBank;
