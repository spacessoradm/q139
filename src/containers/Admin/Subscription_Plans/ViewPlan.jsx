import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const ViewPlan = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [plan, setPlan] = useState("");
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSinglePlan = async () => { 
            setLoading(true);
    
            try {
                const { data: planData, error: planError } = await supabase
                    .from("subscription_plans")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (planError) throw planError;
    
                setPlan(planData);
    
            } catch (err) {
                showToast("Failed to fetch plan details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchSinglePlan();
    }, [id]);
    
    if (loading) return <p>Loading plan...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/subscriptionplans" />    
            <h2>Plan Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                    <PlainInput
                            label="Name:"
                            value={plan.name}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Price:"
                            value={plan.price}
                            type="text"
                            readOnly
                    />
                    <PlainInput
                            label="Duration:"
                            value={plan.duration}
                            type="text"
                            readOnly
                    />
                    <TextArea 
                            label="Features:"
                            value={plan.features}
                            rows={10}
                            readOnly
                    />

                    <PlainInput
                            label="Payment Product Id:"
                            value={plan.payment_product_id}
                            type="text"
                            readOnly
                    />

                </div>
            </form>
        </div>
        
    );
};

export default ViewPlan;
