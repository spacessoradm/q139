import React, { useState, useEffect } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import supabase from "../../../config/supabaseClient";
import "./index.css";
import Toast from "../../../components/Toast";
import { X } from 'lucide-react';

const EditBlog = ({ id, onClose }) => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags_id: [],
        status: "",
        image_path: "",
    });

    const [tags, setTags] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    useEffect(() => {
        if (!id) return;

        const fetchBlogTags = async () => {
            const { data, error } = await supabase.from("blog_tags").select("id, tag_name");
            if (!error) setTags(data.map(tag => ({ value: tag.id, label: tag.tag_name })));
        };

        const fetchBlog = async () => {
            const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
            if (!error) {
                setFormData({
                    title: data.title,
                    content: data.content,
                    tags_id: data.tags_id || [],
                    status: data.status,
                    image_path: data.image_path,
                });
            }
        };

        fetchBlogTags();
        fetchBlog();
    }, [id]);

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleContentChange = value => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error: updateError } = await supabase
                .from("blogs")
                .update({
                    title: formData.title,
                    content: formData.content,
                    tags_id: formData.tags_id,
                    status: formData.status,
                    modified_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (updateError) throw updateError;

            onClose(); // Close the modal after updating
        } catch (error) {
            setToastInfo({ visible: true, message: `Error updating blog: ${error.message}`, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ fontFamily: 'Poppins' }}>
            <div className="modal-container">
                <X onClick={onClose} />

                {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

                <form onSubmit={handleSubmit}>
                    <div style={{ paddingTop: '12px' }}>
                        <label>Title:</label>
                        <input
                            className="enhanced-input" 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            required />
                    </div>

                    <div style={{ paddingTop: '12px' }}>
                        <label>Tag:</label>
                        <Select
                            className="enhanced-input"
                            options={tags}
                            isMulti
                            value={tags.filter(option => formData.tags_id.includes(option.value))}
                            onChange={selectedOptions =>
                                setFormData(prev => ({ ...prev, tags_id: selectedOptions.map(option => option.value) }))
                            }
                        />
                    </div>

                    <div style={{ paddingTop: '12px' }}>
                        <label>Content:</label>
                        <ReactQuill
                             theme="snow" 
                             value={formData.content} 
                             onChange={handleContentChange}
                             className="enhanced-input" 
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: '12px' }}>
                        {loading ? "Updating..." : "Update"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditBlog;
