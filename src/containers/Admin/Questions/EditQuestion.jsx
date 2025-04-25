import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import "katex/dist/katex.min.css";
import katex from "katex";
import JoditEditor from "jodit-react";
import "./CreateBooking.css";

import BackButton from "../../../components/Button/BackArrowButton";
import Toast from "../../../components/Toast";
import PlainInput from "../../../components/Input/PlainInput";

const EditQuestion = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        question_text: "",
        question_type: "",
        options: [],
        correct_answer: "",
        explanation: "",
        sub_category: "",
    });

    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: questionData, error } = await supabase
                    .from("questions")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setFormData({
                    question_text: questionData.question_text,
                    question_type: questionData.question_type,
                    options: JSON.parse(questionData.options || "[]"),
                    correct_answer: questionData.correct_answer,
                    explanation: questionData.explanation,
                    sub_category: questionData.sub_category,
                });

            } catch (error) {
                console.error("Error fetching question:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formattedOptions = JSON.stringify(formData.options);
            const { error } = await supabase.from("questions").update({
                question_text: formData.question_text,
                options: formattedOptions,
                correct_answer: formData.correct_answer,
                explanation: formData.explanation,
                modified_at: new Date().toISOString(),
            }).eq("id", id);

            if (error) throw error;

            showToast("Question updated successfully!", "success");
            navigate("/admin/questions/2A");
        } catch (error) {
            setError(error.message);
            showToast(`Error updating question: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    // Generate correct answer choices (A, B, C, D...)
    const getAnswerChoices = (numOptions) => {
        return Array.from({ length: numOptions }, (_, i) => ({
            label: String.fromCharCode(65 + i), // A, B, C, D...
            value: String.fromCharCode(65 + i),
        }));
    };

    return (
        <div className="edit-question-container">
            <BackButton style={{background: 'white'}} to="/admin/questions/2A" />
            <h2>Edit Part 2A Question</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            {error && <div className="error-message">{error}</div>}

            {/* Scrollable Form */}
            <div className="form-scrollable" style={{fontFamily: 'Poppins'}}>
                <form onSubmit={handleSubmit} className="edit-question-form">
                    <PlainInput
                        label="Question"
                        type="text"
                        value={formData.question_text}
                        onChange={(e) => setFormData((prev) => ({ ...prev, question_text: e.target.value }))}
                        required
                    />

                    {/* Read-Only Sub Category */}
                    <div className="field-container">
                        <label>Sub Category:</label>
                        <p className="readonly-field">{formData.sub_category}</p>
                    </div>

                    {/* Read-Only Question Type */}
                    <div className="field-container">
                        <label>Question Type:</label>
                        <p className="readonly-field">{formData.question_type}</p>
                    </div>

                    {/* Options for Single Choice & Multiple Choice */}
                    {(formData.question_type === "single" || formData.question_type === "multiple") && (
                        <div>
                            <label>Options</label>
                            {formData.options.map((option, index) => (
                                <div key={index} className="option-container">
                                    <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [...formData.options];
                                            newOptions[index] = e.target.value;
                                            setFormData((prev) => ({ ...prev, options: newOptions }));
                                        }}
                                        className="enhanced-input"
                                        style={{ width: '1000px' }}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Correct Answer Dropdown (A, B, C, D...) */}
                    <div className="field-container">
                        <label>Correct Answer</label>
                        <select
                            value={formData.correct_answer}
                            onChange={(e) => setFormData((prev) => ({ ...prev, correct_answer: e.target.value }))}
                            className="enhanced-input"
                            required
                        >
                            <option value="">Select Answer</option>
                            {getAnswerChoices(formData.options.length).map((choice) => (
                                <option key={choice.value} value={choice.value}>
                                    {choice.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Explanation */}
                    <div className="field-container">
                        <label>Explanation:</label>
                        <JoditEditor 
                                value={formData.explanation} 
                                onChange={(value) => setFormData((prev) => ({ ...prev, explanation: value }))} 
                                className="enhanced-input"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading} style={{marginBottom: '20px'}}>
                        {loading ? "Updating..." : "Update"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditQuestion;
