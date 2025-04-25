import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';

import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const ViewQuestionCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [questionCategory, setQuestionCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchQuestionCategoryDetails = async () => { 
            setLoading(true);
            setError(null);
    
            try {
                const { data: questionCategoryData, error: questionCategoryDataError } = await supabase
                    .from("question_category")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (questionCategoryDataError) throw questionCategoryDataError;
    
                setQuestionCategory(questionCategoryData);
    
            } catch (err) {
                showToast("Failed to fetch category details.", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchQuestionCategoryDetails();
    }, [id]);
    
    if (loading) return <p>Loading category...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Courier New" }}>
            <BackButton to="/admin/questioncategory" />    
            <h2>Question Category Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}

            <form className="outsider">
                <div className="insider">

                    <PlainInput label="Category Name" value={questionCategory.category_name} readOnly />
                    <TextArea label="Description" value={questionCategory.description} readOnly />
                    <PlainInput label="Sequence in Menu" value={questionCategory.seq_in_menu} readOnly />
                    <PlainInput label="Created At" value={questionCategory.created_at} readOnly />

                </div>
                </form>
        </div>
        
    );
};

export default ViewQuestionCategory;
