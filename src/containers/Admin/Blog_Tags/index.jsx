import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const BlogTags = () => {
  const navigate = useNavigate();

  const [blogTags, setBlogTags] = useState([]);
  const [filteredBlogTags, setFilteredBlogTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "tag_name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchBlogTags = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: blogTagsData, error: blogTagsError } = await supabase
        .from('blog_tags')
        .select('*')
        .range(start, end);

      if (blogTagsError) throw blogTagsError;

      setBlogTags(blogTagsData);
      setFilteredBlogTags(blogTagsData);
      setTotalPages(Math.ceil(blogTagsData.length / limit));
    } catch (error) {
      showToast("Failed to fetch blog tags.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = blogTags.filter((blogTag) =>
        blogTag.tag_name.toLowerCase().includes(term)
      );
      setFilteredBlogTags(filtered);
    } else {
      setFilteredBlogTags(blogTags);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchBlogTags(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchBlogTags(newPage);
    }
  };

  useEffect(() => {
    fetchBlogTags(page);
  }, [page]);

  const handleRefresh = () => fetchBlogTags(page);

  const handleCreate = () => navigate("create");

  const deleteBlogTag = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog tag?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogTags((prevBlogTags) => prevBlogTags.filter((blogTag) => blogTag.id !== id));
      setFilteredBlogTags((prevFilteredBlogTags) =>
        prevFilteredBlogTags.filter((blogTag) => blogTag.id !== id)
      );

      showToast("Blog tag deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete blog tag.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Blog Tags Module</p>
      <p className='subtitle-page'>Manage your blog tags here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading blog tags...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredBlogTags.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("tag_name")}
                  className='sort-header'
                >
                  Tag Name {sortConfig.key === "tag_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Status</th>
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
              {filteredBlogTags.map((blogTag) => (
                <tr key={blogTag.id}>
                  <td className='normal-column'>{blogTag.id}</td>
                  <td className='normal-column'>{blogTag.tag_name}</td>
                  <td className='normal-column'>{blogTag.status}</td>
                  <td className='normal-column'>{blogTag.created_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/blogtags/view/${blogTag.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/blogtags/edit/${blogTag.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteBlogTag(blogTag.id)}
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
        !loading && <p>No blog tags found.</p>
      )}
    </div>
  );
};

export default BlogTags;
