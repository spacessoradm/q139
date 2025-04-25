import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './index.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const EditRole = () => {
    const { id } = useParams();
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchSingleRole = async () => {
            try {
                const { data: roleData, error: roleError } = await supabase
                    .from("roles")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (roleError) throw roleError;

                setRole(roleData);
                setStatus(roleData.status);
            } catch (error) {
                showToast("Failed to fetch role data.", "error");
            }
        };

        fetchSingleRole();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("roles")
                .update({
                    name: role.name,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Role updated successfully.", "success");
            navigate("/admin/roles");
        } catch (error) {
            showToast("Failed to update role.", "error");
        }
    };
 
    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/roles" /> 
            <h2>Edit Role</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={role.name}
                            onChange={(e) => setRole({ ...role, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field-container">
                        <label>Status:</label>
                        <select
                            className="enhanced-input"
                            value={status}  
                            onChange={(e) => setStatus(e.target.value)} 
                        >
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">Submit</button>
                
                </div>
            </form>
        </div>
    );
};

export default EditRole;
