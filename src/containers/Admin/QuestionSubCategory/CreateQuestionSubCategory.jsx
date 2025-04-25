import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';

import './index.css';
import BackButton from '../../../components/Button/BackArrowButton';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';

const CreateQuestionSubCategory = () => {
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

        // Fetch running numbers
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
    }, []);

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
            console.log(formData.runningNumber)
            const { error: categoryError } = await supabase
                .from('question_subcategory')
                .insert([
                    {
                        subcategory_name: formData.subCategoryName,
                        description: formData.categoryDescription,
                        parent: formData.parent,
                        seq_in_menu: Number(formData.seqInMenu),
                        running_number_id: Number(formData.runningNumber),
                    },
                ]);

            if (categoryError) throw categoryError;

            showToast('Question subcategory created successfully.', 'success');

            navigate('/admin/questionsubcategory');
        } catch (error) {
            showToast('Failed to create question subcategory.', 'error');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/questionsubcategory" />   
            <h2>Create New Question Subcategory</h2> 

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

                    <div className=''>
                        <label>Parent Category</label>
                        <select
                            className='enhanced-input' 
                            value={formData.parent} 
                            onChange={(e) => handleChange('parent', e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.category_name}</option>
                            ))}
                        </select>
                    </div>

                    <PlainInput 
                        label="Sequence in Menu"
                        value={formData.seqInMenu}
                        onChange={(e) => handleChange('seqInMenu', e.target.value)}
                    />

                    <div className=''>
                        <label>Running Number</label>
                        <select
                            className='enhanced-input'
                            value={formData.runningNumber}
                            onChange={(e) => handleChange('runningNumber', e.target.value)}
                        >
                            <option value="">Select a running number</option>
                            {runningNumbers.map((number) => (
                                <option key={number.id} value={number.id}>
                                    {number.name} {/* Label shows name, value stores id */}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuestionSubCategory;
