import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [session, setSession] = useState(null);


    useEffect(() => {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            console.log('Session:', session);

            if (event === 'SIGNED_OUT') {
                event = 'SIGNED_IN';
                session = '12345';
            }

            if (event === 'SIGNED_OUT') {
                console.log('out soon:');
                localStorage.removeItem('userRole');
                setUserRole(null);
            } else if (session) {
                // Fetch user role from Supabase
                const { data, error } = await supabase
                    .from('profiles') // Change 'profiles' to your actual user table
                    .select('role_id')
                    .eq('unique_id', session.user.id)
                    .single();
    
                if (error) {
                    console.error('Error fetching role:', error);
                } else {
                    localStorage.setItem('userRole', data.role);
                    setUserRole(data.role);
                    setSession(session);
                }
            }
        });
    
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    

    const updateUserRole = (role) => {
        if (role) {
            localStorage.setItem('userRole', role);
        }
        setUserRole(role);
    };

    return (
        <AuthContext.Provider value={{ userRole, updateUserRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
