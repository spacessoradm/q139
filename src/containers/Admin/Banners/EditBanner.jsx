import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

const EditBanner = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        image: null,
        url: '',
        sequence: '',
        start_date: '',
        end_date: '',
        existingImagePath: ''
    });
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const fetchBanner = async () => {
            const { data, error } = await supabase
                .from('banner')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error(error);
                showToast('Failed to load banner.', 'error');
                return;
            }
            
            setFormData({
                url: data.url,
                sequence: data.sequence,
                start_date: formatDate(data.start_date), // Convert to YYYY-MM-DD data.start_date,
                end_date: formatDate(data.end_date),
                existingImagePath: data.image_path
            });
            setPreviewImage(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/banner/${data.image_path}`);
        };

        fetchBanner();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return ''; // Handle empty values
        return dateString.split('T')[0]; // Extract only YYYY-MM-DD from ISO format
    };

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setFormData({ ...formData, image: file });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let uploadedImagePath = formData.existingImagePath;

            if (formData.image) {
                const { data, error: uploadError } = await supabase.storage
                    .from('banner')
                    .upload(`${Date.now()}-${formData.image.name}`, formData.image, { upsert: true });
                
                if (uploadError) throw uploadError;
                uploadedImagePath = data.path;
            }

            const { error: updateError } = await supabase
                .from('banner')
                .update({
                    image_path: uploadedImagePath,
                    url: formData.url,
                    sequence: Number(formData.sequence),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            showToast('Banner updated successfully.', 'success');
            navigate('/admin/banners');
        } catch (error) {
            showToast('Failed to update banner.', 'error');
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/banners" />
            <h2>Edit Banner</h2>

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Upload Your Banner Here:</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="enhanced-input"
                        />
                        {previewImage && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                <img src={previewImage} alt="Preview" className="h-12 w-12 rounded-lg object-cover" style={{ width: '250px', height: '250px' }} />
                            </div>
                        )}
                    </div>
                    <div className="field-container">
                        <label>URL:</label>
                        <input type="text" name="url" value={formData.url} className="enhanced-input" onChange={handleChange} />
                    </div>
                    <div className="field-container">
                        <label>Sequence:</label>
                        <input type="text" name="sequence" value={formData.sequence} className="enhanced-input" onChange={handleChange} />
                    </div>
                    <div className="field-container">
                        <label>Start Date:</label>
                        <input type="date" name="start_date" value={formData.start_date} className="enhanced-input" onChange={handleChange} />
                    </div>
                    <div className="field-container">
                        <label>End Date:</label>
                        <input type="date" name="end_date" value={formData.end_date} className="enhanced-input" onChange={handleChange} />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Banner'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBanner;
