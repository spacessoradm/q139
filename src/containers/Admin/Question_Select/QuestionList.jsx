import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
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

const EditQuestionList = () => {
  const navigate = useNavigate();
  const listId = 1;
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
      return data;  // Return data to ensure it's available before fetching list details
    };
  
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("question_list_category").select("id, category_name");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data);
    };
  
    const fetchListDetails = async (questionsData) => {
      const { data, error } = await supabase
        .from("tbl_sequence")
        .select("category, sequence")
        .eq("id", listId)
        .single();
      
      if (error) {
        console.error("Error fetching list details:", error);
        return;
      }
  
      setSelectedCategory({ value: data.category, label: data.category });
  
      // Ensure questionsData is used instead of questions state, since questions might not be set yet
      setSelectedQuestions(
        data.sequence.map((q, index) => ({
          id: q.id,
          question_text: questionsData.find((item) => item.id === q.id)?.question_text || "", 
          position: index + 1,
        }))
      );
    };
  
    const loadData = async () => {
      const questionsData = await fetchQuestions(); // Wait for questions to load
      await fetchCategories();
      await fetchListDetails(questionsData); // Pass loaded questions to fetchListDetails
    };
  
    loadData();
  }, [listId]);
  

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleSelectChange = (selectedOptions) => {
    const newSelected = selectedOptions.map((option, index) => ({
      id: option.value,
      question_text: option.label,
      position: index + 1,
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
    const { error } = await supabase.from("tbl_sequence").update({
      category: selectedCategory.value,
      sequence: orderedData,
    }).eq("id", listId);

    if (error) console.error("Error updating sequence:", error);
    else alert("Updated successfully!");

    navigate('/admin/questionselect/list');
  };

  return (
    <div style={{ fontFamily: 'Poppins', paddingLeft: "100px", paddingRight: "100px" }}>
      <h2>Demo Test Question List</h2>

      <div style={{ paddingTop: '12px' }}>
        <label>Category :</label>
        <Select
          options={categories.map((category) => ({ value: category.category_name, label: category.category_name }))}
          onChange={handleCategoryChange}
          placeholder="Select category..."
          value={selectedCategory}
        />
      </div>

      <div style={{ paddingTop: '12px' }}>
        <label>Questions : </label>
        <Select
          options={questions.map((question) => ({ value: question.id, label: question.question_text }))}
          isMulti
          onChange={handleSelectChange}
          placeholder="Select questions..."
          value={selectedQuestions.map((v) => ({ value: v.id, label: v.question_text }))}
        />
      </div>

      <div style={{ paddingTop: '12px' }}>
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
        Save Changes
      </button>
    </div>
  );
};

const SortableItem = ({ question }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

  const style = {
    padding: "10px",
    margin: "5px 0",
    backgroundColor: "#f0f0f0",
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

export default EditQuestionList;
