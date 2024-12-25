"use client";

import React, { useState } from "react";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";
import UploadComponent from "@/components/uploadComponent";

const HomePage = () => {
  const [refreshChart, setRefreshChart] = useState(false);
  // const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
  const handleUploadSuccess = () => {
    setRefreshChart((prev) => !prev); // Toggle the state to trigger a re-fetch
  };

  return (
    // <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    //   <h1 className="text-4xl font-bold mb-8 text-gray-800">
    <div>
      <h1>AI Personal Expenses Tracker</h1>
      <UploadComponent onUploadSuccess={handleUploadSuccess} />
      {refreshChart && <SnakeyChartComponent refresh={refreshChart} />}
    </div>
  );
};

export default HomePage;
