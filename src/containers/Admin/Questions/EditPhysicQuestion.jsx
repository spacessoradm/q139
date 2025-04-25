import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaMinusCircle, FaPlusCircle, FaTimes } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";
import katex from "katex";
import JoditEditor from "jodit-react";
import './CreateBooking.css';

import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from "../../../components/Input/PlainInput";
import SingleSelect from "../../../components/Input/SingleSelect";

const EditPhysicQuestion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    useEffect(() => {
        const fetchQuestion = async () => {
            setLoading(true);
            try {
                const { data: question, error: questionError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (questionError) throw questionError;

                const { data: subquestions, error: subQuestionError } = await supabase
                    .from('subquestions')
                    .select('*')
                    .eq('parent_id', id);

                if (subQuestionError) throw subQuestionError;

                setFormData({ ...question, subquestion: subquestions || [] });
            } catch (error) {
                setError(error.message);
                showToast(`Error fetching question: ${error.message}`, "error");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [id]);

    const editor = useRef(null)

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('questions')
                .update({
                    question_text: formData.question_text,
                    question_type: formData.question_type,
                    explanation: formData.explanation,
                    modified_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            await handleSaveSubQuestions(id, formData.subquestion);

            showToast("Question updated successfully!", "success");
            navigate('/admin/questions/physic');
        } catch (error) {
            setError(error.message);
            showToast(`Error updating question: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSubQuestions = async (questionId, subquestions) => {
        try {
            await supabase.from("subquestions").delete().eq("parent_id", questionId);
            const subQ = subquestions.map((sq) => ({
                parent_id: questionId,
                subquestion_text: sq.subquestion_text,
                subquestion_answer: sq.subquestion_answer,
                subquestion_explanation: sq.subquestion_explanation,
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
            }));
            if (subQ.length > 0) {
                await supabase.from("subquestions").insert(subQ);
            }
        } catch (error) {
            showToast('Error saving subquestions', 'error');
        }
    };

    const handleSubQuestionChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedSubQuestion = [...prev.subquestion];
            updatedSubQuestion[index] = { ...updatedSubQuestion[index], [field]: value };
            return { ...prev, subquestion: updatedSubQuestion };
        });
    };

    const addSubQuestionGroup = () => {
        setFormData((prev) => ({
            ...prev,
            subquestion: [...prev.subquestion, { subquestion_text: "", subquestion_answer: "", subquestion_explanation: "" }],
        }));
    };

    const removeSubQuestionGroup = (index) => {
        setFormData((prev) => ({
            ...prev,
            subquestion: prev.subquestion.filter((_, i) => i !== index),
        }));
    };

    if (!formData) return <p>Loading...</p>;

    return (
        <div className="edit-physic-question-container" style={{ fontFamily: 'Poppins', width: '100%'}}>
            <BackButton to="/admin/questions/physic" />
            <h2>Edit Question</h2>
            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} style={{ padding: '30px'}}>
                <div className='insider'>
                    <PlainInput label="Main Question" type="text" name="question_text" value={formData.question_text} onChange={handleChange} required />
                    <SingleSelect label="Question Type" name="question_type" value={formData.question_type} onChange={handleChange} options={[{ label: "Sub-Questions", value: "subq" }]} required />
                    
                    <h3>Sub Questions</h3>
                    {formData.subquestion.map((sq, index) => (
                        <div key={index}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: '50px' }}>
                                <h4>Sub-Question {index + 1}</h4>
                                <FaTimes 
                                    size={30} 
                                    onClick={() => removeSubQuestionGroup(index)} 
                                    style={{ cursor: "pointer", color: "#f44336", marginLeft: "10px" }} 
                                />
                            </div>
                            <PlainInput 
                                label="Question" 
                                type="text" 
                                value={sq.subquestion_text} 
                                onChange={(e) => handleSubQuestionChange(index, "subquestion_text", e.target.value)} 
                                required 
                            />
                            <PlainInput 
                                label="Answer" 
                                type="text" 
                                value={sq.subquestion_answer} 
                                onChange={(e) => handleSubQuestionChange(index, "subquestion_answer", e.target.value)} 
                                required 
                            />
                            
                            <div style={{paddingTop: '20px'}}>
                                <label>Explanation</label>
                                <JoditEditor 
                                    ref={editor} 
                                    value={sq.subquestion_explanation} 
                                    onChange={(value) => handleSubQuestionChange(index, "subquestion_explanation", value)} 
                                    className="enhanced-input"
                                />
                            </div>
                        </div>
                    ))}
                    <FaPlusCircle size={30} onClick={addSubQuestionGroup} style={{ cursor: "pointer", color: "#4CAF50", margin: "10px" }} />

                    <div style={{paddingTop: '20px'}}>
                        <label>Explanation*</label>
                        <JoditEditor 
                            ref={editor} 
                            value={formData.explanation} 
                            onChange={(value) => setFormData({ ...formData, explanation: value })} 
                            className="enhanced-input"
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
                </div>
            </form>
        </div>
    );
};

export default EditPhysicQuestion;
