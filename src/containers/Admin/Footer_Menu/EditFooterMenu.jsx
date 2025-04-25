import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPlus } from 'react-icons/fa';
import supabase from "../../../config/supabaseClient";
import './EditFooterMenu.css';   
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import Pagination from '../../../components/pagination';

import PlainInput from "../../../components/Input/PlainInput";
import SingleSelect from "../../../components/Input/SingleSelect";

const EditFooterMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState(null);
  const [subMenuList, setSubMenuList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1); 
  const [formData, setFormData] = useState({
    title: "",
    parent_id: null,
    link: "",
    order: 0,
    status: "enabled",
  });

  const limit = 5;
  const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
  };

  const fetchDetails = async (pageNumber = 1) => {
    setLoading(true);
  
    try {
      const start = (pageNumber - 1) * limit;
      const end = start + limit - 1;
  
      const { data: menuItem, error: menuItemError } = await supabase
        .from("footer_menu")
        .select("*")
        .eq("id", id)
        .single();
  
      if (menuItemError){
        showToast('Failed to fetch menu item details. ' + menuItemError.message, 'error');
        throw menuItemError;
      } 

      setMenuItem(menuItem);
      setFormData({
        title: menuItem.title,
        parent_id: menuItem.parent_id,
        link: menuItem.link,
      });
      setSelectedOrder(menuItem.order);
      setStatus(menuItem.is_active);
  
      // Fetch submenu items
      const { data: subMenuList, error: subMenuListError } = await supabase
        .from("footer_menu")
        .select("*")
        .eq("parent_id", id)
        .range(start, end);

  
      setSubMenuList(subMenuList);
      setTotalPages(Math.ceil(subMenuList.length / limit));
  
    } catch (err) {
      showToast("Failed to fetch menu item details. " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDetails(page);
  }, [id, page]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchDetails(newPage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const { error: updateError } = await supabase
            .from("footer_menu")
            .update({
                title: formData.title,
                parent_id: formData.parent_id,
                link: formData.link,
                order: selectedOrder,
                is_active: status,
                modified_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) throw updateError;

        showToast("Footer menu updated successfully.", "success");
        navigate("/admin/footermenu");
    } catch (error) {
        console.error("Error updating footer menu:", error.message);
        showToast("Failed to update footer menu.", "error");
    }
};


  const onCreate = () => navigate(`/admin/footermenu/create/submenu/${id}`);

  if (loading) return <p>Loading data...</p>;
  

  return (
    <div style={{ padding: "20px", fontFamily: "courier new" }}>
      <BackButton to="/admin/footermenu" />    
      <h2>Footer Menu Details</h2>

      {toastInfo.visible && (
          <Toast message={toastInfo.message} type={toastInfo.type} />
      )}

      <div className="edit-user-container">

        <div className="admin-content">
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
                  selectedValue={selectedOrder}
                  onChange={setSelectedOrder}
                />

                <div className="field-container">
                        <label>Status:</label>
                        <select
                            className="enhanced-input"
                            value={status}  
                            onChange={(e) => setStatus(e.target.value)} 
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn">Submit</button>     

              </div>
          </form>

          <h3 className="sub-title">Sub Menu List</h3>
          <FaPlus
            onClick={onCreate}
            title="Create"
            className="create-button"
          />
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
                <th className="normal-header">Title</th>
                <th className="normal-header">Link</th>
                <th className="normal-header">Is Active</th>
                <th className="normal-header">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {subMenuList.length > 0 ? (
                subMenuList.map((subMenu) => (
                  <tr key={subMenu.id}>
                    <td className='normal-column'>{subMenu.title}</td>
                    <td className='normal-column'>{subMenu.link}</td>
                    <td className='normal-column'>{subMenu.is_active}</td>
                    <td className='normal-column'>
                      {new Date(subMenu.modified_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EditFooterMenu;
