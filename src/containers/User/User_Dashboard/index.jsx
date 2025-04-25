import { useEffect, useState } from "react";
import supabase from "../../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./index.css";

const UserDashboard = () => {
    const [userRole, setUserRole] = useState(null);
    const [adminUser, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch admin user and dropdown data
    useEffect(() => {

        const fetchUser = async () => {
            const ur = localStorage.getItem('role');
            console.log("ur", ur);
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching user:", error.message);
                navigate("/login");
            } else {
                const user = data?.session?.user || null;// Replace with dynamic role fetching
                if (ur == "admin") {
                    console.warn("Access denied: Not an user of this system.");
                    navigate("/");
                } else {
                    console.log("im here, i am user and set user");
                    setUser(user);
                }
            }
        };

        fetchUser();
    }, [navigate]);

    return (
        <div className="admin-dashboard">
            <div className="admin-content">
                <h1>User Dashboard</h1>
                {adminUser && <p>Welcome, Admin {adminUser.email}</p>}
                <button
                    className="sign-out-btn"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        localStorage.clear();
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                        navigate("/login");
                    }}
                >
                    Sign Out
                </button>
            </div>

            {/* Statistics Boxes */}
            <div className="stats-container">
                <div className="stats-box">
                </div>
                <div className="stats-box">
                </div>
                <div className="stats-box">
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
