import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateRole = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        status: 'enabled',
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };

    const handleStatusChange = async (newStatus) => {
        setFormData(prevState => ({
            ...prevState,
            status: newStatus
          }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: roleError } = await supabase
                .from('roles')
                .insert([
                    {
                        name: formData.name,
                        status: formData.status,
                    },
                ]);

            if (roleError) throw roleError;

            showToast('Role created successfully.', 'success')

            navigate('/admin/roles');
        } catch (error) {
            showToast('Failed to create role.', 'error')
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/roles" />   
            <h2>Create New Role</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <div>
                            <button
                            type="button"
                            onClick={() => handleStatusChange('enabled')}
                            style={{
                                backgroundColor: formData.status === 'enabled' ? 'green' : 'gray',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                cursor: 'pointer',
                                width: '45%',
                            }}
                            >
                            Enabled
                            </button>
                            <button
                            type="button"
                            onClick={() => handleStatusChange('disabled')}
                            style={{
                                backgroundColor: formData.status === 'disabled' ? 'red' : 'gray',
                                color: 'white',
                                padding: '10px 20px',
                                border: 'none',
                                cursor: 'pointer',
                                width: '45%',
                            }}
                            >
                            Disabled
                            </button>
                        </div>


                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;
