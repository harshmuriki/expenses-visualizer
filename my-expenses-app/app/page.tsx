"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
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
    <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
      <Image
        src={image}
        alt="User profile"
        className="mb-4 rounded-full border-4 border-gray-300"
        width={100}
        height={100}
      />
      <h4 className="text-xl font-semibold mb-2">Signed in as {user}</h4>
      <button
        onClick={onSignOut}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring focus:ring-red-400"
      >
        Sign out
      </button>
    </div>
  );
};

// Main Home Page
const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  // const router = useRouter();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-slate-700 to-slate-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-slate-700 to-slate-900">
      {/* Title at the top */}
      <header className="py-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          AI Personal Expenses Tracker
        </h1>
      </header>

      {/* Main Content in the center */}
      <main className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Upload Card */}
          <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg flex flex-col">
            <UploadComponent
              onUploadSuccess={() => {}}
              useremail={session.user?.email as string}
            />
            {/* Future button to choose old charts */}
            {/* <button
              onClick={handleBypass}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-400 self-end"
            >
              Go to Default Chart
            </button> */}
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
