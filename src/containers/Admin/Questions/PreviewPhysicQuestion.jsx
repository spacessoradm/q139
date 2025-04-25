import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './index.css';
import './PreviewQ.css';
import Toast from '../../../components/Toast';

const PreviewPhysicQuestion = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [subquestions, setSubquestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showExplanations, setShowExplanations] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);

            // Fetch main question
            const { data: mainQuestion, error: questionError } = await supabase
                .from("questions")
                .select("*")
                .eq("id", id)
                .single();

            // Fetch subquestions related to the main question
            const { data: subquestionsData, error: subquestionsError } = await supabase
                .from("subquestions")
                .select("*")
                .eq("parent_id", id);

            if (questionError || subquestionsError) {
                console.error("Error fetching data:", questionError || subquestionsError);
                showToast("Error loading question", "error");
            } else {
                // Parse correct answers if stored as a string
                const parsedSubquestions = subquestionsData.map(sub => ({
                    ...sub,
                    correct_answer: sub.correct_answer === "true" ? "true" : "false"
                }));

                setQuestion(mainQuestion);
                setSubquestions(parsedSubquestions);
            }

            setLoading(false);
        };

        fetchData();
    }, [id]);

    const handleSelectAnswer = (subId, answer) => {
        if (submitted) return; // Prevent changes after submission
        setSelectedAnswers(prev => ({
            ...prev,
            [subId]: answer
        }));
    };

    const handleSubmit = () => {
        if (Object.keys(selectedAnswers).length === subquestions.length) {
            setShowExplanations(true);
            setSubmitted(true);
            showToast("All answers submitted!", "success");
        } else {
            showToast("Please answer all subquestions before submitting", "error");
        }
    };

    return (
        <div className="container" style={{ fontFamily: 'Poppins'}}>
            <div className='question-container'>
                {loading && <p>Loading question...</p>}
                {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

                {question && (
                    <div className="card">
                        <div className="card-header">
                            <h3>Question Preview</h3>
                        </div>
                        <div className="card-body">
                            <h3>{question.question_text}</h3>

                            {/* Display subquestions */}
                            {subquestions.map((sub, index) => {
                                const userAnswer = selectedAnswers[sub.id]; // User's selected answer
                                const isCorrect = userAnswer === sub.correct_answer; // True if correct
                                const highlightCorrect = submitted && sub.correct_answer;
                                const highlightUserWrong = submitted && userAnswer && !isCorrect;

                                console.log(`Subquestion ${index + 1}:`);
                                console.log("User Answer:", userAnswer);
                                console.log("Correct Answer:", sub.correct_answer);
                                console.log("Is Correct?", isCorrect);
                                console.log("Highlight Correct?", highlightCorrect);
                                console.log("Highlight User Wrong?", highlightUserWrong);
                                
                                return (
                                    <div key={sub.id} className="subquestion" style={{ marginTop: '20px'}}>
                                        <h4>{index + 1}. {sub.subquestion_text}</h4>

                                        <div className="options-group">
                                            {/* TRUE OPTION */}
                                            <label className={`options 
                                                ${submitted && sub.correct_answer === "true" ? "correct-answer" : ""}
                                                ${submitted && userAnswer === "true" && !isCorrect ? "wrong-answer" : ""}
                                                ${submitted && userAnswer === "true" && isCorrect ? "selected-correct" : ""}
                                            `}>
                                                <input
                                                    type="radio"
                                                    name={`subquestion-${sub.id}`}
                                                    value="true"
                                                    checked={userAnswer === "true"}
                                                    onChange={() => handleSelectAnswer(sub.id, "true")}
                                                    disabled={submitted}
                                                />
                                                True
                                            </label>

                                            {/* FALSE OPTION */}
                                            <label className={`options 
                                                ${submitted && sub.correct_answer === "false" ? "correct-answer" : ""}
                                                ${submitted && userAnswer === "false" && !isCorrect ? "wrong-answer" : ""}
                                                ${submitted && userAnswer === "false" && isCorrect ? "selected-correct" : ""}
                                            `}>
                                                <input
                                                    type="radio"
                                                    name={`subquestion-${sub.id}`}
                                                    value="false"
                                                    checked={userAnswer === "false"}
                                                    onChange={() => handleSelectAnswer(sub.id, "false")}
                                                    disabled={submitted}
                                                />
                                                False
                                            </label>
                                        </div>

                                        {/* Explanation (only shown after submission) */}
                                        {showExplanations && (
                                            <div className="explanations-box">
                                                <h4>Explanation</h4>
                                                <p dangerouslySetInnerHTML={{ __html: sub.subquestion_explanation || "No explanation provided." }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Main Question Explanation */}
                            {showExplanations && question.explanation && (
                                <div className="explanation-box">
                                    <h4>Question Explanation</h4>
                                    <p dangerouslySetInnerHTML={{ __html: question.explanation }} />
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(selectedAnswers).length !== subquestions.length || submitted}
                                className="submit-button"
                                style={{ marginTop: '20px'}}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewPhysicQuestion;
