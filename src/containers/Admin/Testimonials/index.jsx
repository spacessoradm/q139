import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';
import DOMPurify from 'dompurify';
import CreateTestimonial from './CreateTestimonial';

const Testimonials = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  const fetchTestimonials = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data, error } = await supabase
        .from('testimonials')
        .select('id, displayname, subject, content, status, created_at')
        .order(sortConfig.key, { ascending: sortConfig.direction === "asc" })
        .range(start, end);

      if (error) throw error;

      setTestimonials(data);
      setFilteredTestimonials(data);
      setTotalPages(Math.ceil(data.length / limit));
    } catch (error) {
      showToast("Failed to fetch testimonials.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(page);
  }, [page, sortConfig]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = testimonials.filter(({ displayname, subject }) =>
        displayname.toLowerCase().includes(term) || subject.toLowerCase().includes(term)
      );
      setFilteredTestimonials(filtered);
    } else {
      setFilteredTestimonials(testimonials);
    }
  };

  const handleSort = () => {
    setSortConfig(prevConfig => ({
      key: "created_at",
      direction: prevConfig.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;

      setTestimonials(testimonials.filter((t) => t.id !== id));
      setFilteredTestimonials(filteredTestimonials.filter((t) => t.id !== id));
      showToast("Testimonial deleted successfully.", "success");
    } catch {
      showToast("Failed to delete testimonial.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page' style={{ fontFamily: 'Poppins' }}>
      <p className='title-page'>Testimonial List Management</p>
      <p className='subtitle-page'>Manage your testimonials here.</p>

      <SearchBar 
        searchTerm={searchTerm} 
        onSearch={handleSearch}
        onSort={handleSort}
        onRefresh={() => fetchTestimonials(page)} 
        onCreate={() => setModalOpen(true)} />

      {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

      {loading && <p>Loading testimonials...</p>}

      <CreateTestimonial isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {!loading && filteredTestimonials.length > 0 ? (
        <div className="card-container">
          {filteredTestimonials.map(({ id, displayname, subject, content, created_at }) => (
            <div key={id} className="testimonial-card">
              <p style={{ fontSize: '14px'}}><strong> {subject} </strong></p>
              <p style={{ fontSize: '12px'}} className="content-text">{DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })}</p>
              <h4>{displayname}</h4>
              <p style={{ fontSize: '12px'}}> {new Date(created_at).toLocaleDateString()}</p>
              <div className="card-actions">
                <FaEdit onClick={() => navigate(`/admin/testimonials/edit/${id}`)} title='Edit' className='edit-button' />
                <FaTrashAlt onClick={() => deleteTestimonial(id)} title='Delete' className='delete-button' />
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No testimonials found.</p>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default Testimonials;
