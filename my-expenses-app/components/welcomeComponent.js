import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

function WelcomeComponent() {
    const [showWarning, setShowWarning] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = () => {
        setShowWarning(true);
    };

    const handleAccept = async () => {
        setShowWarning(false);
        setIsSigningIn(true);
        try {
            await signIn('google', {
                callbackUrl: '/',
                redirect: true
            });
        } catch (error) {
            console.error('Sign-in error:', error);
            setIsSigningIn(false);
        }
    };

    const handleCancel = () => {
        setShowWarning(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center bg-gradient-to-r from-secondary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent drop-shadow-lg">
                AI Personal Expenses Tracker
            </h1>

            <p className="text-lg md:text-xl text-text-primary mb-10 max-w-xl text-center leading-relaxed">
                Simplify your expense tracking with the power of AI. Sign in to start
                analyzing and managing your finances effortlessly.
            </p>

            <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className={`bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 ${isSigningIn ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
            >
                {isSigningIn ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                    </div>
                ) : (
                    'Sign in with Google'
                )}
            </button>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-secondary border border-border-secondary rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h3 className="text-2xl font-bold text-text-primary mb-4">Important Notice</h3>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            By signing in, you acknowledge that this application is hosted on
                            Firebase and utilizes the OpenAI API. Your data may or may not be safe,
                            and I hold no responsibility for any data breaches or misuse. You can
                            self host this application by following the instructions on the GitHub
                            repository for safer use.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancel}
                                className="bg-background-tertiary text-text-primary py-2 px-6 rounded-lg hover:bg-background-secondary transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={isSigningIn}
                                className={`bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 px-6 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition ${isSigningIn ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSigningIn ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Accept and Sign In'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steps to Use the Software */}
            <div className="mt-16 w-full max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text mb-8 text-center">
                    How to Use the AI Personal Expenses Tracker
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center bg-background-secondary/50 border border-border-secondary rounded-xl p-6 hover:border-primary-500 transition">
                        <Image
                            src="/images/step1.png"
                            alt="Step 1"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover border-2 border-primary-500/30"
                        />
                        <p className="text-text-primary text-lg font-medium">
                            <span className="font-bold text-secondary-500">Step 1:</span> Upload your PDF file
                            containing your transactions.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center bg-background-secondary/50 border border-border-secondary rounded-xl p-6 hover:border-secondary-500 transition">
                        <Image
                            src="/images/step2.png"
                            alt="Step 2"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover border-2 border-secondary-500/30"
                        />
                        <p className="text-text-primary text-lg font-medium">
                            <span className="font-bold text-secondary-500">Step 2:</span> Our AI automatically
                            categorizes each transaction.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center bg-background-secondary/50 border border-border-secondary rounded-xl p-6 hover:border-accent-500 transition">
                        <Image
                            src="/images/step3.png"
                            alt="Step 3"
                            width={160}
                            height={160}
                            className="mb-4 rounded-lg shadow-md object-cover border-2 border-accent-500/30"
                        />
                        <p className="text-text-primary text-lg font-medium">
                            <span className="font-bold text-accent-500">Step 3:</span> Visualize, Manage and
                            Edit expenses with interactive charts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WelcomeComponent;
