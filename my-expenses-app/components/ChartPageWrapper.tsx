"use client";

import React, { useState } from "react";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";
import ChartLoadingComponent from "@/components/ChartLoadingComponent";

const ChartPageWrapper: React.FC = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDataLoaded = (data: Record<string, unknown>) => {
    console.log("Data loaded:", data);
    setShowLoading(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowLoading(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-white">
            Something went wrong
          </h2>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] hover:from-[#6B8BA4] hover:to-[#7AAFAD] text-white font-semibold shadow-lg transform hover:scale-105 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showLoading) {
    return (
      <ChartLoadingComponent
        onDataLoaded={handleDataLoaded}
        onError={handleError}
      />
    );
  }

  return <SnakeyChartComponent refresh={true} />;
};

export default ChartPageWrapper;
