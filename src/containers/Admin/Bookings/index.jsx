import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";

import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Questions = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [parentId, setParentId] = useState("");
  const [queryCat, setQueryCat] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

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
    const searchValue = event.target.value; // Get the input value
  
    setSearchTerm(searchValue);
  
    if (searchValue.trim() === "") {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter((q) =>
        q.question_text?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
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
      navigate(`/admin/bookings/create/${selectedSubcategory}`);
    } else {
      console.log(selectedSubcategory)
      navigate(`/admin/bookings/createphysic/${selectedSubcategory}`)
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
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Question Categories</h3>
        <ul className="subcategory-list">
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

      <div className='venue-category'>
        <p className='title-page'>Question Management</p>
        <p className='subtitle-page'>Manage all questions here.</p>

        <SearchBar
          searchTerm={searchTerm}
          onSearch={(event) => handleSearch(event)}
          onRefresh={handleRefresh}
          onCreate={handleCreate}
        />

        {loading && <p>Loading records...</p>}
        {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

        {!loading && filteredQuestions.length > 0 ? (
          <>
            <table className='table-container'>
              <thead>
                <tr className='header-row'>
                  <th className='normal-header'>Question</th>
                  <th
                    onClick={() => handleSort("sub_category")}
                    className='sort-header'
                  >
                    Sub Category {sortConfig.key === "sub_category" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className='normal-header'> Actions </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id}>
                    <td className='normal-column'>
                      {question.question_text.length > 50 
                        ? question.question_text.substring(0, 50) + "..." 
                        : question.question_text}
                    </td>
                    <td className='normal-column'>{question.sub_category}</td>
                    <td className='action-column'>
                      <FaEye 
                        onClick={() => {
                          const path = parentId === '3' 
                            ? `/admin/bookings/preview/${question.id}` 
                            : `/admin/bookings/previewphysic/${question.id}`;
                          navigate(path);
                        }} 
                        title='Preview'
                        className='view-button'
                      />
                      <FaEdit 
                        onClick={() => navigate(`/admin/bookings/edit/${question.id}`)} 
                        title='Edit'
                        className='edit-button'
                      />
                      <FaTrashAlt 
                        onClick={() => handleDelete(question.id)} 
                        title='Delete'
                        className='delete-button'
                      />
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
