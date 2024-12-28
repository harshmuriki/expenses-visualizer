"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/components/firebaseConfig";
import { useRouter } from "next/navigation";
import UploadComponent from "@/components/uploadComponent";
import WelcomeComponent from "@/components/welcomeComponent";
import Image from "next/image";

// Admin Access Component
const AdminAccess = () => {
  return (
    <div className="mt-8 p-6 rounded-lg bg-gray-800 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Admin Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-700 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-200">
            Create New Skating Session
          </h3>
        </div>
      </div>
    </div>
  );
};

// User Profile Component
const UserProfile = ({
  user,
  picture,
  onSignOut,
}: {
  user: string;
  picture: string;
  onSignOut: () => void;
}) => {
  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md flex flex-col items-center">
      <Image
        src={picture}
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
const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async (userEmail: string) => {
      try {
        const adminRef = collection(db, "admin");
        const q = query(adminRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    };

    if (session?.user?.email) {
      checkAdmin(session.user.email).then(setIsAdmin);
    }
  }, [session]);

  // Loading state
  if (status === "loading") {
    return <p className="text-center text-gray-200">Loading...</p>;
  }

  // Not logged in
  if (!session) {
    return <WelcomeComponent />;
  }

  // Navigate to the chart page
  const handleBypass = () => {
    router.push("/chart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
        AI Personal Expenses Tracker
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg flex flex-col">
          <UploadComponent onUploadSuccess={() => {}} />
          <button
            onClick={handleBypass}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-400 self-end"
          >
            Go to Chart
          </button>
        </div>

        <UserProfile
          user={session.user.name}
          picture={session.user.picture}
          onSignOut={() => signOut()}
        />
      </div>

      {/* Uncomment if admin functionality is needed */}
      {/* {isAdmin && <AdminAccess />} */}
    </div>
  );
};

export default HomePage;
