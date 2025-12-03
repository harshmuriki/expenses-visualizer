"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const SpendingTrendsComponent = dynamic(
  () => import("@/components/SpendingTrendsComponent"),
  {
    ssr: false,
  }
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
          <SpendingTrendsComponent />
        </div>
      </div>
    </div>
  );
}
