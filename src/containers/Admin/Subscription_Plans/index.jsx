import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import './index.css';
import SearchBar from '../../../components/SearchBarSection';
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

const SubscriptionPlans = () => {
  const navigate = useNavigate();

  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [filteredSubscriptionPlans, setFilteredSubscriptionPlans] = useState([]);
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

  const fetchList = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: subscriptionPlansData, error: subscriptionPlansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .range(start, end);

      if (subscriptionPlansError) throw subscriptionPlansError;

      setSubscriptionPlans(subscriptionPlansData);
      setFilteredSubscriptionPlans(subscriptionPlansData);
      setTotalPages(Math.ceil(subscriptionPlansData.length / limit));
    } catch (error) {
      showToast("Failed to fetch subscription plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = subscriptionPlans.filter((subscriptionPlans) =>
        subscriptionPlans.name.toLowerCase().includes(term)
      );
      setFilteredSubscriptionPlans(filtered);
    } else {
      setFilteredSubscriptionPlans(subscriptionPlans);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    fetchList(page);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchList(newPage);
    }
  };

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const handleRefresh = () => fetchList(page);

  const handleCreate = () => navigate("create");

  const deletePlan = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscriptionPlans((prevSubscriptionPlans) => prevSubscriptionPlans.filter((subscriptionPlans) => subscriptionPlans.id !== id));
      setFilteredSubscriptionPlans((prevFilteredSubscriptionPlans) =>
        prevFilteredSubscriptionPlans.filter((subscriptionPlans) => subscriptionPlans.id !== id)
      );

      showToast("Plan deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete plan.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='whole-page'>
      <p className='title-page'>Subscription Plan Management</p>
      <p className='subtitle-page'>Manage your Subscription Plan here.</p>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      {loading && <p>Loading plans...</p>}

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      {!loading && filteredSubscriptionPlans.length > 0 ? (
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
              {filteredSubscriptionPlans.map((plans) => (
                <tr key={plans.id}>
                  <td className='normal-column'>{plans.id}</td>
                  <td className='normal-column'>{plans.name}</td>
                  <td className='normal-column'>{plans.status}</td>
                  <td className='normal-column'>{new Date(plans.created_at).toLocaleString()}</td>
                  <td className='action-column'>
                    <FaEye
                      onClick={() => navigate(`/admin/subscriptionplans/view/${plans.id}`)}
                      title='View'
                      className='view-button'
                    />
                    <FaEdit 
                      onClick={() => navigate(`/admin/subscriptionplans/edit/${plans.id}`)}
                      title='Edit'
                      className='edit-button'
                    />
                    <FaTrashAlt 
                      onClick={() => deletePlan(plans.id)}
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
        !loading && <p>No plans found.</p>
      )}
    </div>
  );
};

export default SubscriptionPlans;
