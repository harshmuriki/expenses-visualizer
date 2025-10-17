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
          className="rounded-full border-4 border-[#80A1BA] shadow-2xl"
          width={120}
          height={120}
        />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-800 flex items-center justify-center">
          <FiZap className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="text-xl font-semibold text-white">Welcome back!</h4>
        <p className="text-[#91C4C3] font-medium text-lg">{user}</p>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Account Active</span>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl btn-animated"
      >
        <span className="relative z-10 flex items-center space-x-2">
          <FiUser className="w-4 h-4" />
          <span>Sign out</span>
        </span>
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-[#1a2332]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-[#80A1BA] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-slate-400 border-t-[#91C4C3] rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Loading Dashboard
            </h2>
            <p className="text-slate-400 text-sm">
              Preparing your expense tracker...
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#80A1BA]/20 to-[#91C4C3]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#B4DEBD]/20 to-[#91C4C3]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#80A1BA]/10 to-[#B4DEBD]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative z-10 py-12 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">
              AI-Powered Expense Tracking
            </span>
          </div>
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold gradient-text-animated drop-shadow-2xl mb-4 animate-fade-in">
          AI Personal Expenses Tracker
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
          Upload your CSV files and let AI categorize your spending
          automatically. Get insights, trends, and beautiful visualizations of
          your financial data.
        </p>
      </header>

      {/* Enhanced Navigation */}
      <nav className="relative z-10 flex justify-center mb-12">
        <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2 shadow-xl">
          <Link
            href="/trends"
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#91C4C3] to-[#B4DEBD] hover:from-[#7AAFAD] hover:to-[#9AC9A4] text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
          >
            <FiTrendingUp className="w-5 h-5" />
            <span>Spending Trends</span>
          </Link>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full max-w-7xl">
          {/* Enhanced Upload Card */}
          <div className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-100 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-[#80A1BA]/50 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center animate-glow">
                <FiUpload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Upload & Analyze
                </h2>
                <p className="text-slate-400 text-sm">
                  CSV files with AI categorization
                </p>
              </div>
            </div>
            <UploadComponent
              onUploadSuccess={() => {}}
              useremail={session.user?.email as string}
            />
          </div>

          {/* Enhanced User Profile Card */}
          <div className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-100 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-[#91C4C3]/50 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#91C4C3] to-[#B4DEBD] rounded-xl flex items-center justify-center animate-glow">
                <FiUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Profile</h2>
                <p className="text-slate-400 text-sm">Manage your account</p>
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
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
