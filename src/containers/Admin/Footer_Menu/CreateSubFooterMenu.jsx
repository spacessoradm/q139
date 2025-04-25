import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './CreateSubFooterMenu.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';

import PlainInput from "../../../components/Input/PlainInput";
import SingleSelect from "../../../components/Input/SingleSelect";
import ToggleButton from "../../../components/Button/Toggle";

const CreateSubFooterMenu = () => {
    const { id } = useParams(); // user_id from URL
    const navigate = useNavigate(); // Default to 'add'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        parent_id: null,
        link: "",
        order: 1,
        is_active: "enabled",
    });
    const [loading, setLoading] = useState(false);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const handleChange = (e) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value,
        });
    };

    const handleStatusChange = (status) => {
        setFormData((prevData) => ({
          ...prevData,
          is_active: status,
        }));
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: subMenuError } = await supabase
                .from('footer_menu')
                .insert([
                {
                        title: formData.title,
                        parent_id: id,
                        link: formData.link,
                        order: selectedOrder,
                        is_active: formData.is_active,
                        created_at: new Date().toISOString(),
                        modified_at:new Date().toISOString(),
                    },
            ]);

            if (subMenuError) throw subMenuError;

            showToast('Sub Menu created successfully.', 'success')
            navigate('/admin/footermenu/edit/' + id);
        } catch (error) {
            showToast('Failed to create sub menu.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-venue-category-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/footermenu" />   
            <h2>Create Sub Menu </h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                <PlainInput
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <PlainInput 
                  label="Link" 
                  value={formData.link} 
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />

                <SingleSelect
                    label="Order"
                    options={Array.from({ length: 10 }, (_, index) => ({
                        value: index + 1,
                        label: (index + 1).toString(),
                      }))}
                    value={selectedOrder}
                    onChange={setSelectedOrder}
                />

                <ToggleButton formData={formData} handleStatusChange={handleStatusChange} />

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateSubFooterMenu;
