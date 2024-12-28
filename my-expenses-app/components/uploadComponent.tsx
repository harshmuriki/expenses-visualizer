"use client";

import React, { useState } from "react";
import { UploadComponentProps } from "@/app/types/types";

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
      onUploadSuccess();
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-800 text-gray-200 shadow-md rounded-lg border border-gray-700">
      <label className="flex flex-col items-center w-full">
        <span className="mb-5 font-semibold">Upload a CSV File</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full cursor-pointer"
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-2 rounded-md transition duration-300 font-semibold ${
          isUploading
            ? "bg-gray-500 cursor-not-allowed text-gray-200"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadComponent;
