import React, { useState, useEffect } from 'react';
import { FaEdit, FaTimes, FaCheck, FaUndo } from "react-icons/fa"; // FaUndo for cancel button
import supabase from '../../../config/supabaseClient';
import './index.css';
import Pagination from '../../../components/pagination';

const RunningNumbersPopup = ({ show, onClose, parentId }) => {
  const [runningNumbers, setRunningNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', prefix: '', r_number: '' });
  const [originalData, setOriginalData] = useState(null); // Store original values for cancel

  const limit = 5;

  const fetchRunningNumbers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;

      const { data: quesId, error: quesIdError } = await supabase
        .from('question_subcategory')
        .select('running_number_id')
        .eq('parent', parentId);

      if (quesIdError) throw quesIdError;

      // Extract running_number_id values
      const runningNumberIds = quesId.map(q => q.running_number_id);

      if (runningNumberIds.length === 0) {
        console.log("No matching running_number_id found");
        return;
      }

      // Retrieve matching running_numbers data
      const { data: runningNumbersData, error } = await supabase
        .from('running_numbers')
        .select('*')
        .in('id', runningNumberIds)
        .range(start, end); // Match with running_number_id

      if (error) throw error;

      setRunningNumbers(runningNumbersData);
      setTotalPages(Math.ceil(runningNumberIds.length / limit)); // Assuming total data count is 13
    } catch (error) {
      console.error("Failed to fetch running numbers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) fetchRunningNumbers(page);
  }, [show, page]);

  // Handle Edit Click
  const handleEditClick = (runningNumber) => {
    setEditingId(runningNumber.id);
    setFormData(runningNumber);
    setOriginalData(runningNumber); // Save original data for canceling
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Save Changes
  const handleSave = async () => {
    const { error } = await supabase.from('running_numbers').update(formData).eq('id', editingId);

    if (error) {
      console.error("Update failed:", error);
    } else {
      setEditingId(null);
      fetchRunningNumbers(page);
    }
  };

  // Handle Cancel Editing
  const handleCancel = () => {
    setEditingId(null);
    setFormData(originalData); // Restore original data
  };

  return (
    <div className={`popup-overlay ${show ? "show" : ""}`}>
      <div className="popup-container" style={{fontFamily: 'Poppins'}}>
        <div className="popup-header">
          <p className="title-page">All Module Running Number</p>
          <FaTimes className="close-button" onClick={onClose} />
        </div>

        {loading ? (
          <p>Loading running numbers...</p>
        ) : (
          <>
            <table className="table-container-popup" style={{fontFamily: 'Poppins'}}>
              <thead>
                <tr className="header-row">
                  <th className='normal-header'>Name</th>
                  <th className='normal-header'>Prefix</th>
                  <th className='normal-header'>Number</th>
                  <th className='normal-header'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runningNumbers.map((runningNumber) => (
                  <tr key={runningNumber.id}>
                    {editingId === runningNumber.id ? (
                      <>
                        <td className='normal-column'>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} className='enhanced-input' /></td>
                        <td className='normal-column'>
                          <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} className='enhanced-input' /></td>
                        <td className='normal-column'>
                          <input type="text" name="r_number" value={formData.r_number} onChange={handleChange} className='enhanced-input' /></td>
                        <td className='normal-column'>
                          <FaCheck onClick={handleSave} title="Save" />
                          <FaUndo onClick={handleCancel} title="Cancel" className="cancel-button" style={{ marginLeft: '10px', color: 'red' }} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className='normal-column'>{runningNumber.name}</td>
                        <td className='normal-column'>{runningNumber.prefix}</td>
                        <td className='normal-column'>{runningNumber.r_number}</td>
                        <td className='normal-column'>
                          <FaEdit onClick={() => handleEditClick(runningNumber)} title="Edit" className="edit-button" />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default RunningNumbersPopup;
