import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const ViewRole = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchRoleDetails = async () => { 
            setLoading(true);
    
            try {
                const { data: roleData, error: roleDataError } = await supabase
                    .from("roles")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (roleDataError) throw roleDataError;
    
                setRole(roleData);
    
            } catch (err) {
                showToast("Failed to fetch role details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchRoleDetails();
    }, [id]);

    
    if (loading) return <p>Loading role...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/roles" />    
            <h2>role Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Role Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={role.name}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Status:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={role.status}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Updated At:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={role.modified_at}
                            readOnly
                        />
                    </div>

                </div>
                </form>
        </div>
        
    );
};

export default ViewRole;
