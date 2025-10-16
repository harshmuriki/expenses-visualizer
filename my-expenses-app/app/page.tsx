"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import UploadComponent from "@/components/uploadComponent";
import WelcomeComponent from "@/components/welcomeComponent";
import Image from "next/image";
import Footer from "@/components/footer";

interface UserProfileProps {
  user: string;
  image: string;
  onSignOut: () => void;
}

// User Profile Component
const UserProfile: React.FC<UserProfileProps> = ({
  user,
  image,
  onSignOut,
}) => {
  return (
    <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 text-slate-100 p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
      <Image
        src={image}
        alt="User profile"
        className="mb-6 rounded-full border-4 border-[#80A1BA] shadow-lg"
        width={120}
        height={120}
      />
      <h4 className="text-xl font-semibold mb-1 text-white">Signed in as</h4>
      <p className="text-[#91C4C3] mb-6 font-medium">{user}</p>
      <button
        onClick={onSignOut}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105"
      >
        Sign out
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-[#1a2332]">
      {/* Title at the top */}
      <header className="py-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[#91C4C3] via-[#B4DEBD] to-[#80A1BA] bg-clip-text text-transparent drop-shadow-lg">
          AI Personal Expenses Tracker
        </h1>
      </header>

      {/* Main Content in the center */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Upload Card */}
          <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 text-slate-100 p-6 rounded-2xl shadow-2xl flex flex-col">
            <UploadComponent
              onUploadSuccess={() => {}}
              useremail={session.user?.email as string}
            />
          </div>

          {/* User Profile Card */}
          <UserProfile
            user={session?.user?.name || "No User Name"}
            image={
              (session?.user as { picture?: string })?.picture ||
              "/images/defaultuser.jpg"
            }
            onSignOut={() => signOut()}
          />
        </div>
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default HomePage;
