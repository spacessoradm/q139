import supabase from '../../../config/supabaseClient';

export const fetchAll = async (page, limit) => {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, username, created_at', { count: 'exact' }) 
      .eq('isDeleted', 0)
      .order('created_at', { ascending: false }) 
      .range(start, end);

    if (error) throw error;

    const totalPages = Math.ceil(count / limit); // Calculate total pages

    return { success: true, data, totalPages, message: null };

    } catch (error) {
      return { success: false, data: [], count: 0, message: error.message }; // Standard error response
    }
};

export const fetchSingle = async (id) => {
  try {
    const { data: profileData, error: profileDataError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (profileDataError) throw profileDataError;

    if(profileData.subscription_plan_id) {
        const { data: planData, error: planDataError } = await supabase
            .from("subscription_plans")
            .select("name")
            .eq("id", profileData.subscription_plan_id)
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
  }
};

export const softDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ isDeleted: 1 })  // Soft delete by updating isDeleted to 1
        .eq('id', id);
  
      if (error) return { success: false, message: error.message };
  
      return { success: true, message: "User deleted successfully." };
    } catch (err) {
      return { success: false, message: "An unexpected error occurred." };
    }
};

export const remove = async (id) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);
    
        if (error) return { success: false, message: error.message }; // Return error message
    
        return { success: true, message: "User deleted permanently." };
      } catch (err) {
        return { success: false, message: "An unexpected error occurred." };
      }
};
