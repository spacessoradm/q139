import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import SingleSelect from '../../../components/Input/SingleSelect';

const EditPlan = () => {
    const { id } = useParams();
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [features, setFeatures] = useState("");
    const [paymentProdID, setPaymentProdID] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSinglePlan = async () => {
            try {
                const { data: planData, error: planError } = await supabase
                    .from("subscription_plans")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (planError) throw planError;

                setName(planData.name);
                setPrice(planData.price);
                setDuration(planData.duration);
                setFeatures(planData.features);
                setPaymentProdID(planData.payment_prod_id);
            } catch (error) {
                showToast("Error fetching plan data", "error");
            }
        };

        fetchSinglePlan();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("subscription_plans")
                .update({
                    name: name,
                    price: price,
                    duration: duration,
                    features: features,
                    payment_prod_id: paymentProdID
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Plan updated successfully.", "success");
            navigate("/admin/subscriptionplans");
        } catch (error) {
            showToast("Failed to update plan.", "error");
        }
    };
 
    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/subscriptionplans" /> 
            <h2>Edit Plan</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">

                    <PlainInput
                        label="Name:"
                        value={name}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    
                    <PlainInput
                        label="Price:"
                        value={price}
                        type="text"
                        onChange={(e) => setPrice(e.target.value)}
                    />

                    <PlainInput
                        label="Duration:"
                        value={duration}
                        type="text"
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    />

                    <PlainInput
                        label="Features:"
                        value={features}
                        type="text"
                        onChange={(e) => setFeatures(e.target.value)}
                        required
                    />

                    <PlainInput
                        label="Payment Product ID:"
                        value={paymentProdID}
                        type="text"
                        onChange={(e) => setPaymentProdID(e.target.value)}
                        required
                    />

                    <button type="submit" className="submit-btn">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default EditPlan;
