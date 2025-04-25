import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";

import './EditBlogTag.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const EditBlogTag = () => {
    const { id } = useParams();
    const [blogTag, setBlogTag] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchBlogTagData = async () => {
            try {
                // Fetch venue category data from the database
                const { data: blogTagData, error: blogTagError } = await supabase
                    .from("blog_tags")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (blogTagError) throw blogTagError;

                setBlogTag(blogTagData);
                setStatus(blogTagData.status);
            } catch (error) {
                showToast("Failed to fetch blog tag data.", "error");
            }
        };

        fetchBlogTagData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error: updateError } = await supabase
                .from("blog_tags")
                .update({
                    tag_name: blogTag.tag_name,
                    status: status,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            showToast("Blog tag updated successfully.", "success");
            navigate("/admin/blogtags");
        } catch (error) {
            showToast("Failed to update blog tag.", "error");
        }
    };
 
    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogtags" /> 
            <h2>Edit Blog Tag</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Tag Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={blogTag.tag_name}
                            onChange={(e) => setBlogTag({ ...blogTag, tag_name: e.target.value })}
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

export default EditBlogTag;
