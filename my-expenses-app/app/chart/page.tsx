"use client"

import React from "react";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";

export default function ChartPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
      {/* Pass in any props your SnakeyChartComponent needs */}
      <SnakeyChartComponent refresh={true} />
    </div>
  );
}
