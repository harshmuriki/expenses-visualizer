"use client";

import React from "react";
import EChartsSankeyComponent from "@/components/EChartsSankeyComponent";
import { useState } from "react";

export default function ChartPage() {
  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 className="text-3xl font-bold text-white mb-4">
        Expenses Visualization
      </h1>
      <div className="w-full flex justify-center">
        <EChartsSankeyComponent />
      </div>
    </div>
  );
}
