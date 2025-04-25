import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const QuestionList = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "category", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchQuestionLists = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: questionListsData, error: questionListsError } = await supabase
        .from('tbl_sequence')
        .select('id, category, sequence, created_at')
        .range(start, end);

      if (questionListsError) throw questionListsError;

      setQuestions(questionListsData);
      setFilteredQuestions(questionListsData);
      setTotalPages(Math.ceil(questionListsData.length / limit));
    } catch (error) {
      showToast("Failed to fetch question lists.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = questions.filter((question) =>
        question.category.toLowerCase().includes(term)
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchQuestionLists(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchQuestionLists(newPage);
    }
  };

  useEffect(() => {
    fetchQuestionLists(page);
  }, [page]);

  const handleRefresh = () => fetchQuestionLists(page);

  const handleCreate = () => navigate("create");

  const deleteList = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question list?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('tbl_sequence')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuestions((prevQuestionLists) => prevQuestionLists.filter((questionlist) => questionlist.id !== id));
      setFilteredQuestions((prevFilteredQuestionLists) =>
        prevFilteredQuestionLists.filter((questionlist) => questionlist.id !== id)
      );

      showToast("List deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete list.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Question List Management</p>
      <p className='subtitle-page'>Manage your question lists here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading question list...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredQuestions.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("category")}
                  className='sort-header'
                >
                  Category Name {sortConfig.key === "category" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className='sort-header'
                >
                  Created At {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((list) => (
                <tr key={list.id}>
                  <td className='normal-column'>{list.id}</td>
                  <td className='normal-column'>{list.category}</td>
                  <td className='normal-column'>{list.created_at}</td>
                  <td className='action-column'>
                    <FaEdit 
                      onClick={() => navigate(`/admin/questionselect/edit/${list.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteList(list.id)}
                      title='Delete'
                      className='delete-button'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        !loading && <p>No question list found.</p>
      )}
    </div>
  );
}; 

export default QuestionList;
