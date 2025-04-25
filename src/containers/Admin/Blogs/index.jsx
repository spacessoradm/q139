import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';
import CreateBlog from "./CreateBlog";
import EditBlog from "./EditBlog";

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12; // 4 columns x 3 rows
  const [totalPages, setTotalPages] = useState(1);
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  const fetchBlogs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: blogsData, error } = await supabase
        .from('blogs')
        .select('id, title, tags_id, created_at, image_path')
        .range(start, end);

      if (error) throw error;

      const { count } = await supabase.from('blogs').select('id', { count: 'exact', head: true });
      setTotalPages(Math.ceil(count / limit));

      setBlogs(blogsData);
      setFilteredBlogs(blogsData);
    } catch (error) {
      showToast("Failed to fetch blogs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredBlogs(term ? blogs.filter(blog => blog.title.toLowerCase().includes(term)) : blogs);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchBlogs(newPage);
    }
  };

  const handleRefresh = () => fetchBlogs(page);

  const handleCreate = () => {
    setShowCreateBlog(true); 
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      setBlogs(prev => prev.filter(blog => blog.id !== id));
      setFilteredBlogs(prev => prev.filter(blog => blog.id !== id));
      showToast("Blog deleted successfully.", "success");
    } catch {
      showToast("Failed to delete blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page' style={{ fontFamily:'Poppins' }}>
      <p className='title-page'>Blog Module</p>
      <p className='subtitle-page'>Manage app blogs here.</p>

      <SearchBar 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate} 
      />

      {loading && <p className='loading-message'>Loading blogs...</p>}
      {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

      {showCreateBlog && <CreateBlog onClose={() => { setShowCreateBlog(false); window.location.reload(); }}  />}
      {/* Render EditBlog only if a blog is selected */}
      {selectedBlogId && <EditBlog id={selectedBlogId} onClose={() => setSelectedBlogId(null)} />}

      <div className="blog-grid">
        {filteredBlogs.length > 0 ? (
          <>
            <div className="grid-container">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="blog-card">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/blog_image/${blog.image_path}`}
                    alt={blog.title}
                    className="blog-image"
                  />
                  <div className="blog-content">
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-tag">{blog.tag_name}</p>
                    <p className="blog-date">{new Date(blog.created_at).toLocaleDateString()}</p>
                    <div className="blog-actions">
                      <FaEdit
                        onClick={() => setSelectedBlogId(blog.id)}
                        title="Edit"
                        className="action-icon edit-icon"
                      />
                      <FaTrashAlt
                        onClick={() => deleteBlog(blog.id)}
                        title="Delete"
                        className="action-icon delete-icon"
                      />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            !loading && <p>No blogs found.</p>
          )}
        </div>

    </div>
  );
};

export default Blogs;

