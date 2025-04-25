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
                setQuestion(mainQuestion);
                setSubquestions(subquestionsData);
            }

            setLoading(false);
        };

        fetchData();
    }, [id]);

    const handleSelectAnswer = (subId, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [subId]: answer
        }));
    };

    const handleSubmit = () => {
        if (Object.keys(selectedAnswers).length === subquestions.length) {
            setShowExplanations(true);
            showToast("All answers submitted!", "success");
        } else {
            showToast("Please answer all subquestions before submitting", "error");
        }
    };

    return (
        <div className="container">
            <div className='venue-container'>
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
                            {subquestions.map((sub, index) => (
                                <div key={sub.id} className="subquestion">
                                    <h4>{index + 1}. {sub.subquestion_text}</h4>

                                    <div className="options-group">
                                        <label className="options">
                                            <input
                                                type="radio"
                                                name={`subquestion-${sub.id}`}
                                                value="true"
                                                checked={selectedAnswers[sub.id] === "true"}
                                                onChange={() => handleSelectAnswer(sub.id, "true")}
                                            />
                                            True
                                        </label>
                                        <label className="options">
                                            <input
                                                type="radio"
                                                name={`subquestion-${sub.id}`}
                                                value="false"
                                                checked={selectedAnswers[sub.id] === "false"}
                                                onChange={() => handleSelectAnswer(sub.id, "false")}
                                            />
                                            False
                                        </label>
                                    </div>

                                    {/* Explanation (hidden until all subquestions answered and submitted) */}
                                    {showExplanations && (
                                        <div className="explanations-box">
                                            <h4>Explanation</h4>
                                            <p dangerouslySetInnerHTML={{ __html: sub.subquestion_explanation || "No explanation provided." }} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Main Question Explanation (Shown Before Submit Button) */}
                            {showExplanations && question.explanation && (
                                <div className="explanation-box">
                                    <h4>Question Explanation</h4>
                                    <p dangerouslySetInnerHTML={{ __html: question.explanation }} />
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(selectedAnswers).length !== subquestions.length}
                                className="submit-button"
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
