"use client";

import React, { Suspense } from "react";
import SpendingTrendsComponent from "@/components/SpendingTrendsComponent";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
          Loading Spending Trends
        </h2>
        <p className="text-slate-400 text-sm">
          Analyzing your spending patterns...
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

export default function TrendsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              ← Back to Home
            </button>
            <Link
              href="/chart"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] px-4 py-2 text-sm font-medium text-white transition hover:from-[#6B8BA4] hover:to-[#7AAFAD]"
            >
              📊 View Charts
            </Link>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Spending Analysis
            </p>
            <p className="text-lg font-semibold text-white">
              Trends & Insights
            </p>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
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
