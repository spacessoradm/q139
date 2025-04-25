import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAll, softDelete, remove } from './userService';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import Pagination from '../../../components/pagination';
import Toast from '../../../components/Toast';
import SearchBar from '../../../components/SearchBarSection';

import './index.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  // Fetch users on mount and page change
  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchAll(page, limit);

      if (!result.success) {
        throw new Error(result.message);
      }

      setUsers(result.data);
      setFilteredUsers(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      showToast(error.message || "Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchUsers(newPage);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      term ? users.filter(user => user.username.toLowerCase().includes(term)) : users
    );
  };

  const handleRefresh = () => loadUsers(page);

  const softDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setLoading(true);
      try {
        const result = await softDelete(id); // call the function
        
        showToast(result.message, result.success ? "success" : "error"); // Show success or error toast

        if (result.success) {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
            setFilteredUsers((prevFilteredUsers) =>
            prevFilteredUsers.filter((user) => user.id !== id)
            );
        }
      } catch (error) {
        showToast("Failed to delete user.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

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
                      onClick={() => navigate(`/admin/users/view/${user.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => softDelete(user.id)}
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

export default Users;
