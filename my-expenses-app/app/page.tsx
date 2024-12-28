"use client";

import React, { useState, useEffect } from "react";
// import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import UploadComponent from "@/components/uploadComponent";
import WelcomeComponent from "@/components/welcomeComponent";
import { db } from "@/components/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

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
const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter(); // For navigation

  useEffect(() => {
    // Check admin logic remains the same
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

  // If session is loading
  if (status === "loading") {
    return <p className="text-center text-gray-200">Loading...</p>;
  }

  // If user is not logged in
  if (!session) {
    return <WelcomeComponent />;
  }

  const handleBypass = () => {
    // Instead of setting refreshChart, we redirect to /chart
    router.push("/chart");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-10">
      <main className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center text-white mb-12">
          AI Personal Expenses Tracker
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <UploadComponent
            // onUploadSuccess -> you can keep this if you want to do something
            // else after uploading, but not necessary for the direct chart page
            />
            <button
              onClick={handleBypass}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-400"
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

        {/* {isAdmin && <AdminAccess />} */}
      </main>
    </div>
  );
};

export default HomePage;
