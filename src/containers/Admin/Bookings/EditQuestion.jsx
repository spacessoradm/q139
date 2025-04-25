import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import './CreateBooking.css';

import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from "../../../components/Input/PlainInput";
import SingleSelect from "../../../components/Input/SingleSelect";

const EditQuestion = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [formData, setFormData] = useState({
        question_text: '',
        question_type: '',
        options: [],
        correct_answer: '',
        explanation: '',
        sub_category: '',
    });

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: questionData, error } = await supabase
                    .from("questions")
                    .select("*")
                    .eq("id", id)  // Assuming questionId is passed via props or route params
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

                console.log(formData.sub_category)
    
            } catch (error) {
                console.error("Error fetching question:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [id]); // Fetch data when questionId changes
    
    useEffect(() => {
        const fetchSubCategories = async () => {
            const { data, error } = await supabase.from('question_subcategory').select('subcategory_name');
            if (error) {
                console.error('Error fetching subcategories:', error);
            } else {
                const formattedSubCategories = data.map(sub => ({
                    label: sub.subcategory_name,
                    value: sub.subcategory_name
                }));
                setSubCategories(formattedSubCategories);
    
                // Ensure sub_category is set if it exists in the list
                if (formData.sub_category) {
                    const foundCategory = formattedSubCategories.find(sub => sub.value === formData.sub_category);
                    if (foundCategory) {
                        setFormData(prev => ({ ...prev, sub_category: foundCategory.value }));
                    }
                }
            }
        };
    
        fetchSubCategories();
    }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formattedOptions = JSON.stringify(formData.options);
            const { error } = await supabase.from('questions').update({
                question_text: formData.question_text,
                question_type: formData.question_type,
                options: formattedOptions,
                correct_answer: formData.correct_answer,
                explanation: formData.explanation,
                sub_category: formData.sub_category,
                modified_at: new Date().toISOString(),
            }).eq('id', id);

            if (error) throw error;

            showToast("Question updated successfully!", "success");
            navigate('/admin/bookings');
        } catch (error) {
            setError(error.message);
            showToast(`Error updating question: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container">
            <BackButton to="/admin/bookings" />   
            <h2>Edit Part 2A Question</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <PlainInput
                        label="Question"
                        type="text"
                        value={formData.question_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                        required
                    />

                    <SingleSelect
                        label="Sub Category"
                        value={formData.sub_category}
                        onChange={(value) => setFormData(prev => ({ ...prev, sub_category: value }))}
                        options={subCategories}
                        required
                    />

                    <SingleSelect
                        label="Question Type"
                        value={formData.question_type}
                        onChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}
                        options={[
                            { label: "Single Option", value: "single" },
                            { label: "True/False", value: "trueFalse" },
                            { label: "Multiple Choice", value: "multiple" },
                            { label: "Sub-Questions", value: "subq" },
                        ]}
                        required
                    />

                    {(formData.question_type === "single" || formData.question_type === "multiple") && (
                        <div>
                            <label>Options</label>
                            {formData.options.map((option, index) => (
                                <PlainInput
                                    key={index}
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...formData.options];
                                        newOptions[index] = e.target.value;
                                        setFormData(prev => ({ ...prev, options: newOptions }));
                                    }}
                                    required
                                />
                            ))}
                        </div>
                    )}

                    {formData.question_type === "trueFalse" && (
                        <SingleSelect
                            label="Answer"
                            value={formData.correct_answer}
                            onChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                            options={[
                                { label: "True", value: "true" },
                                { label: "False", value: "false" }
                            ]}
                            required
                        />
                    )}

                    <div className="field-container">
                        <label>Explanation:</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.explanation}
                            onChange={(value) => setFormData(prev => ({ ...prev, explanation: value }))}
                            modules={{
                                toolbar: [[{ header: [1, 2, false] }], ["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link", "image"]],
                            }}
                            className="enhanced-input"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditQuestion;
