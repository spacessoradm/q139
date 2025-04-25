import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import supabase from "../../../config/supabaseClient";
import './CreateFooterMenu.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import PlainInput from "../../../components/Input/PlainInput";
import SingleSelect from "../../../components/Input/SingleSelect";
import ToggleButton from "../../../components/Button/Toggle";

const CreateFooterMenu = () => {
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    parent_id: null,
    link: "",
    order: 1,
    is_active: "enabled",
  });
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToastInfo({ visible: true, message, type });
    setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.
      from("footer_menu").
      insert([
        {
          title: formData.title,
          parent_id: formData.parent_id,
          link: formData.link,
          order: selectedOrder,
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }
      ]);

      if (error) {
        showToast("An error occurred. " + error.message, "error");
        return;
      }

      showToast("Menu created successfully!", "success");
      navigate("/admin/footermenu");
    } catch (err) {
      showToast("An unexpected error occurred. " + err.message, "error");
    }
  };

  const handleStatusChange = (status) => {
    setFormData((prevData) => ({
      ...prevData,
      is_active: status,
    }));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "courier new" }}>
      <BackButton to="/admin/footermenu" />
      <h2>Create Footer Menu</h2>

      {toastInfo.visible && (
        <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      <form onSubmit={handleSubmit} className="outsider">
        <div className="insider">
          <PlainInput
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <PlainInput
            label="Link"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          <SingleSelect
            label="Order"
            options={Array.from({ length: 10 }, (_, index) => ({
              value: index + 1,
              label: (index + 1).toString(),
            }))}
            value={selectedOrder}
            onChange={setSelectedOrder}
          />

          <ToggleButton formData={formData} handleStatusChange={handleStatusChange} />
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFooterMenu;
