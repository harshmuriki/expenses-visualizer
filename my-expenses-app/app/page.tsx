"use client";

import React, { useState, useEffect } from "react";
import SnakeyChartComponent from "@/components/SnakeyChartComponent";
import UploadComponent from "@/components/uploadComponent";
import { signIn, signOut, useSession } from "next-auth/react";
import WelcomeComponent from "@/components/welcomeComponent";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/components/firebaseConfig";
import UserInfo from "@/components/userInfo";

const HomePage = () => {
  const [refreshChart, setRefreshChart] = useState(false);
  // const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
  const handleUploadSuccess = () => {
    setRefreshChart((prev) => !prev); // Toggle the state to trigger a re-fetch
  };

  const { data: session, status } = useSession();
  const user = session?.user?.name;
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  // const checkUserExists = CheckUserExists({ email: email });

  useEffect(() => {
    if (session) {
      setEmail(session.user.email);
      const intervalId = setInterval(() => {
        CheckAdmin(session.user.email)
          .then((isAdmin) => {
            setIsAdmin(isAdmin);
          })
          .catch((error) => {
            console.error("Error checking admin status:", error);
          });
      }, 1000); // Run every 1000 milliseconds (1 second)
      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [session]);

  const CheckAdmin = async (userEmail) => {
    try {
      const adminCollection = collection(db, "admin");

      // Query to fetch admin emails from Firestore
      const q = query(adminCollection, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User email matches an admin email in the collection
        // console.log("User is an admin");
        return true;
      } else {
        // User is not an admin
        // console.log("User is not an admin");
        return false;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false; // Return false in case of any error
    }
  };

  const ifAdmin = ({ isAdmin }) => {
    return (
      isAdmin && (
        <div className="mt-6 border-2 p-4 rounded-lg border-gray-300 bg-gray-100 sm:inline-block">
          <h2 className="text-2xl font-semibold mb-4">Admin Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Create New Skating Session
              </h2>
            </div>
          </div>
        </div>
      )
    );
  };

  return (
    <div>
      <div>
        {status === "loading" ? (
          <p className="text-center">Loading...</p>
        ) : !session ? (
          <WelcomeComponent />
        ) : (
          <main className="">
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold mb-8 text-gray-800"></h1>
              <div>
                <UploadComponent onUploadSuccess={handleUploadSuccess} />
                {refreshChart && (
                  <SnakeyChartComponent refresh={refreshChart} />
                )}
              </div>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                AI Personal Expenses Tracker
              </h1>
              <div className="flex items-center justify-center flex flex-col">
                <div>
                  <div className="flex items-center justify-center flex-wrap bg-gray-50 px-4 rounded-lg shadow-md p-4">
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                      <div className="flex items-center justify-center flex flex-col">
                        <img
                          src={session.user.picture}
                          alt="User profile"
                          className="rounded-lg"
                          style={{ borderRadius: "30%" }}
                          width="100"
                          height="100"
                        />
                        <h4 className="text-base md:text-lg lg:text-xl font-semibold mb-1">
                          Signed in as {user}
                        </h4>
                        <button
                          onClick={() => signOut()}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-300"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                    <div className="p-5 rounded">
                      {/* <UserInfo email={email} /> */}
                    </div>
                  </div>
                  {ifAdmin({ isAdmin })}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default HomePage;
