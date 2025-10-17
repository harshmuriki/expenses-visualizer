"use client";

import React, { Suspense } from "react";
import ChartPageWrapper from "@/components/ChartPageWrapper";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-border-secondary border-t-secondary-500 rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Processing Your Data
        </h2>
        <p className="text-text-tertiary text-sm">
          AI is categorizing your transactions...
        </p>
        <div className="mt-3 flex space-x-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ChartPage() {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <Suspense fallback={<LoadingSpinner />}>
        <ChartPageWrapper />
      </Suspense>
    </div>
  );
}
