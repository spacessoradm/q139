import { createClient } from '@supabase/supabase-js';

// Use environment variables defined in `.env`
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is not defined. Check your .env file.");
    throw new Error("Missing Supabase configuration.");
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, { 
    auth: {
        persistSession: true, // Ensure sessions are persisted
        storageKey: 'supabase.auth.token', // Explicit storage key
        storage: localStorage,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Add a method to check and restore session
supabase.auth.restoreSession = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Restore Session - Data:', data);
        console.log('Restore Session - Error:', error);

        if (error) {
            console.error('Session restoration error:', error);
            return null;
        }

        return data.session;
    } catch (error) {
        console.error('Unexpected error in session restoration:', error);
        return null;
    }
};

export default supabase;