import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import "./index.css";
import JoditEditor from "jodit-react";

import BackButton from "../../../components/Button/BackArrowButton";
import Toast from "../../../components/Toast";
import PlainInput from "../../../components/Input/PlainInput";
import SingleSelect from "../../../components/Input/SingleSelect";

const CreateQuestion = () => {
  const navigate = useNavigate();
  const { subCategoryName } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "",
    options: "",
    correct_answer: "",
    explanation: "",
    category: "",
    sub_category: "",
  });

  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [options, setOptions] = useState([""]);
  const [answer, setAnswer] = useState("");

  const [toastInfo, setToastInfo] = useState({
    visible: false,
    message: "",
    type: "",
  });

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
  };

  const editor = useRef(null)
  const [content, setContent] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedOptions = JSON.stringify(options.map((opt) => opt.value));

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          question_text: question,
          question_type: questionType,
          options: formattedOptions,
          correct_answer: answer,
          explanation: content,
          category: "Part 2A",
          sub_category: subCategoryName,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (questionError) throw questionError;

      showToast("Question created successfully!", "success");
      navigate("/admin/bookings/2A");
    } catch (error) {
      setError(error.message);
      showToast(`Error creating question: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    setOptions([{ label: "A", value: "" }]);
    setAnswer("");
  };

  const handleOptionChange = (index, value) => {
    setOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index] = { ...updatedOptions[index], value };
      return updatedOptions;
    });
  };

  const addOption = () => {
    const newLabel = String.fromCharCode(65 + options.length);
    setOptions([...options, { label: newLabel, value: "" }]);
  };

  const removeOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    updatedOptions.forEach((option, i) => {
      option.label = String.fromCharCode(65 + i);
    });
    setOptions(updatedOptions);
  };

  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  return (
    <div className="create-venue-category-container">
      <BackButton to="/admin/bookings/2A" />
      <h2>Create New Part 2A Question</h2>

      {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="outsider">
        <div className="insider">

            <PlainInput
                label="Sub Category"
                type="text"
                value={subCategoryName}
                required
                disabled
            />

            <SingleSelect
                label="Question Type"
                value={questionType}
                onChange={handleQuestionTypeChange}
                options={[
                { label: "Single Option", value: "single" },
                { label: "Multiple Choice", value: "multiple" },
                ]}
                required
            />

            <PlainInput
                label="Title"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
            />

            {(questionType === "single" || questionType === "multiple") && (
                <div>
                    <label>Options</label>
                    {options.map((option, index) => (
                        <div key={index} className="field-container" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>{option.label}.</span>
                            <PlainInput
                                type="text"
                                value={option.value}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                            />
                            {options.length > 1 && (
                                <button type="button" className="removebtn" onClick={() => removeOption(index)}>
                                    -
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="addbtn" onClick={addOption}>
                        +
                    </button>
                </div>
            )}

            <PlainInput
                label="Correct Answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
            />

            <div className="field-container">
                <label>Explanation:</label>
                <JoditEditor ref={editor} value={content} onChange={newContent => setContent(newContent)} />
            </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestion;
