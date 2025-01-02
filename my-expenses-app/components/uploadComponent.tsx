"use client";

import React, { useState } from "react";
import { UploadComponentProps } from "@/app/types/types";
import { useRouter } from "next/navigation";

const UploadComponent: React.FC<UploadComponentProps> = ({
  onUploadSuccess,
  useremail,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

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
    if (!month) {
      alert("Please enter or select a month!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("month", month);
    formData.append("useremail", useremail);

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
      router.push(`/chart?month=${encodeURIComponent(month)}`);
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
        <span className="mb-2 font-semibold">Select a CSV File</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full cursor-pointer"
        />
      </label>

      <div className="flex flex-col w-full">
        <label htmlFor="month" className="mb-1 font-semibold">
          Enter Month
        </label>
        <input
          id="month"
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="e.g. January, or 2023-01"
          className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-2 rounded-md transition duration-300 font-semibold ${
          isUploading
            ? "bg-gray-500 cursor-not-allowed text-gray-200"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isUploading ? (
          <div className="flex items-center">
            {/* A simple spinning circle */}
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Processing using AI...
          </div>
        ) : (
          "Upload"
        )}
      </button>
    </div>
  );
};

export default UploadComponent;
