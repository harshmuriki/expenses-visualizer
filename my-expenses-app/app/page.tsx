"use client";

import { useState } from "react";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [hierarchicalData, setHierarchicalData] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setResponseMessage(null); // Clear any previous messages
      setHierarchicalData(null); // Clear previous data
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      setResponseMessage("No file selected. Please choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      // Send the file to the Flask backend
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setResponseMessage(`Error: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      setResponseMessage("File uploaded successfully!");
      setHierarchicalData(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponseMessage("Failed to upload file. Please try again.");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Upload CSV and Process with Flask</h1>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="file-input"
        />
        <button
          onClick={handleFileUpload}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload
        </button>
        {responseMessage && <p className="mt-4 text-lg">{responseMessage}</p>}
        {hierarchicalData && (
          <div className="mt-4">
            <h2 className="text-xl font-medium">Hierarchical Data:</h2>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(hierarchicalData, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
