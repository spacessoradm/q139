import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './ViewBlogTag.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

const ViewBlogTag = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [blogTag, setBlogTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchBlogTagDetails = async () => { 
            setLoading(true);
    
            try {
                const { data: blogTagData, error: blogTagDataError } = await supabase
                    .from("blog_tags")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (blogTagDataError) throw blogTagDataError;
    
                setBlogTag(blogTagData);
    
            } catch (err) {
                showToast("Failed to fetch blog tag details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchBlogTagDetails();
    }, [id]);

    
    if (loading) return <p>Loading blog tag...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/blogtags" />    
            <h2>Blog Tag Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">
                    <div className="field-container">
                        <label>Tag Name:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={blogTag.tag_name}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Status:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={blogTag.status}
                            readOnly
                        />
                    </div>
                    <div className="field-container">
                        <label>Created At:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            value={blogTag.created_at}
                            readOnly
                        />
                    </div>

                </div>
                </form>
        </div>
        
    );
};

export default ViewBlogTag;
