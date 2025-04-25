import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const EditQuestionSubCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subCategoryName: '',
        categoryDescription: '',
        parent: '',
        seqInMenu: '',
        runningNumber: '', 
    });
    const [categories, setCategories] = useState([]);
    const [runningNumbers, setRunningNumbers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from('question_category').select('id, category_name');
            if (error) {
                console.error('Error fetching categories:', error);
            } else {
                setCategories(data);
            }
        };

        const fetchSubCategory = async () => {
            const { data, error } = await supabase.from('question_subcategory').select('*').eq('id', id).single();
            if (error) {
                console.error('Error fetching subcategory:', error);
            } else {
                setFormData({
                    subCategoryName: data.subcategory_name,
                    categoryDescription: data.description,
                    parent: data.parent,
                    seqInMenu: data.seq_in_menu,
                    runningNumber: data.running_number_id
                });
            }
        };

        const fetchRunningNumbers = async () => {
            const { data, error } = await supabase.from('running_numbers').select('id, name');
            if (error) {
                console.error('Error fetching running numbers:', error);
            } else {
                setRunningNumbers(data);
            }
        };
        

        fetchCategories();
        fetchRunningNumbers();
        fetchSubCategory();
    }, [id]);

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const { error: updateError } = await supabase
                .from('question_subcategory')
                .update({
                    subcategory_name: formData.subCategoryName,
                    description: formData.categoryDescription,
                    parent: formData.parent,
                    seq_in_menu: formData.seqInMenu,
                    running_number_id: formData.runningNumber,  // Ensure this is included
                })
                .eq('id', id);
    
            if (updateError) throw updateError;
    
            showToast('Question subcategory updated successfully.', 'success');
            navigate('/admin/questionsubcategory');
        } catch (error) {
            showToast('Failed to update question subcategory.', 'error');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/questionsubcategory" />   
            <h2>Edit Question Subcategory</h2> 

            {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}
            
            <form onSubmit={handleSubmit} className="outsider">
                <div className="insider">
                    <PlainInput 
                        label="SubCategory Name"
                        value={formData.subCategoryName}
                        onChange={(e) => handleChange('subCategoryName', e.target.value)}
                        required
                    />

                    <TextArea 
                        label="Category Description"
                        value={formData.categoryDescription}
                        onChange={(e) => handleChange('categoryDescription', e.target.value)}
                    />

                    <label>Parent Category</label>
                    <select 
                        value={formData.parent} 
                        onChange={(e) => handleChange('parent', e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.category_name}</option>
                        ))}
                    </select>

                    <PlainInput 
                        label="Sequence in Menu"
                        value={formData.seqInMenu}
                        onChange={(e) => handleChange('seqInMenu', e.target.value)}
                    />

                    <label>Running Number</label>
                    <select 
                        value={formData.runningNumber} 
                        onChange={(e) => handleChange('runningNumber', e.target.value)}
                        required
                    >
                        <option value="">Select a running number</option>
                        {runningNumbers.map((number) => (
                            <option key={number.id} value={number.id}>{number.name}</option>
                        ))}
                    </select>


                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditQuestionSubCategory;
