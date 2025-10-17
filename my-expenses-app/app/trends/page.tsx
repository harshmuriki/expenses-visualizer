"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const SpendingTrendsComponent = dynamic(
  () => import("@/components/SpendingTrendsComponent"),
  { ssr: false }
);

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center">
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-10 h-10 border-2 border-border-secondary border-t-secondary-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse" }}
          ></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-text-primary mb-3 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          🔍 Analyzing Your Spending
        </h2>
        <p className="text-text-secondary text-base mb-4">
          Processing your financial data and generating insights...
        </p>
        <div className="space-y-2 text-sm text-text-tertiary">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span>Loading transaction data</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <span>Calculating trends</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.6s" }}
            ></div>
            <span>Generating insights</span>
          </div>
        </div>
        <div className="mt-6 flex space-x-1 justify-center">
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-secondary-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-accent-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

export default function TrendsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border-secondary bg-background-secondary/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border border-border-secondary bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-focus hover:bg-background-tertiary"
            >
              ← Back to Home
            </button>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">
              Spending Analysis
            </p>
            <p className="text-lg font-semibold text-text-primary">
              Trends & Insights
            </p>
          </div>
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<LoadingSpinner />}>
            <SpendingTrendsComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
