import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import SingleSelect from "../../../components/Input/SingleSelect";

const EditTestimonial = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        displayname: '',
        subject: '',
        content: '',
        status: '',
        profilepic_path: '',
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchTestimonial = async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                showToast('Failed to fetch testimonial.', 'error');
            } else {
                setFormData(data);
                setPreviewUrl(data.profilepic_path ? `${supabase.storage.from('users').getPublicUrl(data.profilepic_path).publicURL}` : null);
            }
        };

        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username');

            if (error) {
                console.error("Error fetching users:", error);
            } else {
                setUsers(data || []);
            }
        };

        fetchTestimonial();
        fetchUsers();
    }, [id]);

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
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
        if (!image) return formData.profilepic_path;

        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profile/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('users')
            .upload(filePath, image);

        if (uploadError) throw uploadError;

        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const imagePath = await uploadImage();

            const { error } = await supabase
                .from('testimonials')
                .update({
                    user_id: formData.user_id,
                    displayname: formData.displayname,
                    subject: formData.subject,
                    content: formData.content,
                    status: formData.status,
                    profilepic_path: imagePath,
                })
                .eq('id', id);

            if (error) throw error;

            showToast('Testimonial updated successfully.', 'success');
            navigate('/admin/testimonials');
        } catch (error) {
            showToast('Failed to update testimonial.', 'error');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/testimonials" />   
            <h2>Edit Testimonial</h2> 

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <PlainInput 
                        label="Display Name"
                        value={formData.displayname}
                        onChange={(e) => handleChange('displayname', e.target.value)}
                    />

                    <SingleSelect
                        label="User"
                        value={formData.user_id}
                        onChange={(selectedUserId) => handleChange('user_id', selectedUserId)}
                        options={users.map((user) => ({ label: user.username, value: user.id }))}
                        required
                    />

                    <PlainInput 
                        label="Subject"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                    />

                    <TextArea
                        label="Content"
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        rows={10}
                    />

                    <div className='field-container'>
                        <label>Profile Picture</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />

                        {previewUrl && (
                            <div>
                                <p>Preview:</p>
                                <img src={previewUrl} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', marginTop: '10px' }} />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTestimonial;
