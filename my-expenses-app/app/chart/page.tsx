"use client";

import React, { Suspense } from "react";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-600 border-t-[#80A1BA] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-[#91C4C3] rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          Processing Your Data
        </h2>
        <p className="text-slate-400 text-sm">
          AI is categorizing your transactions...
        </p>
        <div className="mt-3 flex space-x-1">
          <div className="w-2 h-2 bg-[#80A1BA] rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-[#91C4C3] rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#B4DEBD] rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ChartPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Suspense fallback={<LoadingSpinner />}>
        <SnakeyChartComponent refresh={true} />
      </Suspense>
    </div>
  );
}
