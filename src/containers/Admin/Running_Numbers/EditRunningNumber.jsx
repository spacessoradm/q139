import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditRunningNumber = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get the running number ID from URL
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        prefix: '',
        suffix: '',
        r_number: '',
        rn_status: 'enabled',
    });

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    // Fetch running number details
    useEffect(() => {
        const fetchRunningNumber = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('running_numbers')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                setFormData({
                    name: data.name || '',
                    prefix: data.prefix || '',
                    suffix: data.suffix || '',
                    r_number: data.r_number || '00000',
                    status: data.rn_status || 'enabled',
                });
            } catch (error) {
                showToast('Failed to fetch running number.', 'error');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRunningNumber();
    }, [id]);

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
            const { error } = await supabase
                .from('running_numbers')
                .update({
                    name: formData.name,
                    prefix: formData.prefix,
                    suffix: formData.suffix,
                    r_number: formData.r_number.padStart(5, '0'),
                    status: formData.rn_status,
                })
                .eq('id', id);

            if (error) throw error;

            showToast('Running number updated successfully.', 'success');
            navigate('/admin/runningnumbers');
        } catch (error) {
            showToast('Failed to update running number.', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogtags" />   
            <h2>Edit Running Number</h2> 

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
                        {loading ? 'Updating...' : 'Update Running Number'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditRunningNumber;
