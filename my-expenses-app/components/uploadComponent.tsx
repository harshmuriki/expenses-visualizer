import React, { useState } from "react";
interface UploadComponentProps {
  onUploadSuccess: () => void; // Callback function to trigger data fetch
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      const data = await response.json();
      console.log("Upload successful:", data);
      onUploadSuccess(); // Trigger the callback on successful upload
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white shadow-md rounded-lg">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
      >
        Upload
      </button>
    </div>
  );
};
export default UploadComponent;
