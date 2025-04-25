import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateBlogTag.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateBlogTag = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tag_name: '',
        tag_status: 'enabled',
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
            tag_status: newStatus
          }));
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: blogTagError } = await supabase
                .from('blog_tags')
                .insert([
                    {
                        tag_name: formData.tag_name,
                        status: formData.tag_status,
                    },
                ]);

            if (blogTagError) throw blogTagError;

            showToast('Blog tag created successfully.', 'success')

            navigate('/admin/blogtags');
        } catch (error) {
            showToast('Failed to create blog tag.', 'error')
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogtags" />   
            <h2>Create New Blog Tag</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Tag Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            id="tag_name"
                            name="tag_name"
                            value={formData.tag_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <div id="language-status-toggle">
                            <button
                            type="button"
                            onClick={() => handleStatusChange('enabled')}
                            style={{
                                backgroundColor: formData.tag_status === 'enabled' ? 'green' : 'gray',
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
                                backgroundColor: formData.tag_status === 'disabled' ? 'red' : 'gray',
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
                        {loading ? 'Creating...' : 'Create Tag'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlogTag;
