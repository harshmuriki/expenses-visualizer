"use client";

import React from "react";
import EChartsSankeyComponent from "@/components/EChartsSankeyComponent";

export default function ChartPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      <h1 className="text-3xl font-bold text-white p-4 text-center sticky top-0 z-10 bg-opacity-90 bg-gray-900">
        Expenses Visualization
      </h1>
      <div className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="min-w-full h-full">
          <EChartsSankeyComponent />
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
