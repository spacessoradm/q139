import React, { useState } from 'react';
import supabase from '../../../config/supabaseClient';

import './index.css';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import { X } from 'lucide-react';

const CreateQuestionCategory = ({ isOpen, onClose }) => {
    if (!isOpen) return null; // Do not render modal if it's not open

    const [formData, setFormData] = useState({
        categoryName: '',
        categoryDescription: '',
        seqInMenu: '',
    });

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!image) return null;

        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('question')
            .upload(filePath, image);

        if (uploadError) throw uploadError;

        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload the image and get the file path
            const imagePath = await uploadImage();

            // Insert new category into the 'question_category' table
            const { error: categoryError } = await supabase
                .from('question_category')
                .insert([
                    {
                        category_name: formData.categoryName,
                        description: formData.categoryDescription,
                        seq_in_menu: formData.seqInMenu,
                        Image_Path: imagePath ? imagePath : null,
                    },
                ]);

            if (categoryError) throw categoryError;

            showToast('Question category created successfully.', 'success');

            onClose(); // Close the modal after successful creation
        } catch (error) {
            showToast('Failed to create question category.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <X onClick={onClose} />
                <h2>Create New</h2>

                {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

                <form onSubmit={handleSubmit} className="modal-form">
                    <PlainInput 
                        label="Category Name"
                        value={formData.categoryName}
                        onChange={(e) => handleChange('categoryName', e.target.value)}
                        required
                    />

                    <TextArea 
                        label="Category Description"
                        value={formData.categoryDescription}
                        onChange={(e) => handleChange('categoryDescription', e.target.value)}
                    />

                    <PlainInput 
                        label="Sequence in Menu"
                        value={formData.seqInMenu}
                        onChange={(e) => handleChange('seqInMenu', e.target.value)}
                    />

                    <label>Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />

                    {previewUrl && (
                        <div>
                            <p>Preview:</p>
                            <img src={previewUrl} alt="Preview" className="preview-image" />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestionCategory;
