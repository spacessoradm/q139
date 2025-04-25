import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './index.css';
import './PreviewQ.css';
import Toast from '../../../components/Toast';

const PreviewQuestion = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [correctAnswers, setCorrectAnswers] = useState([]);  
    const [showExplanation, setShowExplanation] = useState(false);
    const [answerStatus, setAnswerStatus] = useState({});

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
      const fetchQuestion = async () => {
          if (!id) return;
  
          setLoading(true);
          const { data, error } = await supabase
              .from("questions")
              .select("*")
              .eq("id", id)
              .single();
  
          if (error) {
              console.error("❌ Error fetching question:", error);
              showToast("Error loading question", "error");
          } else {
              console.log("✅ Fetched Question Data:", data);
  
              let options = data.options;
              if (typeof options === "string") {
                  try {
                      options = JSON.parse(options); // If stored as JSON string
                  } catch {
                      options = options.split(",").map(opt => opt.trim()); // If stored as CSV string
                  }
              }
  
              // Ensure correct answer is correctly formatted
              let correctAnswer = data.correct_answer; // Change this based on your DB field name
              correctAnswer = correctAnswer ? (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]) : [];
  
              console.log("✅ Processed Correct Answer:", correctAnswer);
  
              setQuestion({ ...data, options, correctAnswers: correctAnswer });
          }
          setLoading(false);
      };
  
      fetchQuestion();
  }, [id]);
  

    const handleSelectAnswer = (letter) => {
        if (!question) return;
        const { question_type } = question;

        setSelectedAnswers((prev) => {
            let updatedAnswers;

            if (question_type === "multiple") {
                updatedAnswers = prev[id]?.includes(letter)
                    ? prev[id].filter((l) => l !== letter)
                    : [...(prev[id] || []), letter];
            } else {
                updatedAnswers = [letter];
            }

            console.log("🟡 Selected Answers Before Update:", prev); // Debug
            console.log("🟠 Updated Selected Answers:", updatedAnswers); // Debug

            return { ...prev, [id]: updatedAnswers };
        });
    };

    const handleSubmit = () => {
        if (!selectedAnswers[id] || selectedAnswers[id].length === 0) {
            showToast("Please select an answer!", "error");
            return;
        }
    
        console.log("🔴 Submitted Answers:", selectedAnswers[id]); 
        console.log("✅ Correct Answers from Question State:", question.correctAnswers);
    
        setShowExplanation(true); // Ensure this is triggered after submission
    
        const correctAnswersArray = question.correctAnswers || [];
        const newStatus = {};
        let isCorrect = true;
    
        question.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = selectedAnswers[id]?.includes(letter);
            const isCorrectAnswer = correctAnswersArray.includes(letter);
    
            if (isSelected && !isCorrectAnswer) {
                newStatus[letter] = "wrong"; // Mark wrong selected answer
                isCorrect = false;
            } else if (isCorrectAnswer) {
                newStatus[letter] = "correct"; // Mark correct answer
            }
        });
    
        console.log("🔵 Answer Status After Submit:", newStatus); 
    
        setAnswerStatus(newStatus);
        showToast(isCorrect ? "Correct Answer!" : "Wrong Answer!", isCorrect ? "success" : "error");
    };
  
  
  

    return (
        <div className="container" style={{fontFamily: 'Poppins'}}>
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

                            {["single", "multiple"].includes(question.question_type) && (
                                <div>
                                    {question.options.map((optionText, index) => {
                                        const letter = String.fromCharCode(65 + index);
                                        const isSelected = selectedAnswers[id]?.includes(letter);
                                        const statusClass = answerStatus[letter] ? `option ${answerStatus[letter]}` : "option";

                                        return (
                                            <div key={index} className={statusClass}>
                                                <input
                                                    type={question.question_type === "multiple" ? "checkbox" : "radio"}
                                                    name="answer"
                                                    value={letter}
                                                    checked={isSelected}
                                                    onChange={() => handleSelectAnswer(letter)}
                                                    disabled={showExplanation} 
                                                />
                                                {letter}. {optionText}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!selectedAnswers[id]}
                                className="submit-button"
                            >
                                Submit
                            </button>

                            {showExplanation && (
                                <div className="explanation-box">
                                    <h4>Explanation</h4>
                                    <p dangerouslySetInnerHTML={{ __html: question.explanation || "No explanation provided." }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewQuestion;
