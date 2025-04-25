import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const CreateRunningNumber = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        prefix: '',
        suffix: '',
        r_number: '',
        rn_status: 'enabled',
    });
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'r_number') {
            const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
            const paddedNumber = numericValue ? numericValue.padStart(5, '0') : '';
            setFormData(prevState => ({
                ...prevState,
                [name]: paddedNumber
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formattedNumber = formData.r_number.padStart(5, '0'); // Ensure it's always 5 characters

            const { error: runningNumberError } = await supabase
                .from('running_numbers')
                .insert([
                    {
                        name: formData.name,
                        prefix: formData.prefix,
                        suffix: formData.suffix,
                        r_number: formattedNumber,
                        status: formData.rn_status,
                    },
                ]);

            if (runningNumberError) throw runningNumberError;

            showToast('Running number created successfully.', 'success');
            navigate('/admin/runningnumbers');
        } catch (error) {
            showToast('Failed to create running number.', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogtags" />   
            <h2>Create New Running Number</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="">
                        <label>Name:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="">
                        <label>Prefix:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            name="prefix"
                            value={formData.prefix}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="">
                        <label>Running Number:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            name="r_number"
                            value={formData.r_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="">
                        <label>Suffix:</label>
                        <input
                            className='enhanced-input'
                            type="text"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Tag'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRunningNumber;
