import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from '../../../config/supabaseClient';
import './index.css';

import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';

const ViewAppUser = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [user, setUser] = useState(null);
    const [planName, setPlanName] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
            setToastInfo({ visible: true, message, type });
            setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
    
            try {
                // Step 1: Fetch user details
                const { data: userData, error: userError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (userError) throw userError;
    
                setUser(userData);

                if(userData.plan_id) {
                    const { data: planData, error: planDataError } = await supabase
                        .from("packages")
                        .select("package_name")
                        .eq("id", userData.plan_id)
                        .single(); 

                    if (planDataError){
                        showToast("Error fetching plan name.", "error");
                        throw planDataError;
                    } else {
                        setPlanName(planData.package_name);
                    }
                } else {
                    setPlanName("");
                }

                const { data: referralsData, error: referralsError } = await supabase
                    .from("profiles")
                    .select("id, username, created_at")
                    .eq("referrer", id);
                if (referralsError) throw referralsError;

                setReferrals(referralsData);

            } catch (err) {
                showToast("Failed to fetch user details.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserDetails();
    }, [id]);

    
    if (loading) return <p>Loading user...</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "courier new" }}>
            <BackButton to="/admin/appusers" />    
            <h2>App User Details</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            <div className="edit-user-container">
            
                <div className="admin-content">
                    <form className="outsider">
                        <div className="insider">
                            <PlainInput
                                label="Username"
                                value={user.username}
                                readOnly
                            />
                            <PlainInput
                                label="Email"
                                value={user.email}
                                readOnly
                            />

                            <PlainInput
                                label="First Name"
                                value={user.first_name}
                                readOnly
                            />
                            <PlainInput
                                label="Last Name"
                                value={user.last_name}
                                readOnly
                            />
                            <PlainInput
                                label="Phone"
                                value={user.phone}
                                readOnly
                            />
                            <PlainInput
                                label="Plan Name"
                                value={planName}
                                readOnly 
                            />
                            <PlainInput
                                label="Plan Expired Date"
                                value={user.plan_expired_date ? new Date(user.plan_expired_date).toLocaleString() : ""}
                                readOnly
                            />

                            <PlainInput
                                label="Referral Code"
                                value={user.referral_code}
                                readOnly 
                            />

                            <div className="form-group">
                                <label>Profile Picture:</label>
                                {user.picture_path && (
                                    <img
                                        src={`${supabase.storage.from("profile-picture").getPublicUrl(user.picture_path).publicURL}`}
                                        alt="Current Picture"
                                        className="current-picture"
                                    />
                                )}
                            </div>
                        </div>

                    </form>

                    <h3 className="sub-title" style={{ marginTop: "50px" }}>{user.username} Referrals</h3>
                    <table
                        style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <thead>
                        <tr style={{ backgroundColor: "#f4f4f4" }}>
                            <th className="normal-header">Username</th>
                            <th className="normal-header">Joined Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {referrals.length > 0 ? (
                            referrals.map((referral) => (
                            <tr key={referral.id}>
                                <td className='normal-column'>{referral.username}</td>
                                <td className='normal-column'>
                                {new Date(referral.created_at).toLocaleString()}
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
                                No referrals under this user found.
                            </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
        
    );
};

export default ViewAppUser;
