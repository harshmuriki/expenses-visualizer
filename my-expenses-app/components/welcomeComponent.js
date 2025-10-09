import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

function WelcomeComponent() {
    const [showWarning, setShowWarning] = useState(false);

    const handleSignIn = () => {
        setShowWarning(true);
    };

    const handleAccept = () => {
        setShowWarning(false);
        signIn(); // Proceed with sign-in
    };

    const handleCancel = () => {
        setShowWarning(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-[#1a2332] flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center bg-gradient-to-r from-[#91C4C3] via-[#B4DEBD] to-[#80A1BA] bg-clip-text text-transparent drop-shadow-lg">
                AI Personal Expenses Tracker
            </h1>

            <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-xl text-center leading-relaxed">
                Simplify your expense tracking with the power of AI. Sign in to start
                analyzing and managing your finances effortlessly.
            </p>

            <button
                onClick={handleSignIn}
                className="bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white hover:from-[#6B8BA4] hover:to-[#7AAFAD] font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            >
                Sign in with Google
            </button>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-4">Important Notice</h3>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            By signing in, you acknowledge that this application is hosted on
                            Firebase and utilizes the OpenAI API. Your data may or may not be safe,
                            and I hold no responsibility for any data breaches or misuse. You can
                            self host this application by following the instructions on the GitHub
                            repository for safer use.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancel}
                                className="bg-slate-700 text-slate-200 py-2 px-6 rounded-lg hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccept}
                                className="bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white py-2 px-6 rounded-lg hover:from-[#6B8BA4] hover:to-[#7AAFAD] transition"
                            >
                                Accept and Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steps to Use the Software */}
            <div className="mt-16 w-full max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-[#91C4C3] to-[#B4DEBD] bg-clip-text mb-8 text-center">
                    How to Use the AI Personal Expenses Tracker
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-[#80A1BA] transition">
                        <Image
                            src="/images/step1.png"
                            alt="Step 1"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover border-2 border-[#80A1BA]/30"
                        />
                        <p className="text-slate-200 text-lg font-medium">
                            <span className="font-bold text-[#91C4C3]">Step 1:</span> Upload your PDF file
                            containing your transactions.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-[#91C4C3] transition">
                        <Image
                            src="/images/step2.png"
                            alt="Step 2"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover border-2 border-[#91C4C3]/30"
                        />
                        <p className="text-slate-200 text-lg font-medium">
                            <span className="font-bold text-[#91C4C3]">Step 2:</span> Our AI automatically
                            categorizes each transaction.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-[#B4DEBD] transition">
                        <Image
                            src="/images/step3.png"
                            alt="Step 3"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover border-2 border-[#B4DEBD]/30"
                        />
                        <p className="text-slate-200 text-lg font-medium">
                            <span className="font-bold text-[#B4DEBD]">Step 3:</span> Visualize, Manage and
                            Edit expenses with interactive charts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomeComponent;
