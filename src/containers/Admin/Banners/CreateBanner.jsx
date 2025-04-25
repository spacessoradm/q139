import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';


const CreateBanner = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        image: null,
        url: '',
        sequence: '',
        start_date: null,
        end_date: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImages] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Get only the first selected file
    
        if (file) {
            setPreviewImages([URL.createObjectURL(file)]); // Display only one preview image
            setFormData({ ...formData, image: file }); // Store the single image file
        }
    };
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let uploadedImagePath = null; 

            if (formData.image instanceof File) {
                console.log('Uploading:', formData.image.name);
                
                const { data, error: uploadError } = await supabase.storage
                    .from('banner')
                    .upload(`${Date.now()}-${formData.image.name}`, formData.image, {
                        contentType: formData.image.type,
                        upsert: true
                    });
            
                if (uploadError) {
                    console.error('Upload failed:', uploadError);
                    throw uploadError;
                }
            
                uploadedImagePath = data.path;
                console.log('Uploaded file path:', uploadedImagePath);
            } else {
                throw new Error("Image is required and must be a valid file.");
            }
            

            const { error: bannerError } = await supabase
                .from('banner')
                .insert([
                    {
                        image_path: uploadedImagePath,
                        url: formData.url,
                        sequence: Number(formData.sequence),
                        start_date: formData.start_date,
                        end_date: formData.end_date,
                    },
                ]);

            if (bannerError) throw bannerError;

            showToast('Banner created successfully.', 'success');
            navigate('/admin/banners');
        } catch (error) {
            showToast('Failed to create banner.', 'error');
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/banners" />   
            <h2>Create New Banner Slide</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
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
                            required
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
                        {loading ? 'Creating...' : 'Create Banner'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBanner;
