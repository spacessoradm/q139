import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const CreatePlan = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        features: '',
        payment_prod_id: '',
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: planError } = await supabase
                .from('subscription_plans')
                .insert([
                    {
                        name: formData.name,
                        price: formData.price,
                        duration: Number(formData.duration),
                        features: formData.features,
                        payment_prod_id: Number(formData.payment_prod_id),
                    },
                ]);

            if (planError) throw packageError;

            showToast('Plan created successfully.', 'success')

            navigate('/admin/subscriptionplans');
        } catch (error) {
            showToast('Failed to create plan.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/subscriptionplans" />   
            <h2>Create New Plan</h2> 

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Name:"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />   

                    <PlainInput
                        label="Price:"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    /> 

                    <PlainInput
                        label="Duration:"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        
                    />         

                    <TextArea
                        label="Features:"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        rows={10}           
                    />   

                    <PlainInput
                        label="Payment Product ID:"
                        value={formData.payment_prod_id}
                        onChange={(e) => setFormData({ ...formData, payment_prod_id: e.target.value })}
                        
                    />   


                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePlan;
