import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaPlus, FaEdit, FaTrashAlt, FaEllipsisV, FaRegFileAlt } from "react-icons/fa";

import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';
import RunningNumbersPopup from './RunningNumbersPopup';

const Questions = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [parentId, setParentId] = useState("");
  const [queryCat, setQueryCat] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
  const [menuOpen, setMenuOpen] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const toggleMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (category === "2A") {
      setParentId("3");
      setQueryCat("Part 2A");
    } else {
      setParentId("4");
      setQueryCat("Physics");
    }
  }, [category]); // Runs when category changes
  
  useEffect(() => {
    if (!parentId) return; // Ensure parentId is set before fetching data
  
    const fetchSubcategories = async () => {
      const { data, error } = await supabase
        .from("question_subcategory")
        .select("subcategory_name")
        .eq("parent", parentId);
  
      if (error) {
        console.error("Error fetching subcategories:", error);
      } else {
        setSubcategories(data);
      }
    };
  
    fetchSubcategories();
  }, [parentId]); // Runs when parentId changes
  
  useEffect(() => {
    if (!queryCat) return; // Ensure queryCat is set before fetching questions
    fetchDataList(page);
  }, [queryCat, page, selectedSubcategory]); // ✅ Runs only after queryCat is updated
  
  const fetchDataList = async (pageNumber = 1) => {
    setLoading(true);
  
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;
  
      let query = supabase
        .from("questions")
        .select("*", { count: "exact" })
        .eq("category", queryCat) // ✅ Ensures queryCat is used correctly
        .range(start, end);
  
      if (selectedSubcategory) {
        query = query.eq("sub_category", selectedSubcategory);
      }
  
      const { data: questionList, count, error } = await query;
  
      if (error) {
        showToast("Failed to fetch questions. " + error.message, "error");
      } else {
        setQuestions(questionList || []);
        setFilteredQuestions(questionList || []);
        setTotalPages(Math.ceil(count / limit)); // ✅ Fix total page calculation
      }
    } catch (error) {
      showToast("Failed to fetch question list. " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const getCorrectAnswerText = (optionsString, correctAnswer) => {
    if (!optionsString || !correctAnswer) return "Invalid Answer";
  
    try {
      // ✅ Parse the JSON string to an array
      const options = JSON.parse(optionsString);
      
      if (!Array.isArray(options)) return "Invalid Answer";
  
      // ✅ Convert "A" -> 0, "B" -> 1, etc.
      const index = correctAnswer.charCodeAt(0) - 65;
  
      return options[index] || "Invalid Answer"; // Fallback if index is out of range
    } catch (error) {
      return "Invalid Answer"; // In case JSON parsing fails
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
  
    const sortedQuestions = [...filteredQuestions].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  
    setSortConfig({ key, direction });
    setFilteredQuestions(sortedQuestions);
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
  
    if (!searchValue) {
      setFilteredQuestions(questions);
      return;
    }
  
    const filtered = questions.filter((q) => {
      const questionText = q.question_text?.toLowerCase() || "";
      const answerText = q.correct_answer && q.options
        ? getCorrectAnswerText(q.options, q.correct_answer).toLowerCase()
        : "";
  
      return questionText.includes(searchValue) || answerText.includes(searchValue);
    });
  
    setFilteredQuestions(filtered);
  };
  
  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedSubcategory(null);
    setSortConfig({ key: "id", direction: "asc" });
    fetchDataList(1);
  };
  
  const handleCreate = () => {
    if(parentId == '3'){
      console.log(selectedSubcategory)
      navigate(`/admin/questions/create/${selectedSubcategory}`);
    } else {
      console.log(selectedSubcategory)
      navigate(`/admin/questions/createphysic/${selectedSubcategory}`)
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;
  
    try {
      setLoading(true);
  
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
  
      showToast("Question deleted successfully.", "success");
  
      // Update local state
      const updatedQuestions = questions.filter((question) => question.id !== id);
      setQuestions(updatedQuestions);
      setFilteredQuestions(updatedQuestions);
  
      // 🔄 Fix pagination: If last question on page was deleted, go to previous page
      if (updatedQuestions.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        fetchDataList(page);
      }
    } catch (err) {
      showToast("Failed to delete question.", "error");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container" style={{ fontFamily: 'Poppins' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h4>Question Categories</h4>
          <FaRegFileAlt 
            className="document-icon" 
            title="Categories Documentation" 
            onClick={() => setShowPopup(true)}
          />
        </div>
        <ul className="subcategory-list" style={{ paddingTop: '12px'}}>
          <li 
            onClick={() => handleSubcategoryClick(null)} 
            className={selectedSubcategory === null ? "active" : ""}
          >
           All Questions
          </li>

          {subcategories.map((sub, index) => (
            <li
              key={index}
              onClick={() => handleSubcategoryClick(sub.subcategory_name)}
              className={selectedSubcategory === sub.subcategory_name ? "active" : ""}
            >
              {sub.subcategory_name}
            </li>
          ))}
        </ul>

      </div>

      <div className='question-tab' style={{ padding: "12px", width: "75%"}}>
        <p className='title-page'>Question Management</p>
        <p className='subtitle-page'>Manage all questions here.</p>

        <SearchBar
          searchTerm={searchTerm}
          onSearch={(event) => handleSearch(event)}
          onSort={() => handleSort("sub_category")}
          onRefresh={handleRefresh}
          onCreate={handleCreate}
        />

        {loading && <p>Loading records...</p>}
        {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

        {showPopup && <RunningNumbersPopup show={showPopup} onClose={() => setShowPopup(false)} parentId={parentId} />}

        {!loading && filteredQuestions.length > 0 ? (
          <>
            <table className='table-container' style={{fontFamily: 'Poppins'}}>
              <thead>
                <tr className='header-row'>
                <th className='normal-header'>Code</th>
                  <th className='normal-header'>Details</th>
                  <th
                    className='hidden-column'
                  >
                    Sub Category {sortConfig.key === "sub_category" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className='normal-header'>Actions </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id}>
                    <td className='question-column'>{question.unique_code}</td>
                    <td className='question-column'>
                      <div>
                        <label>Sub Category: </label>
                        {question.sub_category}
                      </div>
                      <div>
                        <label>Question: </label>
                        {question.question_text.length > 80 
                          ? question.question_text.substring(0, 80) + "..." 
                          : question.question_text}
                      </div>
                      {question.correct_answer && (
                        <div>
                          <label>Answer: </label>
                          {getCorrectAnswerText(question.options, question.correct_answer)}
                        </div>
                      )}
                    </td>
                    <td className='hidden-column'>{question.sub_category}</td>
                    {/* Action Menu */}
                    <td className="action-menu">
                      <FaEllipsisV className="menu-icon" onClick={() => toggleMenu(question.id)} />

                      {menuOpen === question.id && (
                        <div className="menu-dropdown">
                          <button 
                            className="menu-item view"
                            onClick={() => {
                              if (parentId == '3') {
                                  // Navigate to sub-question edit page if parent_id is 3 or 4
                                  navigate(`/admin/questions/preview/${question.id}`);
                              } else {
                                  // Otherwise, navigate to the main question edit page
                                  navigate(`/admin/questions/previewphysic/${question.id}`);
                              }
                            }}>
                              <FaEye /> View
                          </button>
                          <button 
                            className="menu-item edit" 
                            onClick={() => {
                              if (parentId == '3') {
                                  // Navigate to sub-question edit page if parent_id is 3 or 4
                                  navigate(`/admin/questions/edit/${question.id}`);
                              } else {
                                  // Otherwise, navigate to the main question edit page
                                  navigate(`/admin/questions/editphysic/${question.id}`);
                              }
                            }}>
                              <FaEdit /> Edit
                          </button>
                          <button 
                            className="menu-item delete" 
                            onClick={() => handleDelete(question.id)}>
                              <FaTrashAlt /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        ) : (
          !loading && <p>No Questions found.</p>
        )}
      </div>
    </div>
  );
};

export default Questions;
