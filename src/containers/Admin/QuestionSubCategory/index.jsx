import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const QuestionSubCategory = () => {
  const navigate = useNavigate();

  const [subcategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "subcategory_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchSubCategories = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from('question_subcategory')
        .select('id, subcategory_name, description, created_at')
        .range(start, end);

      if (subCategoriesError) throw subCategoriesError;

      setSubCategories(subCategoriesData);
      setFilteredSubCategories(subCategoriesData);
      setTotalPages(Math.ceil(subCategoriesData.length / limit));
    } catch (error) {
      showToast("Failed to fetch sub categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = categories.filter((category) =>
        category.subcategory_name.toLowerCase().includes(term)
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories(categories);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchSubCategories(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchSubCategories(newPage);
    }
  };

  useEffect(() => {
    fetchSubCategories(page);
  }, [page]);

  const handleRefresh = () => fetchSubCategories(page);

  const handleCreate = () => navigate("create");

  const deleteSubCategory = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sub category?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('question_subcategory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubCategories((prevCategories) => prevCategories.filter((category) => category.id !== id));
      setFilteredSubCategories((prevFilteredCategories) =>
        prevFilteredCategories.filter((category) => category.id !== id)
      );

      showToast("SubCategory deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete subcategory.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Question Sub-Category Management</p>
      <p className='subtitle-page'>Manage your question sub categories here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading sub categories...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredSubCategories.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("subcategory_name")}
                  className='sort-header'
                >
                  SubCategory Name {sortConfig.key === "subcategory_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'> Description</th>
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
              {filteredSubCategories.map((category) => (
                <tr key={category.id}>
                  <td className='normal-column'>{category.id}</td>
                  <td className='normal-column'>{category.subcategory_name}</td>
                  <td className='normal-column'>{category.description}</td>
                  <td className='normal-column'>{category.created_at}</td>
                  <td className='action-column'>
                    <FaEdit 
                      onClick={() => navigate(`/admin/questionsubcategory/edit/${category.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteSubCategory(category.id)}
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
        !loading && <p>No sub categories found.</p>
      )}
    </div>
  );
}; 

export default QuestionSubCategory;
