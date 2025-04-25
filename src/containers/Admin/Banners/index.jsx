import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Banner = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [imagePaths, setImagePaths] = useState(null);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchBannersImage = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: bannersData, error: bannersError } = await supabase
        .from('banner')
        .select('*')
        .range(start, end);

      if (bannersError) throw bannersError;

      setImagePaths(bannersData.image_path);

      setBanners(bannersData);
      setFilteredBanners(bannersData);
      setTotalPages(Math.ceil(bannersData.length / limit));
    } catch (error) {
      showToast("Failed to fetch banners image.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = banners.filter((banner) =>
        banner.type.toLowerCase().includes(term)
      );
      setFilteredBanners(filtered);
    } else {
      setFilteredBanners(banners);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchBannersImage(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchBannersImage(newPage);
    }
  };

  useEffect(() => {
    fetchBannersImage(page);
  }, [page]);

  const handleRefresh = () => fetchBannersImage(page);

  const handleCreate = () => navigate("create");

  const deleteBanner = async (id, imagePath) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this banner?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('banner')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBanners((prevBanners) => prevBanners.filter((banner) => banner.id !== id));
      setFilteredBanners((prevFilteredBanners) =>
        prevFilteredBanners.filter((banner) => banner.id !== id)
      );

      showToast("Banner deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete banner.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Banner Module</p>
      <p className='subtitle-page'>Manage your banner image here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading banners...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredBanners.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  className='normal-header'
                > Type
                </th>
                <th className='normal-header'> Image </th>
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
              {filteredBanners.map((banner) => (
                <tr key={banner.id}>
                  <td className='normal-column'>{banner.id}</td>
                  <td className='normal-column'>{banner.type}</td>
                  <td className='normal-column'>  
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/banner/${banner.image_path}`}
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                      alt="Banner"
                    />
                  </td>
                  <td className='normal-column'>{banner.created_at}</td>
                  <td className='action-column'>
                    <FaEdit 
                      onClick={() => navigate(`/admin/banners/edit/${banner.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteBanner(banner.id, banner.image_path)}
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
        !loading && <p>No banner found.</p>
      )}
    </div>
  );
};

export default Banner;
