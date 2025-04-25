import { useState } from "react";
import supabase from "../../../config/supabaseClient"; // Ensure Supabase client is initialized

const FileUploader = ({ storageBucket, folder = "", onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Upload file to the selected Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from(storageBucket) // Uses dynamic storage bucket
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      console.log(filePath);
      console.log(fileName);

      onUpload(filePath); // Pass image path to parent component
    } catch (error) {
      console.error("File upload failed:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field-container">
      <label>Upload File:</label>
      <input type="file" className="enhanced-input" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default FileUploader;
