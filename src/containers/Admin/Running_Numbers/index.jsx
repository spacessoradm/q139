import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const RunningNumbers = () => {
  const navigate = useNavigate();

  const [runningNumbers, setRunningNumbers] = useState([]);
  const [filteredRunningNumbers, setFilteredRunningNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchRunningNumbers = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: runningNumbersData, error: runningNumbersError } = await supabase
        .from('running_numbers')
        .select('*')
        .range(start, end);

      if (runningNumbersError) throw runningNumbersError;

      setRunningNumbers(runningNumbersData);
      setFilteredRunningNumbers(runningNumbersData);
      setTotalPages(Math.ceil(runningNumbersData.length / limit));
    } catch (error) {
      showToast("Failed to fetch all running number.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = runningNumbers.filter((runningNumber) =>
        runningNumber.name.toLowerCase().includes(term)
      );
      setFilteredRunningNumbers(filtered);
    } else {
      setFilteredRunningNumbers(runningNumbers);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchRunningNumbers(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchRunningNumbers(newPage);
    }
  };

  useEffect(() => {
    fetchRunningNumbers(page);
  }, [page]);

  const handleRefresh = () => fetchRunningNumbers(page);

  const handleCreate = () => navigate("create");

  const deleteRunningNumber = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this running number?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('running_numbers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRunningNumbers((prevRunningNumbers) => prevRunningNumbers.filter((runningNumber) => runningNumber.id !== id));
      setFilteredRunningNumbers((prevFilteredRunningNumbers) =>
        prevFilteredRunningNumbers.filter((runningNumber) => runningNumber.id !== id)
      );

      showToast("Running number deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete running number.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Running Number Module</p>
      <p className='subtitle-page'>Manage your question category running number here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading running numbers...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && !error && filteredRunningNumbers.length > 0 ? (
        <>
          <table className='table-container'>
            <thead>
              <tr className='header-row'>
                <th className='normal-header'>ID</th>
                <th
                  onClick={() => handleSort("name")}
                  className='sort-header'
                >
                  Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className='normal-header'>Prefix</th>
                <th className='normal-header'>Number</th>
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
              {filteredRunningNumbers.map((runningNumber) => (
                <tr key={runningNumber.id}>
                  <td className='normal-column'>{runningNumber.id}</td>
                  <td className='normal-column'>{runningNumber.name}</td>
                  <td className='normal-column'>{runningNumber.prefix}</td>
                  <td className='normal-column'>{runningNumber.r_number}</td>
                  <td className='normal-column'>{runningNumber.created_at}</td>
                  <td className='action-column'>
                    <FaEdit 
                      onClick={() => navigate(`/admin/runningnumbers/edit/${runningNumber.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deleteRunningNumber(runningNumber.id)}
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
        !loading && <p>No running numbers found.</p>
      )}
    </div>
  );
};

export default RunningNumbers;
