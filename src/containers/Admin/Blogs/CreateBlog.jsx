import React, { useState, useEffect } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import supabase from "../../../config/supabaseClient";

import "./index.css";
import Toast from "../../../components/Toast";
import { X } from 'lucide-react';

const CreateBlog = ({ onClose }) => {
    if (!onClose) {
        console.error("❌ onClose is not passed to CreateBlog");
    }
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags_id: [],
        image_path: "",
    });

    const [blogTags, setBlogTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        const fetchBlogTags = async () => {
            try {
                const { data, error } = await supabase
                    .from("blog_tags")
                    .select("*")
                    .eq("status", "enabled");

                if (error) throw error;

                setBlogTags(
                    data.map((tag) => ({
                        value: tag.id,
                        label: tag.tag_name,
                    }))
                );
            } catch (err) {
                showToast(`Error fetching blog tags: ${err.message}`, "error");
            }
        };

        fetchBlogTags();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleContentChange = (value) => {
        setFormData((prev) => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from("blogs").insert([
                {
                    title: formData.title,
                    content: formData.content,
                    tags_id: formData.tags_id,
                    image_path: "",
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                },
            ]);

            if (error) throw error;

            showToast("Blog created successfully.", "success");
            onClose(); // Close popup after submission
        } catch (error) {
            showToast(`Failed to create blog: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        console.log("Closing modal...");
        onClose(); 
    };

    return (
        <div className="modal-overlay" style={{ fontFamily: 'Poppins' }}>
            <div className="modal-container">
                <X onClick={onClose} />
                <h2>Create New Blog</h2>

                {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

                <form onSubmit={handleSubmit} className="form-container">
                    <div style={{ paddingTop: '12px' }}>
                        <label>Title:</label>
                        <input
                            className="enhanced-input"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ paddingTop: '12px' }}>
                        <label>Tag:</label>
                        <Select
                            options={blogTags}
                            isMulti
                            value={blogTags.filter((option) => formData.tags_id.includes(option.value))}
                            onChange={(selectedOptions) =>
                                setFormData({
                                    ...formData,
                                    tags_id: selectedOptions.map((option) => option.value),
                                })
                            }
                            placeholder="Choose at least one tag"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div style={{ paddingTop: '12px' }}>
                        <label>Content:</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            modules={{
                                toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link", "image"],
                                ],
                            }}
                            formats={[
                                "header",
                                "bold",
                                "italic",
                                "underline",
                                "list",
                                "bullet",
                                "link",
                                "image",
                            ]}
                            className="enhanced-input"
                        />
                    </div>

                    <button type="submit" className="create-btn" disabled={loading} style={{ marginTop: '12px' }}>
                        {loading ? "Creating..." : "Create"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateBlog;
