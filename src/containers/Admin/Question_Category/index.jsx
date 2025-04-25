import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaPlus, FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import CreateQuestionCategory from './CreateQuestionCategory';
import EditQuestionCategory from './EditQuestionCategory';
import CreateQuestionSubCategory from './CreateQuestionSubCategory';
import EditQuestionSubCategory from './EditQuestionSubCategory';

const QuestionCategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditSubModalOpen, setEditSubModalOpen] = useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);


  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error } = await supabase
        .from('question_category')
        .select('id, category_name, description, created_at');

      if (error) throw error;

      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      showToast("Failed to fetch categories.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const { data: subcategoriesData, error } = await supabase
        .from('question_subcategory')
        .select('id, subcategory_name, description, created_at, parent')
        .eq('parent', categoryId);

      if (error) throw error;

      setSubcategories(subcategoriesData);
    } catch (error) {
      showToast("Failed to fetch subcategories.", "error");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = categories.filter((category) =>
        category.category_name.toLowerCase().includes(term)
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  const handleViewSubcategories = async (categoryId) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
      setSubcategories([]);
    } else {
      await fetchSubcategories(categoryId);
      setExpandedCategoryId(categoryId);
    }
  };

  const handleRefresh = () => {
    // Reload or reset the data
    console.log("Refreshing data...");
  };

  const openEditModal = (id) => {
    console.log('here')
    setSelectedCategoryId(id);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
      setEditModalOpen(false);
      setSelectedCategoryId(null);
  };

  const openEditSubModal = (id) => {
    setSelectedSubCategoryId(id);
    setEditSubModalOpen(true);
  };

  const closeEditSubModal = () => {
      setEditSubModalOpen(false);
      setSelectedSubCategoryId(null);
  };

  const handleCreate = () => {
      // Open the modal or navigate to a create form
      setIsModalOpen(true); // If using a modal
  };

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('question_category').delete().eq('id', id);
      if (error) throw error;

      const updatedCategories = categories.filter((category) => category.id !== id);
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      showToast("Category deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete category.", "error");
    }
  };

  const deleteSubcategory = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subcategory?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('question_subcategory').delete().eq('id', id);
      if (error) throw error;

      const updatedSubcategories = subcategories.filter((sub) => sub.id !== id);
      setSubcategories(updatedSubcategories);
      showToast("Subcategory deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete subcategory.", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className='whole-page' style={{ fontFamily: 'Poppins' }}>
      <p className='title-page'>Question Category Management</p>
      <p className='subtitle-page'>Manage your question categories here.</p>

      <SearchBar 
        searchTerm={searchTerm} 
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading categories...</p>}

      {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

      <CreateQuestionCategory 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditQuestionCategory 
        isOpen={isEditModalOpen} 
        onClose={closeEditModal} 
        categoryId={selectedCategoryId} 
      />

      {isCreateModalOpen && (
         <CreateQuestionSubCategory 
            isOpen={isCreateModalOpen} 
            onClose={() => {setCreateModalOpen(false); window.location.reload();}} 
         />
      )}

      {isEditSubModalOpen && (
        <EditQuestionSubCategory 
           isOpen={isEditSubModalOpen} 
           onClose={closeEditSubModal} 
           subcategoryId={selectedSubCategoryId} 
        />
      )}  

      {!loading && filteredCategories.length > 0 ? (
        <>
          {/* Category Grid */}
          <div className="card-grid">
          {filteredCategories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="card-header">{category.category_name}</div>
              <div className="card-body">Description: {category.description}</div>
              <div className="date-info">
                Created At: {new Date(category.created_at).toLocaleDateString()}
              </div>
              <div className="card-actions">
                <FaEye onClick={() => handleViewSubcategories(category.id)} title="View Subcategories" style={{ fontSize: '1.5rem'}} />
                <FaEdit onClick={() => openEditModal(category.id)} style={{ fontSize: '1.5rem'}} />
                <FaTrashAlt onClick={() => deleteCategory(category.id)} style={{ fontSize: '1.5rem'}}/>
              </div>
            </div>
          ))}

          </div>

          {/* Subcategory Section */}
          {expandedCategoryId && (
            <div className="subcategory-section">
              <div className="subcategory-header">
                <h3>Subcategories</h3>
                <FaPlus onClick={() => { setCreateModalOpen(true)}} style={{ fontSize: '1.5rem', color: '#004c4c'}} />
              </div>
              <div className="card-grid">
                {subcategories.map((sub) => (
                  <div key={sub.id} className="category-card">
                    <div className="card-header">{sub.subcategory_name}</div>
                    <div className="card-body">Description: {sub.description}</div>
                    <div className="date-info">
                      Created At: {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                    <div className="card-actions">
                      <FaEdit onClick={() => {openEditSubModal(sub.id)}} style={{ fontSize: '1.5rem'}}/>
                      <FaTrashAlt onClick={() => deleteSubcategory(sub.id)}  style={{ fontSize: '1.5rem'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        !loading && <p>No categories found.</p>
      )}
    </div>
  );
};

export default QuestionCategory;
