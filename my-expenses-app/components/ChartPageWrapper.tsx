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
      <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-text-primary">
            Something went wrong
          </h2>
          <p className="text-text-tertiary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-text-primary font-semibold shadow-lg transform hover:scale-105 transition duration-300"
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
