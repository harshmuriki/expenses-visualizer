"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  FiDollarSign,
  FiTarget,
  FiCalendar,
  FiCreditCard,
  FiTrendingUp,
  FiPieChart,
} from "react-icons/fi";
import BudgetTracking from "@/components/premium/BudgetTracking";
import SavingsGoals from "@/components/premium/SavingsGoals";
import BillReminders from "@/components/premium/BillReminders";
import SubscriptionTracking from "@/components/premium/SubscriptionTracking";
import NetWorthTracking from "@/components/premium/NetWorthTracking";
import Link from "next/link";

type FeatureTab = "budgets" | "goals" | "bills" | "subscriptions" | "networth" | "overview";

const PremiumDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<FeatureTab>("overview");
  const [month, setMonth] = useState<string>("");

  useEffect(() => {
    // Get month from URL or use current month
    const urlMonth = searchParams.get("month");
    if (urlMonth) {
      setMonth(urlMonth);
    } else {
      const now = new Date();
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      setMonth(monthNames[now.getMonth()]);
    }
  }, [searchParams]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-text-secondary">Loading Premium Features...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const features = [
    {
      id: "budgets" as FeatureTab,
      name: "Budget Tracking",
      icon: FiDollarSign,
      description: "Set and track spending limits",
      color: "from-emerald-500 to-green-500",
    },
    {
      id: "goals" as FeatureTab,
      name: "Savings Goals",
      icon: FiTarget,
      description: "Track your financial goals",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "bills" as FeatureTab,
      name: "Bill Reminders",
      icon: FiCalendar,
      description: "Never miss a payment",
      color: "from-violet-500 to-purple-500",
    },
    {
      id: "subscriptions" as FeatureTab,
      name: "Subscriptions",
      icon: FiCreditCard,
      description: "Manage recurring payments",
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "networth" as FeatureTab,
      name: "Net Worth",
      icon: FiTrendingUp,
      description: "Track your wealth over time",
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-background-card border-b border-border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/chart"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Premium Features</h1>
                <p className="text-text-secondary mt-1">
                  Comprehensive financial management tools
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiPieChart className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Feature Tabs */}
      <div className="bg-background-card border-b border-border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                  : "bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
              }`}
            >
              <FiPieChart className="w-5 h-5" />
              <span>Overview</span>
            </button>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    activeTab === feature.id
                      ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                      : "bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{feature.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Welcome to Premium Features
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Take control of your finances with our comprehensive suite of premium tools.
                Click on any feature above to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className="group relative overflow-hidden bg-background-card border border-border-secondary rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary mb-2">
                        {feature.name}
                      </h3>
                      <p className="text-text-secondary">
                        {feature.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FiDollarSign className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-text-primary">Budgets</h3>
                </div>
                <p className="text-text-secondary text-sm">
                  Set spending limits for each category and track your progress in real-time.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FiTarget className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-text-primary">Goals</h3>
                </div>
                <p className="text-text-secondary text-sm">
                  Visualize your savings progress and stay motivated to reach your financial targets.
                </p>
              </div>
              <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FiTrendingUp className="w-6 h-6 text-violet-500" />
                  <h3 className="text-lg font-semibold text-text-primary">Net Worth</h3>
                </div>
                <p className="text-text-secondary text-sm">
                  Monitor your complete financial picture including all assets and liabilities.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "budgets" && (
          <BudgetTracking userId={session.user?.email as string} month={month} />
        )}

        {activeTab === "goals" && (
          <SavingsGoals userId={session.user?.email as string} />
        )}

        {activeTab === "bills" && (
          <BillReminders userId={session.user?.email as string} />
        )}

        {activeTab === "subscriptions" && (
          <SubscriptionTracking userId={session.user?.email as string} />
        )}

        {activeTab === "networth" && (
          <NetWorthTracking userId={session.user?.email as string} />
        )}
      </main>
    </div>
  );
};

export default PremiumDashboard;
