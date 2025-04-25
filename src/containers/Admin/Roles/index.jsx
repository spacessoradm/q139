import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const Roles = () => {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchAllRoles = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .range(start, end);

      if (rolesError) throw rolesError;

      setRoles(rolesData);
      setFilteredRoles(rolesData);
      setTotalPages(Math.ceil(rolesData.length / limit));
    } catch (error) {
      showToast("Failed to fetch roles.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = roles.filter((role) =>
        role.name.toLowerCase().includes(term)
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchAllRoles(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchAllRoles(newPage);
    }
  };

  useEffect(() => {
    fetchAllRoles(page);
  }, [page]);

  const handleRefresh = () => fetchAllRoles(page);

  const handleCreate = () => navigate("create");

  const deleteRole = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this role?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
      setFilteredRoles((prevFilteredRoles) =>
        prevFilteredRoles.filter((role) => role.id !== id)
      );

      showToast("Role deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete role.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Roles Management</p>
      <p className='subtitle-page'>Manage your roles here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading roles...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && filteredRoles.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("name")}
                  className='sort-header'
                >
                  Role Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Status</th>
                <th
                  onClick={() => handleSort("modified_at")}
                  className='sort-header'
                >
                  Update At {sortConfig.key === "modified_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td className='normal-column'>{role.id}</td>
                  <td className='normal-column'>{role.name}</td>
                  <td className='normal-column'>{role.status}</td>
                  <td className='normal-column'>{role.modified_at}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/roles/view/${role.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteRole(role.id)}
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
        !loading && <p>No roles found.</p>
      )}
    </div>
  );
};

export default Roles;
