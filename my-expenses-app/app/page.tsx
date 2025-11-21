"use client";

import React, { useEffect } from "react";
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
import "@/lib/material-imports";

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
        <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Welcome back!
        </h4>
        <p className="font-medium text-xl" style={{ color: 'var(--color-secondary-500)' }}>{user}</p>
      </div>

      <md-filled-tonal-button
        onClick={onSignOut as any}
        style={{
          '--md-filled-tonal-button-container-color': '#dc2626',
          '--md-filled-tonal-button-label-text-color': '#ffffff'
        } as React.CSSProperties}
      >
        <FiUser slot="icon" className="w-4 h-4" />
        Sign Out
      </md-filled-tonal-button>
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
              <div className="w-8 h-8 border-2 border-text-tertiary border-t-secondary-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Loading Dashboard
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
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
      {/* Animated Background Elements - More vibrant */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-accent-400/30 to-secondary-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-primary-300/20 to-accent-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 py-8 md:py-12 text-center px-4">
        {/* Unique floating badge */}
        <div className="mb-6 flex justify-center">
          <div className="relative inline-flex items-center gap-3 rounded-full px-6 py-3 shadow-xl border-2 transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)',
              borderColor: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.3)'
            }}>
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg animate-pulse"></div>
            </div>
            <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
              ✨ AI-Powered Intelligence
            </span>
          </div>
        </div>

        {/* Unique title with creative layout */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent blur-sm"></div>
          </div>
          <h1 className="relative md-display-large md:md-display-large mb-4 font-black tracking-tight">
            <span className="block" style={{ color: 'var(--color-text-primary)' }}>Expense</span>
            <span className="block gradient-text-animated">
              Intelligence
            </span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary-500"></div>
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-secondary-500"></div>
          </div>
        </div>

        {/* Unique description with split layout */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="md-headline-small md:md-headline-medium font-medium leading-relaxed mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Transform your financial data into
            <span className="relative inline-block mx-2">
              <span className="relative z-10 font-bold" style={{ color: 'var(--color-primary-500)' }}>
                actionable insights
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-2 rounded-full" style={{
                background: `linear-gradient(to right, var(--color-primary-500), var(--color-secondary-500))`,
                opacity: 0.3
              }}></span>
            </span>
            with AI-powered analysis
          </p>
          <p className="md-body-large leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Upload, analyze, visualize. Your spending patterns decoded in seconds.
          </p>
        </div>

        {/* Unique stats with modern cards */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
          <div className="group relative rounded-2xl px-6 py-5 min-w-[150px] hover:scale-105 transition-all duration-300 border-2 shadow-lg"
            style={{
              backgroundColor: 'var(--color-background-card)',
              borderColor: 'var(--color-primary-500)'
            }}>
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300"
                style={{ color: 'var(--color-primary-500)' }}>
                ∞
              </div>
              <div className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Smart AI</div>
              <div className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Auto-categorize</div>
            </div>
          </div>

          <div className="group relative rounded-2xl px-6 py-5 min-w-[150px] hover:scale-105 transition-all duration-300 border-2 shadow-lg"
            style={{
              backgroundColor: 'var(--color-background-card)',
              borderColor: 'var(--color-secondary-500)'
            }}>
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300"
                style={{ color: 'var(--color-secondary-500)' }}>
                📊
              </div>
              <div className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Multi-View</div>
              <div className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Rich analytics</div>
            </div>
          </div>

          <div className="group relative rounded-2xl px-6 py-5 min-w-[150px] hover:scale-105 transition-all duration-300 border-2 shadow-lg"
            style={{
              backgroundColor: 'var(--color-background-card)',
              borderColor: 'var(--color-accent-500)'
            }}>
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black mb-3 group-hover:scale-110 transition-transform duration-300"
                style={{ color: 'var(--color-accent-500)' }}>
                ✨
              </div>
              <div className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-primary)' }}>Beautiful</div>
              <div className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>Visualizations</div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation */}
      <nav className="relative z-20 flex justify-center mb-6 px-4">
        <div className="flex items-center gap-3 rounded-2xl p-3 border-2 shadow-lg"
          style={{
            backgroundColor: 'var(--color-background-card)',
            borderColor: 'var(--color-border-secondary)'
          }}>
          <Link href="/trends">
            <md-filled-button>
              <FiTrendingUp slot="icon" className="w-5 h-5" />
              View Trends
            </md-filled-button>
          </Link>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-7xl space-y-8">
          {/* Primary Action Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Enhanced Upload Card */}
            <div className="group relative overflow-hidden rounded-3xl p-8 hover:scale-[1.01] transition-all duration-300 border-2 shadow-xl"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-border-secondary)'
              }}>
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiUpload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="md-title-large" style={{ color: 'var(--color-text-primary)' }}>
                      Upload & Analyze
                    </h2>
                    <p className="md-body-medium" style={{ color: 'var(--color-text-secondary)' }}>
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
            <div className="group relative overflow-hidden rounded-3xl p-8 hover:scale-[1.01] transition-all duration-300 border-2 shadow-xl"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-border-secondary)'
              }}>
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-secondary-400/20 to-transparent rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiUser className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="md-title-large" style={{ color: 'var(--color-text-primary)' }}>
                      Your Profile
                    </h2>
                    <p className="md-body-medium" style={{ color: 'var(--color-text-secondary)' }}>
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

          {/* Features Overview */}
          <div className="relative z-10 flex justify-center">
            <div className="w-full max-w-5xl rounded-3xl p-8 border-2 shadow-xl"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-border-secondary)'
              }}>
              <div className="text-center mb-8">
                <h2 className="md-headline-large mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Powerful Features
                </h2>
                <p className="md-body-large" style={{ color: 'var(--color-text-secondary)' }}>
                  Everything you need to understand your spending habits
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Spending Trends Feature */}
                <div className="group relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-secondary-500)'
                  }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-title-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Spending Trends
                  </h3>
                  <p className="md-body-small leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    Multi-month analysis with AI-powered insights and predictions
                  </p>
                </div>

                {/* Upload Feature */}
                <div className="group relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-primary-500)'
                  }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiUpload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-title-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Smart Upload
                  </h3>
                  <p className="md-body-small leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    Upload CSV files and let AI automatically categorize your transactions
                  </p>
                </div>

                {/* Analytics Feature */}
                <div className="group relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-accent-500)'
                  }}>
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FiZap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-title-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    AI Analytics
                  </h3>
                  <p className="md-body-small leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    Get intelligent insights and personalized spending recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin-only Theme Test Component */}
          {session?.user?.email === "harshsuhith@gmail.com" && (
            <div className="rounded-2xl p-6 shadow-xl border-2"
              style={{
                backgroundColor: 'var(--color-background-card)',
                borderColor: 'var(--color-border-secondary)'
              }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚙️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Admin Tools
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
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
