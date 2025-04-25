import React, { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';
import TextArea from '../../../components/Input/TextArea';
import { X } from 'lucide-react';

const EditQuestionSubCategory = ({ isOpen, onClose, subcategoryId }) => {
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
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    useEffect(() => {
        if (!subcategoryId) return;

        const fetchCategories = async () => {
            const { data, error } = await supabase.from('question_category').select('id, category_name');
            if (!error) setCategories(data);
        };

        const fetchRunningNumbers = async () => {
            const { data, error } = await supabase.from('running_numbers').select('id, name');
            if (!error) setRunningNumbers(data);
        };

        const fetchSubCategory = async () => {
            const { data, error } = await supabase.from('question_subcategory').select('*').eq('id', subcategoryId).single();
            if (!error && data) {
                setFormData({
                    subCategoryName: data.subcategory_name,
                    categoryDescription: data.description,
                    parent: data.parent,
                    seqInMenu: data.seq_in_menu,
                    runningNumber: data.running_number_id,
                });
            }
        };

        fetchCategories();
        fetchRunningNumbers();
        fetchSubCategory();
    }, [subcategoryId]);

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
    };

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('question_subcategory')
                .update({
                    subcategory_name: formData.subCategoryName,
                    description: formData.categoryDescription,
                    parent: formData.parent,
                    seq_in_menu: formData.seqInMenu,
                    running_number_id: formData.runningNumber,
                })
                .eq('id', subcategoryId);

            if (error) throw error;

            showToast('Question subcategory updated successfully.', 'success');
            onClose();
        } catch (error) {
            showToast('Failed to update question subcategory.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'show' : 'hide'}`}>
            {isOpen && (
                <div className="modal-container">
                    <X onClick={onClose} />
                    <h2>Edit Question Subcategory</h2>

                    {toastInfo.visible && <Toast message={toastInfo.message} type={toastInfo.type} />}

                    <form onSubmit={handleSubmit} className="modal-form">
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
                        <select className='enhanced-input' value={formData.parent} onChange={(e) => handleChange('parent', e.target.value)} required>
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
                        <select className='enhanced-input' value={formData.runningNumber} onChange={(e) => handleChange('runningNumber', e.target.value)} required>
                            <option value="">Select a running number</option>
                            {runningNumbers.map((number) => (
                                <option key={number.id} value={number.id}>{number.name}</option>
                            ))}
                        </select>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EditQuestionSubCategory;
