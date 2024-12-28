import React, { useState } from "react";

interface UploadComponentProps {
  onUploadSuccess: () => void; // Callback function to trigger data fetch
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

    setIsUploading(true);
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
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-800 text-gray-200 shadow-md rounded-lg">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
      />
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-4 py-2 rounded-md transition duration-300 ${
          isUploading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadComponent;
