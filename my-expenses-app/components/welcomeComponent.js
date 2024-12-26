import React from "react";
import { signIn } from 'next-auth/react';
import Image from 'next/image';

function WelcomeComponent() {

    return (
        <div className="bg-background bg-cover bg-auto min-h-screen flex flex-col items-center justify-center">
            <div className="mb-8 mt-8">
                <h1 className="text-5xl font-bold mb-8 text-center text-black">AI Expenses Tracker</h1>
                <div className="flex flex-col items-center">
                    {/* <p className="mb-4">Please sign in</p> */}
                    <button
                        onClick={() => signIn()}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-300"
                    >
                        Google Sign in
                    </button>
                </div>
            </div>
            <div className="h-[50%] w-[50%]">
            </div>
        </div>
    );
}
export default WelcomeComponent