import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../../config/supabaseClient";
import './index.css';
import BackButton from "../../../components/Button/BackArrowButton";
import Toast from '../../../components/Toast';
import PlainInput from '../../../components/Input/PlainInput';

const EditAppUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentPicturePath, setCurrentPicturePath] = useState("");
    const [picture, setPicture] = useState(null);
    const [user, setUser] = useState({
        unqID: "",
        userName: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        plan_id: "",
        plan_expired_date: null,
        referral_code: "",
        roleName: "",
        picture: null
    });
    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });
    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: user, error: userError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (userError) throw userError;

                if (user) {
                    setUser(prevUser => ({
                        ...prevUser,
                        userName: user?.username || "",
                        firstName: user?.first_name || "",
                        lastName: user?.last_name || "",
                        phone: user?.phone || "",
                        email: user?.email || "",
                        plan_id: user?.plan_id || "",
                        plan_expired_date: user?.plan_expired_date || null,
                        referral_code: user?.referral_code || "",
                    }));
                }

                setCurrentPicturePath(user.pic_path);

                /*const { data: notificationData, error: notificationError } = await supabase
                    .from("notification_day")
                    .select("id, day");

                if (notificationError) {
                    console.error("Error fetching notification days:", notificationError);
                } else {
                    setNotificationDay(notificationData || []);
                }*/

            } catch (error) {
                console.error("Error fetching user data:", error.message);
            }
        };

        fetchUserData();
    }, [id]);

    const handlePictureChange = (e) => {
        setPicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let picturePath = currentPicturePath;

            if (picture) {
                const { data: pictureUploadData, error: pictureError } = await supabase.storage
                    .from("profile_picture")
                    .upload(`pictures/${picture.name}`, picture, { upsert: true });

                if (pictureError) throw pictureError;

                picturePath = pictureUploadData.path;
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    username: user.userName,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    phone: user.phone,
                    email: user.email,
                    pic_path: picturePath,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            alert("User updated successfully!");
            navigate("/admin/appusers");
        } catch (error) {
            console.error("Error updating user:", error.message);
            alert("Failed to update user.");
        }
    };

    return (
        <div className="edit-user-container" style={{ fontFamily: "Courier New" }}>
            <BackButton to="/admin/appusers" />
            <h2>Edit App User</h2>

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
                
                <form className="outsider" onSubmit={handleSubmit}>
                    <div className="insider">

                        <PlainInput
                            label="User Name:"
                            value={user.userName}
                            onChange={(e) => setUser(prevUser => ({
                                ...prevUser,
                                userName: e.target.value
                            }))}
                            required
                        />

                        <PlainInput
                            label="First Name:"
                            value={user.firstName}
                            onChange={(e) => setUser(prevUser => ({
                                ...prevUser,
                                firstName: e.target.value
                            }))}
                        />

                        <PlainInput
                            label="Last Name:"
                            value={user.lastName}
                            onChange={(e) => setUser(prevUser => ({
                                ...prevUser,
                                lastName: e.target.value
                            }))}
                        />

                        <PlainInput
                            label="Email:"
                            value={user.email}
                            onChange={(e) => setUser(prevUser => ({
                                ...prevUser,
                                email: e.target.value
                            }))}
                        />

                        <PlainInput
                            label="Phone No.:"
                            value={user.phone}
                            onChange={(e) => setUser(prevUser => ({
                                ...prevUser,
                                phone: e.target.value
                            }))}
                        />

                        
                        <PlainInput
                            label="Plan Expired Date:"
                            format="date"
                            value={user.plan_expired_date 
                                ? new Date(user.plan_expired_date).toISOString().slice(0, 16).replace("T", " ") 
                                : ""}
                            onChange={(e) => setUser(prevUser => ({
                                ...prevUser,
                                plan_expired_date: e.target.value
                            }))}
                        />

                        <PlainInput
                            label="Referral Code:"
                            value={user.referral_code}
                            readOnly
                        />

                        <div className="form-group">
                            <label>Profile Picture:</label>
                            {currentPicturePath && (
                                <img
                                    src={`${supabase.storage.from("profile_picture").getPublicUrl(currentPicturePath).publicURL}`}
                                    alt="Current Picture"
                                    className="current-picture"
                                />
                            )}
                            <label>New Picture (optional):</label>
                            <input type="file" accept="image/*" onChange={handlePictureChange} />
                        </div>

                        <button type="submit" className="submit-btn">Update User</button>
                    </div>
                </form>
        </div>
    );
};

export default EditAppUser;
