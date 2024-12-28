"use client";

import React, { useState, useEffect } from "react";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";
import UploadComponent from "@/components/uploadComponent";
import { signOut, useSession } from "next-auth/react";
import WelcomeComponent from "@/components/welcomeComponent";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/components/firebaseConfig";

// Separate Admin Access Component
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

// Separate Profile Component
const UserProfile = ({ user, picture, onSignOut }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
      <img
        src={picture}
        alt="User profile"
        className="mb-4 rounded-full border-4 border-gray-600"
        width="100"
        height="100"
      />
      <h4 className="text-xl font-medium text-white mb-2">
        Signed in as {user}
      </h4>
      <button
        onClick={onSignOut}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring focus:ring-red-400"
      >
        Sign out
      </button>
    </div>
  );
};

// Main Home Page Component
const HomePage = () => {
  const [refreshChart, setRefreshChart] = useState(false);
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async (userEmail) => {
      try {
        const adminCollection = collection(db, "admin");
        const q = query(adminCollection, where("email", "==", userEmail));
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

  const handleUploadSuccess = () => setRefreshChart((prev) => !prev);
  const handleBypass = () => setRefreshChart(true);

  if (status === "loading")
    return <p className="text-center text-gray-200">Loading...</p>;

  if (!session) return <WelcomeComponent />;

  return (
    <div
      className={`min-h-screen ${
        refreshChart ? "bg-gray-900" : "bg-gray-900 text-gray-200 py-10"
      }`}
    >
      {refreshChart ? (
        <div className="w-screen h-screen flex items-center justify-center">
          <SnakeyChartComponent refresh={refreshChart} />
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-center text-white mb-12">
            AI Personal Expenses Tracker
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <UploadComponent onUploadSuccess={handleUploadSuccess} />
              <button
                onClick={handleBypass}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-400"
              >
                Bypass
              </button>
            </div>
            <UserProfile
              user={session.user.name}
              picture={session.user.picture}
              onSignOut={() => signOut()}
            />
          </div>

          {/* {isAdmin && <AdminAccess />} */}
        </main>
      )}
    </div>
  );
};

export default HomePage;
