import React from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

function WelcomeComponent() {
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
                onClick={() => signIn()}
                className="bg-white text-blue-700 hover:text-blue-800 hover:bg-gray-200 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
            >
                Sign in with Google
            </button>

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
