import React from "react";
import { signIn } from "next-auth/react";

function WelcomeComponent() {
    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
                AI Personal Expenses Tracker
            </h1>

            <p className="text-lg md:text-xl text-white mb-10 max-w-xl text-center leading-relaxed">
                Simplify your expense tracking with the power of AI. Sign in to start analyzing and managing
                your finances effortlessly.
            </p>

            <button
                onClick={() => signIn()}
                className="bg-white text-blue-700 hover:text-blue-800 hover:bg-gray-200 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default WelcomeComponent;
