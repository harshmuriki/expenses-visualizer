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
        <div className="min-h-screen bg-gradient-to-r from-slate-700 to-slate-900 flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
                AI Personal Expenses Tracker
            </h1>

            <p className="text-lg md:text-xl text-white mb-10 max-w-xl text-center leading-relaxed">
                Simplify your expense tracking with the power of AI. Sign in to start
                analyzing and managing your finances effortlessly.
            </p>

            <button
                onClick={handleSignIn}
                className="bg-white text-blue-700 hover:text-blue-800 hover:bg-gray-200 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
            >
                Sign in with Google
            </button>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Important Notice</h3>
                        <p className="text-gray-600 mb-6">
                            By signing in, you acknowledge that this application is hosted on
                            Firebase and utilizes the OpenAI API. Your data may or may not be safe,
                            and I hold no responsibility for any data breaches or misuse. You can
                            self host this application by following the instructions on the GitHub
                            repository for safer use.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancel}
                                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccept}
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                            >
                                Accept and Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steps to Use the Software */}
            <div className="mt-16 w-full max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                    How to Use the AI Personal Expenses Tracker
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/images/step1.png"
                            alt="Step 1"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover"
                        />
                        <p className="text-white text-lg font-medium">
                            <span className="font-bold">Step 1:</span> Upload your CSV file
                            containing your transactions.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/images/step2.png"
                            alt="Step 2"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover"
                        />
                        <p className="text-white text-lg font-medium">
                            <span className="font-bold">Step 2:</span> Our AI automatically
                            categorizes each transaction.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/images/step3.png"
                            alt="Step 3"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover"
                        />
                        <p className="text-white text-lg font-medium">
                            <span className="font-bold">Step 3:</span> Visualize, Manage and
                            Edit expenses with interactive charts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomeComponent;
