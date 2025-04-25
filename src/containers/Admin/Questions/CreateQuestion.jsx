import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import JoditEditor from "jodit-react";

import BackButton from "../../../components/Button/BackArrowButton";
import Toast from "../../../components/Toast";
import SingleSelect from "../../../components/Input/SingleSelect";

import "./index.css";

const CreateQuestion = () => {
  const navigate = useNavigate();
  const { subCategoryName } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [content, setContent] = useState("");
  const [manualCode, setManualCode] = useState(""); 
  const editor = useRef(null);

  const [toastInfo, setToastInfo] = useState({
    visible: false,
    message: "",
    type: "",
  });

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        let finalCode = manualCode.trim(); // Ensure no leading/trailing spaces
        let runningNumberId = null;
        let r_number = "000"; // Default in case no data found
        let newNumber = "";

        if (!finalCode) {
            // Retrieve running_number_id
            const { data: subCategoryData, error: subCategoryError } = await supabase
                .from("question_subcategory")
                .select("running_number_id")
                .eq("subcategory_name", subCategoryName)
                .single();

            if (subCategoryError) throw subCategoryError;
            if (!subCategoryData || !subCategoryData.running_number_id) {
                throw new Error("No matching subcategory found");
            }

            runningNumberId = subCategoryData.running_number_id;

            // Get current running number
            const { data: runningNumberData, error: runningNumberError } = await supabase
                .from("running_numbers")
                .select("r_number, prefix, suffix")
                .eq("id", runningNumberId)
                .single();

            if (runningNumberError) throw runningNumberError;

            r_number = runningNumberData.r_number || "000"; // Default to "000"
            const { prefix, suffix } = runningNumberData;

            // ✅ Convert r_number to an integer, increment, and pad with leading zeros
            const numericValue = parseInt(r_number, 10) || 0;
            newNumber = (numericValue + 1).toString().padStart(r_number.length, "0"); // Ensures leading zeros

            // ✅ Use the new incremented number in finalCode
            finalCode = `${prefix}${newNumber}${suffix}`;
        }

        // Insert question
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
                unique_code: finalCode, // Use either auto-generated or manual code
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (questionError) throw questionError;

        // ✅ Update running_numbers with the incremented number
        if (!manualCode.trim() && runningNumberId) {
            console.log("Updating running_numbers with:", { id: runningNumberId, r_number: newNumber });

            const { error: updateError } = await supabase
                .from("running_numbers")
                .update({ r_number: newNumber }) // Store the incremented number
                .eq("id", runningNumberId);

            if (updateError) throw updateError;
        }

        showToast("Question created successfully!", "success");
        navigate("/admin/questions/2A");

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
    if (!questionType) return;
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

  return (
    <div className="create-venue-category-container" style={{ fontFamily: "Poppins"}} > 
      <BackButton to="/admin/questions/2A" />
      <h2 style={{ paddingLeft: "50px", paddingRight: "50px" }}>
        2A Question
      </h2>

      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>Sections</h3>
          <ul className="subcategory-list">
            <li
              className={`main-details ${questionType && question ? "active" : ""}`}
              style={{marginTop: '12px'}}
            >
              Main Details
            </li>
            {options.map((option, index) => (
              <li key={index}>Option {option.label}</li>
            ))}
            <li>
              <button
                type="button"
                className="addbtn"
                onClick={addOption}
                disabled={!questionType}
              >
                +
              </button>
            </li>
            <li
              className={`main-details ${answer ? "active" : ""}`}
              style={{marginTop: '12px'}}
            >
              Correct Answer
            </li>
            <li
              className={`main-details ${content? "active" : ""}`}
              style={{marginTop: '12px'}}
            >
              Explanation
            </li>
          </ul>
        </div>

        <div className="question-tab" style={{ padding: "12px", width: "75%" }}>
          {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}
          {error && <div className="error-message">{error}</div>}

          <form
            onSubmit={handleSubmit}
            className=""
            style={{ fontFamily: "Poppins", paddingLeft: "50px", paddingRight: "50px" }}
          >
            <div className="">
              <div style={{ paddingTop: "20px" }}>
                <label>Sub-Category*</label>
                <input
                  type="text"
                  value={subCategoryName}
                  required
                  disabled
                  className="enhanced-input"
                />
              </div>

              <SingleSelect
                label="Question Type*"
                value={questionType}
                onChange={handleQuestionTypeChange}
                options={[
                  { label: "Single Option", value: "single" },
                  { label: "Multiple Choice", value: "multiple" },
                ]}
                required
              />

              <div style={{ paddingTop: "20px" }}>

                <label>Custom Code (Optional):</label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter custom code (leave blank for auto-generated)"
                  className="enhanced-input"
                />
              </div>


              <div style={{ paddingTop: "20px" }}>
                <label>Title*</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  className="enhanced-input"
                />
              </div>

              {(questionType === "single" || questionType === "multiple") && (
                <div style={{ paddingTop: "20px" }}>
                  <label>Options</label>
                  {options.map((option, index) => (
                    <div key={index} className="field-container" style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
                      <span>{option.label}.</span>
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                        className="enhanced-input"
                      />
                      {options.length > 1 && (
                        <button type="button" className="removebtn" onClick={() => removeOption(index)}>
                          -
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ paddingTop: "20px" }}>
                <label>Answer*</label>
                <select
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  className="enhanced-input"
                >
                  <option value="" disabled>Select the correct answer</option>
                  {options.map((option, index) => (
                    <option key={index} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ paddingTop: "20px" }}>
                <label>Explanation*</label>
                <JoditEditor ref={editor} value={content} onChange={setContent} className="enhanced-input" />
              </div>

              <div className="button-container">
                <button type="submit" className="submit-btn" disabled={loading} style={{ width: "15%" }}>
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
