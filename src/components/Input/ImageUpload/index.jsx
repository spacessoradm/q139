import { useState } from "react";
import supabase from "../../../config/supabaseClient"; // Ensure Supabase client is initialized

const ImageUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `venue-${Date.now()}.${fileExt}`;
    const filePath = `venue_main/${fileName}`;
    const uploadPath = `${fileName}`;

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("venue_main") // Replace with actual bucket name
        .upload(uploadPath, file, { cacheControl: "3600", upsert: true });

      console.log(uploadError);
      if (uploadError) throw uploadError;

      if (filePath) {
        onUpload(filePath); // Pass image URL to parent component
      } else {
        throw new Error("Public URL could not be retrieved.");
      }
    } catch (error) {
      console.error("Image upload failed:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field-container">
      <label>Venue Profile Image:</label>
      <input type="file" className="enhanced-input" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default ImageUpload;
