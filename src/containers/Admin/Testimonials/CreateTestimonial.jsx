import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X } from 'lucide-react';

import './index.css';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';

Modal.setAppElement('#root'); // Ensure accessibility

const CreateTestimonial = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [formData, setFormData] = useState({
        displayname: '',
        subject: '',
        content: '',
        status: '',
    });

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            const { data: userData, error } = await supabase
                .from("profiles")
                .select("id, username");

            if (!error) {
                setUsers(userData || []);
            }
        };
        fetchUsers();
    }, []);

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

    const handleUserChange = (selectedUserId) => {
        setUserId(selectedUserId);
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
        const filePath = `profile/${fileName}`;

        const { error } = await supabase.storage
            .from('users')
            .upload(filePath, image);

        if (error) throw error;

        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const imagePath = await uploadImage();

            const { error } = await supabase
                .from('testimonials')
                .insert([{
                    user_id: userId,
                    displayname: formData.displayname,
                    subject: formData.subject,
                    content: formData.content,
                    status: formData.status,
                    profilepic_path: imagePath || null,
                }]);

            if (error) throw error;

            showToast('Testimonial created successfully.', 'success');
            onClose(); // Close modal after success
        } catch (error) {
            showToast('Failed to create testimonial.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal-content"
            overlayClassName="modal-overlay"
            style={{ fontFamily: 'Poppins' }}
        >
            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

            <form onSubmit={handleSubmit} className="modal-form" style={{ fontFamily: 'Poppins' }}>

            <X  onClick={onClose} />
            <h2>Create New Testimonial</h2>

                <PlainInput
                    label="Display Name"
                    value={formData.displayname}
                    onChange={(e) => handleChange('displayname', e.target.value)}
                />

                <SingleSelect
                    label="User"
                    value={userId}
                    onChange={handleUserChange}
                    options={users.map((user) => ({ label: user.username, value: user.id }))}
                    required
                />

                <PlainInput
                    label="Subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                />

                <label>Content</label>
                <ReactQuill
                    value={formData.content}
                    onChange={(value) => handleChange('content', value)}
                    className="quill-editor"
                />

                <div className='field-container'>
                    <label>Profile Picture</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {previewUrl && (
                        <div>
                            <p>Preview:</p>
                            <img src={previewUrl} alt="Preview" className="image-preview" />
                        </div>
                    )}
                </div>

                <div className="modal-buttons">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTestimonial;
