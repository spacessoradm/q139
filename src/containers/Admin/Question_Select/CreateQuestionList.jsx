import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import supabase from "../../../config/supabaseClient";

const getRandomColor = () => {
  const colors = ["#FFADAD", "#FFD6A5", "#FDFFB6", "#CAFFBF", "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CreateQuestionList = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from("questions").select("id, question_text");
      if (error) console.error("Error fetching questions:", error);
      else setQuestions(data);
    };

    const fetchCategories = async () => {
      const { data: categoryData, error: categoryError } = await supabase.from("question_list_category").select("id, category_name");
      if (categoryError) {
        console.error("Error fetching categories:", categoryError);
        return;
      }

      const { data: sequenceData, error: sequenceError } = await supabase.from("tbl_sequence").select("category");
      if (sequenceError) {
        console.error("Error fetching sequences:", sequenceError);
        return;
      }

      const existingCategories = new Set(sequenceData.map(seq => seq.category));
      const filteredCategories = categoryData.filter(cat => !existingCategories.has(cat.category_name));
      setCategories(filteredCategories);
    };

    fetchQuestions();
    fetchCategories();
  }, []);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleSelectChange = (selectedOptions) => {
    const newSelected = selectedOptions.map((option, index) => ({
      id: option.value,
      question_text: option.label,
      position: index + 1,
      backgroundColor: getRandomColor(),
    }));

    setSelectedQuestions(newSelected);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedQuestions.findIndex((item) => item.id === active.id);
    const newIndex = selectedQuestions.findIndex((item) => item.id === over.id);
    const newList = arrayMove(selectedQuestions, oldIndex, newIndex).map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setSelectedQuestions(newList);
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      alert("Please select a category before saving.");
      return;
    }
    
    const orderedData = selectedQuestions.map(({ id, position }) => ({ id, position }));

    const { error } = await supabase.from("tbl_sequence").insert([
      { category: selectedCategory.value, sequence: orderedData },
    ]);

    if (error) console.error("Error saving sequence:", error);
    else alert("Saved!");

    navigate('/admin/questionselect');
  };

  return (
    <div style={{paddingLeft: "100px", paddingRight: "100px"}}>
      <h2>Create Question List</h2>

      <div className="field-container">
        <label>Category :</label>
        <Select
          options={categories.map((category) => ({ value: category.category_name, label: category.category_name }))}
          onChange={handleCategoryChange}
          placeholder="Select category..."
          value={selectedCategory}
        />
      </div>

      <div className="field-container">
        <label>Questions : </label>
        <Select
          options={questions.map((question) => ({ value: question.id, label: question.question_text }))}
          isMulti
          onChange={handleSelectChange}
          placeholder="Select questions..."
          value={selectedQuestions.map((v) => ({ value: v.id, label: v.question_text }))}
        />
      </div>

      <div className="field-container">
        <label>Random Display : </label>
        <Select
          options={[{ value: true, label: "True" }, { value: false, label: "False" }]}
          onChange={(selectedOption) => setShuffle(selectedOption.value)}
          placeholder="Shuffle questions?"
          value={{ value: shuffle, label: shuffle ? "True" : "False" }}
        />
      </div>
      

      <div className="field-container">
        <label>List :</label>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={selectedQuestions.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedQuestions.map((question) => (
              <SortableItem key={question.id} question={question} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      </div>

      <button onClick={handleSave} style={{ marginTop: "10px", borderRadius: "25px" }}>
        Save
      </button>
    </div>
  );
};

const SortableItem = ({ question }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

  const style = {
    padding: "10px",
    margin: "5px 0",
    backgroundColor: question.backgroundColor || "#f0f0f0",
    border: "1px solid #ccc",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{question.position}.</strong> {question.question_text}
    </li>
  );
};

export default CreateQuestionList;
