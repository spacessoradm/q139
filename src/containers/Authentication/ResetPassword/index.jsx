import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // or any routing library
import supabase from '../../../config/supabaseClient';// Adjust import as per your setup

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if `access_token` is present
        const token = searchParams.get('access_token');
        if (!token) {
            setMessage('Invalid or expired password reset link.');
        }
    }, [searchParams]);

    const handlePasswordReset = async () => {
        const token = searchParams.get('access_token');
        if (!token) {
            setMessage('Invalid or expired token.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage('Password updated successfully! You can now log in.');
            }
        } catch (error) {
            setMessage('An error occurred.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Reset Your Password</h1>
            <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handlePasswordReset} disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
