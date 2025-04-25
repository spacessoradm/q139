import './index.css';
import { useState } from 'react';
import supabase from '../../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../components/Toast';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [toastInfo, setToastInfo] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
        setToastInfo({ visible: true, message, type });
        setTimeout(() => setToastInfo({ visible: false, message: '', type: '' }), 3000); // Auto-hide
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Helper function to wait for a specific time
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                if (error.status === 400) {
                    showToast('Invalid credentials. Please try again.', 'error')
                } else if (error.status === 404) {
                    showToast('Invalid accounts. Please contact IT support.', 'error')
                } else {
                    showToast(`Login failed: ${error.message}`, 'error')
                }
                throw error;
            } else {
                showToast('Login successful!', 'success')
                await delay(3000);
            }
            
            const { data: adminProfileData, error: adminProfileError } = await supabase
                .from('profiles')
                .select('id, role_id, is_PA, is_Physics')
                .eq('user_id', data.user.id)
                .single();

            if (adminProfileError) {
                showToast(`Error fetching admin profile: ${adminProfileError.message}`, 'error')
                throw adminProfileError;
            }

            const { data: roleData, error: roleNameError } = await supabase
                .from('roles')
                .select('name')
                .eq('id', adminProfileData.role_id)
                .single();

            if (roleNameError) {
                showToast(`Error fetching role_name: ${roleNameError.message}`, 'error')
                throw roleNameError;
            }

            const roleName = roleData?.name.trim().toLowerCase() || 'Unknown';
            //updateUserRole(roleName);

            localStorage.setItem('role', roleName);
            localStorage.setItem('profileId', adminProfileData.id);
            localStorage.setItem('userName', adminProfileData.username);
            localStorage.setItem('token', data.session.access_token);

            if (adminProfileData.is_PA == true && adminProfileData.is_Physics == false) {
                localStorage.setItem('module', '2A');
            } else if (adminProfileData.is_PA == false && adminProfileData.is_Physics == true) {
                localStorage.setItem('module', 'Physics');
            } else if (adminProfileData.is_PA == true && adminProfileData.is_Physics == true) {
                localStorage.setItem('module', '2A');
            } else {
                localStorage.setItem('module', '');
            }

            if (roleName === 'admin') {
                navigate('/admin/dashboard');
            } else if(roleName === 'user') {
                navigate('/homepage');
            }
            else {
                showToast(`Unknown role: ${roleName}`, 'error')
            }

        } catch (error) {
            showToast(`Login failed: ${error.message}`, 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {toastInfo.visible && (
                <Toast message={toastInfo.message} type={toastInfo.type} />
            )}
            
            {/* Loading Overlay */}
                {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            <div className="login-container">
                <div className="login-form">
                    {/* Logo */}
                    <img 
                    src="https://vuhurnvoeziyugrmjiqs.supabase.co/storage/v1/object/public/general//acefrcr_logo.jpeg" 
                    alt="Ace FRCR Logo" 
                    className="logo"
                    />
                    <h2>Sign In to Ace FRCR Admin Panel</h2>
                    <form className='form-body' onSubmit={handleEmailLogin}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
                <div className="login-banner"></div>
            </div>
        </div>
    );
};

export default Login;
