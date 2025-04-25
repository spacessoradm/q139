import React, { useEffect, useState } from "react";
import supabase from "../../../config/supabaseClient";

import "./index.css"; // Reuse the same CSS
import Toast from "../../../components/Toast";
import PlainInput from "../../../components/Input/PlainInput";
import TextArea from "../../../components/Input/TextArea";
import { X } from 'lucide-react';

const EditQuestionCategory = ({ isOpen, onClose, categoryId }) => {
    if (!isOpen || !categoryId) return null; // Don't render if modal is closed or no ID

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [seqInMenu, setSeqInMenu] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(""); // Holds preview of new image
    const [toastInfo, setToastInfo] = useState({ visible: false, message: "", type: "" });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        
        if (!categoryId) return; // Avoid fetching if ID is missing

        const fetchQuestionCategoryData = async () => {
            try {
                const { data, error } = await supabase
                    .from("question_category")
                    .select("*")
                    .eq("id", categoryId)
                    .single();

                if (error) throw error;

                setName(data.category_name);
                setDescription(data.description);
                setSeqInMenu(data.seq_in_menu);
                setImageUrl(data.Image_Path);
            } catch (error) {
                console.error("Error fetching question category:", error.message);
            }
        };

        fetchQuestionCategoryData();
    }, [categoryId]);

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Generate a temporary preview URL
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error } = await supabase
                .from("question_category")
                .update({
                    category_name: name,
                    description: description,
                    seq_in_menu: seqInMenu,
                })
                .eq("id", categoryId);

            if (error) throw error;

            showToast("Question category updated successfully.", "success");
            onClose(); // Close modal after successful update
        } catch (error) {
            console.error("Error updating question category:", error.message);
            showToast("Failed to update question category.", "error");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <X onClick={onClose} />
                <h2>Edit Question Category</h2>

                {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

                <form onSubmit={handleSubmit} className="insider">
                    <PlainInput label="Category Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextArea label="Category Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <PlainInput label="Seq in Menu" value={seqInMenu} onChange={(e) => setSeqInMenu(e.target.value)} />

                    {imageUrl && !previewUrl && (
                        <div>
                            <p>Current Image:</p>
                            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/question/${imageUrl}`} alt="Current Category" className="preview-image" style={{ width: "400px" }}/>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="enhanced-input">
                            <p>New Image Preview:</p>
                            <img src={previewUrl} alt="New Category" className="preview-image" style={{ width: "400px" }} />
                        </div>
                    )}

                    <label className="file-upload">
                        <span>Upload New Image</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="enhanced-input" />
                    </label>

                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default EditQuestionCategory;
