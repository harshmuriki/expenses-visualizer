"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import UploadComponent from "@/components/uploadComponent";
import WelcomeComponent from "@/components/welcomeComponent";
import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { FiTrendingUp, FiUpload, FiUser, FiZap } from "react-icons/fi";
import "../styles/homepage.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemeTest from "@/components/ThemeTest";

interface UserProfileProps {
  user: string;
  image: string;
  onSignOut: () => void;
}

// Enhanced User Profile Component
const UserProfile: React.FC<UserProfileProps> = ({
  user,
  image,
  onSignOut,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Image
          src={image}
          alt="User profile"
          className="rounded-full border-4 border-primary-500 shadow-2xl"
          width={120}
          height={120}
        />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-background-secondary flex items-center justify-center">
          <FiZap className="w-4 h-4 text-text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="text-xl font-semibold text-text-primary">
          Welcome back!
        </h4>
        <p className="text-secondary-500 font-medium text-xl">{user}</p>
      </div>

      <button
        onClick={onSignOut}
        className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <FiUser className="w-4 h-4" />
          <span>Sign Out</span>
        </span>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
};

// Main Home Page
const HomePage: React.FC = () => {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-slate-400 border-t-secondary-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Loading Dashboard
            </h2>
            <p className="text-text-tertiary text-sm">
              Preparing your expense tracker...
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
  }

  // Not logged in
  if (!session) {
    return <WelcomeComponent />;
  }

  // Navigate to the chart page
  // const handleBypass = () => {
  //   router.push("/chart");
  // };

  return (
    <div className="flex flex-col min-h-screen bg-background-primary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-500/20 to-secondary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 py-8 text-center px-4">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2.5 bg-background-card backdrop-blur-sm border border-border-secondary rounded-full px-6 py-3 mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <span className="text-sm font-semibold text-text-secondary">
              AI-Powered Expense Tracking
            </span>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold gradient-text-animated drop-shadow-2xl mb-6 animate-fade-in leading-tight">
          Smart Expense Tracker
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-in-delay mb-10">
          Upload your transactions and let AI categorize your spending
          automatically. Get powerful insights and beautiful visualizations.
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-8">
          <div className="group text-center px-4 py-2 rounded-xl hover:bg-background-card/50 transition-all duration-300">
            <div className="text-2xl md:text-3xl font-bold text-primary-500 mb-1 group-hover:scale-110 transition-transform duration-300">
              AI-Powered
            </div>
            <div className="text-xs md:text-sm text-text-tertiary font-medium">Smart Categorization</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-border-secondary self-center"></div>
          <div className="group text-center px-4 py-2 rounded-xl hover:bg-background-card/50 transition-all duration-300">
            <div className="text-2xl md:text-3xl font-bold text-secondary-500 mb-1 group-hover:scale-110 transition-transform duration-300">
              Multi-Month
            </div>
            <div className="text-xs md:text-sm text-text-tertiary font-medium">Trend Analysis</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-border-secondary self-center"></div>
          <div className="group text-center px-4 py-2 rounded-xl hover:bg-background-card/50 transition-all duration-300">
            <div className="text-2xl md:text-3xl font-bold text-accent-500 mb-1 group-hover:scale-110 transition-transform duration-300">
              Beautiful
            </div>
            <div className="text-xs md:text-sm text-text-tertiary font-medium">Visualizations</div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation */}
      <nav className="relative z-20 flex justify-center mb-8 px-4">
        <div className="flex items-center gap-3 bg-background-card backdrop-blur-sm border border-border-secondary rounded-2xl p-2.5 shadow-xl">
          <Link
            href="/trends"
            className="group relative flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white rounded-xl font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <FiTrendingUp className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10" />
            <span className="relative z-10">Spending Trends</span>
          </Link>
          <div className="relative z-30">
            <ThemeSwitcher showLabel={false} size="sm" />
          </div>
        </div>
      </nav>

      {/* Features Overview */}
      <div className="relative z-10 flex justify-center mb-8 px-4">
        <div className="w-full max-w-5xl bg-background-card backdrop-blur-sm border border-border-secondary rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Powerful Features
            </h2>
            <p className="text-text-secondary text-lg">
              Everything you need to understand your spending habits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Spending Trends Feature */}
            <div className="group relative flex flex-col items-start p-5 bg-gradient-to-br from-secondary-500/10 to-accent-500/5 rounded-xl border border-border-secondary hover:border-secondary-500/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text-primary mb-2 text-lg">
                Spending Trends
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Multi-month analysis with AI-powered insights and predictions
              </p>
            </div>

            {/* Upload Feature */}
            <div className="group relative flex flex-col items-start p-5 bg-gradient-to-br from-primary-500/10 to-secondary-500/5 rounded-xl border border-border-secondary hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiUpload className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text-primary mb-2 text-lg">
                Smart Upload
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Upload CSV files and let AI automatically categorize your transactions
              </p>
            </div>

            {/* Analytics Feature */}
            <div className="group relative flex flex-col items-start p-5 bg-gradient-to-br from-accent-500/10 to-primary-500/5 rounded-xl border border-border-secondary hover:border-accent-500/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text-primary mb-2 text-lg">
                AI Analytics
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Get intelligent insights and personalized spending recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-7xl space-y-8">
          {/* Primary Action Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Enhanced Upload Card */}
            <div className="group relative overflow-hidden bg-background-card backdrop-blur-sm border border-border-secondary text-text-primary p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-primary-500/50">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiUpload className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">
                      Upload & Analyze
                    </h2>
                    <p className="text-text-secondary text-sm font-medium">
                      CSV files with AI categorization
                    </p>
                  </div>
                </div>
                <UploadComponent
                  onUploadSuccess={() => {}}
                  useremail={session.user?.email as string}
                />
              </div>
            </div>

            {/* Enhanced User Profile Card */}
            <div className="group relative overflow-hidden bg-background-card backdrop-blur-sm border border-border-secondary text-text-primary p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-secondary-500/50">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiUser className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">
                      Your Profile
                    </h2>
                    <p className="text-text-secondary text-sm font-medium">
                      Manage your account
                    </p>
                  </div>
                </div>
                <UserProfile
                  user={session?.user?.name || "No User Name"}
                  image={
                    (session?.user as { picture?: string })?.picture ||
                    "/images/defaultuser.jpg"
                  }
                  onSignOut={() => signOut()}
                />
              </div>
            </div>
          </div>

          {/* Admin-only Theme Test Component */}
          {session?.user?.email === "harshsuhith@gmail.com" && (
            <div className="bg-background-card backdrop-blur-sm border border-border-secondary rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚙️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    Admin Tools
                  </h3>
                  <p className="text-text-tertiary text-sm">
                    Theme testing and development tools
                  </p>
                </div>
              </div>
              <ThemeTest />
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
