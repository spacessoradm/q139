import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const FooterMenu = () => {
  const navigate = useNavigate();

  const [footerMenu, setFooterMenu] = useState([]);
  const [filteredFooterMenu, setFilteredFooterMenu] = useState([]); // For filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "title", direction: "asc" }); // Default sorting
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchDataList = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: menuList, error: menuListError } = await supabase
        .from('footer_menu')
        .select('*')
        .is('parent_id', null)
        .range(start, end);

      if (menuListError){
        showToast("Failed to fetch menu list. " + menuListError , "error");
        throw menuListError;
      }
      
      setFooterMenu(menuList);
      setFilteredFooterMenu(menuList); 
      setTotalPages(Math.ceil(menuList.length / limit));

    } catch (error) {
      showToast("Failed to fetch menu records. " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = footerMenu.filter((menu) =>
        menu.title.toLowerCase().includes(term)
      );
      setFilteredFooterMenu(filtered);
    } else {
      setFilteredFooterMenu(footerMenu); 
    }
  };

  // Handle sorting functionality
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    // Refetch sorted data
    fetchDataList(page);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchDataList(newPage);
    }
  };

  // Fetch data on component mount and when page changes
  useEffect(() => {
    fetchDataList(page);
  }, [page]);

  const handleRefresh = () => fetchDataList(page);

  const handleCreate = () => navigate("create");

  const deleteFooterMenu = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this menu item?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('footer_menu')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFooterMenu((prevMenu) => prevMenu.filter((menu) => menu.id !== id));
      setFilteredFooterMenu((prevFilteredMenu) =>
        prevFilteredMenu.filter((menu) => menu.id !== id)
      );

      showToast("Menu item deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete menu item.", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='app-users'>
      <p className='title-page'>Footer Menu Module</p>
      <p className='subtitle-page'>Manage footer menu here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {/* Show loading state */}
      {loading && <p>Loading records...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {/* Display users */}
      {!loading && !error && filteredFooterMenu.length > 0 ? (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("title")}
                  className='sort-header'
                >
                  Title {sortConfig.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Link</th>
                <th className='normal-header'>Status</th>
                <th
                  onClick={() => handleSort("modified_at")}
                  className='sort-header'
                >
                  Last Update {sortConfig.key === "modified_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFooterMenu.map((footerMenu) => (
                <tr key={footerMenu.id}>
                  <td className='normal-column'>{footerMenu.id}</td>
                  <td className='normal-column'>{footerMenu.title}</td>
                  <td className='normal-column'>{footerMenu.link}</td>
                  <td className='normal-column'>{footerMenu.is_active}</td>
                  <td className='normal-column'>
                    {new Date(footerMenu.modified_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className='action-column'>
                    <FaEdit
                      onClick={() => navigate(`/admin/footermenu/edit/${footerMenu.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt
                      onClick={() => deleteFooterMenu(footerMenu.id)}
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
        !loading && <p>No records found.</p>
      )}
    </div>
  );
};

export default FooterMenu;
