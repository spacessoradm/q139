import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaMinusCircle, FaPlusCircle, FaTimes } from "react-icons/fa";
import './CreateBooking.css';
import "katex/dist/katex.min.css";
import katex from "katex";
import JoditEditor from "jodit-react";

import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';


const CreatePhysicQuestion = () => {
    const navigate = useNavigate();
    const { subCategoryName } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        question_text: '',
        question_type: '',
        options: '',
        correct_answer: '',
        explanation: '',
        category: '',
        sub_category: '',
        unique_code: '',
        subquestion: [
            {
                subquestion_title: "",
                subquestion_answer: "",
                subquestion_explanation: "",
            },
        ],
    });

    const [question, setQuestion] = useState("");

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const editor = useRef(null)
    const [content, setContent] = useState('')

    const renderMath = (content) => {
        return content.replace(/\$\$(.*?)\$\$/g, (_, formula) => {
            try {
                return katex.renderToString(formula, { throwOnError: false });
            } catch (error) {
                console.error("KaTeX Error:", error);
                return formula; // Return original text if KaTeX fails
            }
        });
    };    

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            let finalCode = formData.unique_code.trim(); // Ensure no spaces
            let runningNumberId = null;
            let r_number = "000"; // Default running number
            let newNumber = "";
    
            if (!finalCode) {
                // Step 1: Retrieve `running_number_id` from `question_subcategory`
                const { data: subCategoryData, error: subCategoryError } = await supabase
                    .from("question_subcategory")
                    .select("running_number_id")
                    .eq("subcategory_name", subCategoryName)
                    .single();
                
                console.log(subCategoryName)
    
                if (subCategoryError) throw subCategoryError;
                if (!subCategoryData || !subCategoryData.running_number_id) {
                    throw new Error("No matching subcategory found");
                }
    
                runningNumberId = subCategoryData.running_number_id;
    
                // Step 2: Get current running number from `running_numbers`
                const { data: runningNumberData, error: runningNumberError } = await supabase
                    .from("running_numbers")
                    .select("r_number, prefix, suffix")
                    .eq("id", runningNumberId)
                    .single();
    
                if (runningNumberError) throw runningNumberError;
    
                r_number = runningNumberData.r_number || "000"; // Default to "000"
                const { prefix, suffix } = runningNumberData;
    
                // Step 3: Increment running number & format with leading zeros
                const numericValue = parseInt(r_number, 10) || 0;
                newNumber = (numericValue + 1).toString().padStart(r_number.length, "0"); // Ensure leading zeros
    
                // Step 4: Generate finalCode using prefix + newNumber + suffix
                finalCode = `${prefix}${newNumber}`;
            }
    
            // Step 5: Insert question with the generated/manual code
            const { data: questionData, error: questionError } = await supabase
                .from("questions")
                .insert({
                    question_text: question,
                    question_type: "subq",
                    options: [],
                    correct_answer: "",
                    explanation: content,
                    category: "Physics",
                    sub_category: subCategoryName,
                    unique_code: finalCode, // ✅ Auto-generated or manual code
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                })
                .select()
                .single();
    
            if (questionError) throw questionError;
    
            const questionId = questionData.id;
    
            // Step 6: Save sub-questions
            await Promise.all([
                handleSaveSubQuestion(questionId, formData.subquestion),
            ]);
    
            // Step 7: If code was auto-generated, update `running_numbers`
            if (!formData.unique_code.trim() && runningNumberId) {
                const { error: updateError } = await supabase
                    .from("running_numbers")
                    .update({ r_number: newNumber }) // ✅ Store the incremented number
                    .eq("id", runningNumberId);
    
                if (updateError) throw updateError;
            }
    
            showToast("Question created successfully!", "success");
            navigate("/admin/questions/Physics");
    
        } catch (error) {
            setError(error.message);
            showToast(`Error creating question: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSaveSubQuestion = async (questionId, subquestion) => {
        try {
            console.log(subquestion);
          if (subquestion.length > 0) {
            const subQ = subquestion.map((group) => ({
              parent_id: questionId,
              subquestion_text: group.subquestion_title,
              subquestion_answer: group.subquestion_answer,
              subquestion_explanation: group.subquestion_explanation,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),  
            }));
    
            const { error } = await supabase.from("subquestions").insert(subQ);
            if (error) throw error;
          }
        } catch (error) {
            showToast('Error saving sub questions', 'error');
        }
    };
    
    const handleContentChange = (value) => {
        setFormData((prev) => ({ ...prev, explanation: value }));
    };

    const handleSubContentChange = (value) => {
        setFormData((prev) => ({ ...prev, subquestion_explanation: value }));
    };

    const handleTabChange = (index) => setActiveTab(index);

    const handleSubQuestionChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedSubQuestion = [...prev.subquestion];
            updatedSubQuestion[index] = {
                ...updatedSubQuestion[index],
                [field]: value, // Properly updating the field
            };
            return { ...prev, subquestion: updatedSubQuestion };
        });
    };
      
    const addSubQuestionGroup = () => {
        setFormData((prev) => ({
          ...prev,
          subquestion: [
            ...prev.subquestion,
            {
              subquestion_title: "",
              subquestion_answer: "",
              subquestion_explanation: "",
            },
          ],
        }));
    };
    
    const removeSubQuestionGroup = (index) => {
        setFormData((prev) => ({
          ...prev,
          subquestion: prev.subquestion.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="create-venue-category-container">
            <BackButton to="/admin/questions/Physics" />   
            <h2 style={{fontFamily: 'Poppins', paddingLeft: '50px', paddingRight: '50px'}}>Physics Question</h2> 

            <div className="container">
                {/* Sidebar */}
                <div className="sidebar" style={{ fontFamily: 'Poppins' }}> 
                    <h3>Sections</h3>
                    <ul className="subcategory-list">
                        <li 
                            className={`main-details ${question ? "active" : ""}`} 
                            style={{ marginTop: "12px" }}
                            onClick={() => setActiveTab(0)}
                        >
                            Main Details
                        </li>
                        {formData.subquestion.map((_, index) => (
                            <li 
                                key={index}
                                className={`subquestion-tab ${activeTab === index + 1 ? "active" : ""}`}
                                onClick={() => setActiveTab(index + 1)}
                            >
                                Sub-Question {index + 1}
                            </li>
                        ))}
                        <li>
                            <button
                                type="button"
                                className="addbtn"
                                onClick={addSubQuestionGroup}
                            >
                                +
                            </button>
                        </li>
                        <li 
                            className={`main-details ${content ? "active" : ""}`} 
                            style={{ marginTop: "12px" }}
                            onClick={() => setActiveTab(formData.subquestion.length + 1)}
                        >
                            Explanation
                        </li>
                    </ul>
                </div>

                <div className="question-tab" style={{ padding: "12px", width: "75%" }}>
                    {toastInfo.visible && (
                        <Toast message={toastInfo.message} type={toastInfo.type} />
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="" style={{fontFamily: 'Poppins', paddingLeft: '50px', paddingRight: '50px'}}>
                        <div className="">

                        <div style={{paddingTop: '20px'}}>
                            <label>Sub-Category*</label>
                            <input
                                type="text"
                                value={subCategoryName}
                                required
                                disabled
                                className="enhanced-input"
                            />
                        </div>

                        <div style={{paddingTop: '20px'}}>
                            <label>Title*</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                required
                                className="enhanced-input"
                            />
                        </div>

                        <div style={{ paddingTop: "20px" }}>
                            <label>Code*</label>
                            <input
                                type="text"
                                value={formData.unique_code}
                                onChange={(e) => setFormData({ ...formData, unique_code: e.target.value })}
                                className="enhanced-input"
                                placeholder="Auto-generate if left blank"
                            />
                        </div>

                        {/* Tabs Navigation */}
                        <div style={{ display: "flex", marginBottom: "20px", marginTop: '20px' }}>
                            {["Sub-Question"].map((tab, index) => (
                            <div
                                key={index}
                                onClick={() => handleTabChange(index)}
                                style={{
                                backgroundColor: activeTab === index ? "#004c4c" : "#f0f0f0",
                                color: activeTab === index ? "white" : "black",
                                }}
                                className="tab-navigation"
                            >
                                {tab}
                            </div>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 0 && (
                            <div>
                            {formData.subquestion.map((group, index) => (
                            <div
                                key={index}
                                className="enhanced-input"
                                style={{marginTop: '20px'}}
                                >
                                <div style={{ justifyContent: "flex-end", display: "flex"}}>
                                    <FaTimes
                                        size={25}  
                                        onClick={() => removeSubQuestionGroup(index)}
                                        style={{
                                        cursor: "pointer",
                                        margin: "15px",
                                        }}
                                    />
                                </div>
                                
                                <div className=''>
                                    <label>Question*</label>
                                    <input
                                        type="text"
                                        value={group.subquestion_title}
                                        onChange={(e) =>
                                        handleSubQuestionChange(index, "subquestion_title", e.target.value)
                                        }
                                        className="enhanced-input"
                                    />
                                </div>

                                <div style={{paddingTop: '20px'}}>
                                    <label>Answer*</label>
                                    <select
                                        value={group.subquestion_answer}
                                        onChange={(e) =>
                                            handleSubQuestionChange(index, "subquestion_answer", e.target.value)
                                        }
                                        className="enhanced-input"
                                    >
                                        <option value="">Select Answer</option>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>

                                <div style={{paddingTop: '20px'}}>
                                    <label>Explanation*</label>
                                    <JoditEditor 
                                    ref={editor} 
                                    value={formData.subquestion[index].subquestion_explanation} 
                                    onChange={(value) => handleSubQuestionChange(index, "subquestion_explanation", value)} 
                                    className="enhanced-input"
                                    />
                                </div>
                            </div>
                                ))
                            }
                            </div>
                        )}

                        <div style={{paddingTop: '20px'}}>
                            <label>Explanation*</label>
                            <JoditEditor 
                                value={content} 
                                onChange={newContent => setContent(renderMath(newContent))} 
                                className="enhanced-input"
                                style={{ innerHeight: '250px' }}
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePhysicQuestion;
