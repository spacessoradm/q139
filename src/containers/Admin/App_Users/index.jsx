import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const AppUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // For filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" }); // Default sorting
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      // Fetch users from auth.users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, unique_id')
        .neq('role_id', 1)
        .range(start, end);

      if (usersError) throw usersError;

      setUsers(users);
      setFilteredUsers(users); // Initialize filtered data
      setTotalPages(Math.ceil(users.length / limit)); // Calculate total pages
    } catch (error) {
      setError("Failed to fetch app users.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users); // Reset to full list if no search term
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
    fetchUsers(page);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchUsers(newPage);
    }
  };

  // Fetch data on component mount and when page changes
  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profile')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.filter((user) => user.id !== id)
      );

      alert("User deleted successfully.");
    } catch (err) {
      setError("Failed to delete user.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchUsers(page);

  const handleCreate = () => navigate("create");

  return (
    <div className='whole-page'>
      <p className='title-page'>User Module</p>
      <p className='subtitle-page'>Manage app users here.</p>

      <SearchBar
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onCreate={handleCreate}
      />

      {/* Show loading state */}
      {loading && <p>Loading users...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {/* Display users */}
      {!loading && filteredUsers.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
              <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("username")}
                  className='sort-header'
                >
                  Username {sortConfig.key === "username" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("role")}
                  className='sort-header'
                >
                  Role {sortConfig.key === "role" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className='normal-column'>{user.id}</td>
                  <td className='normal-column'>{user.username}</td>
                  <td className='normal-column'>{user.role}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/appusers/view/${user.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/appusers/edit/${user.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteUser(user.id)}
                      title='Delete'
                      className='delete-button'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        !loading && <p>No users found.</p>
      )}
    </div>
  );
};

export default AppUsers;
