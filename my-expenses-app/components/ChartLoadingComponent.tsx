"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import "../styles/loading-animations.css";

interface ChartLoadingComponentProps {
  onDataLoaded: (data: Record<string, unknown>) => void;
  onError: (error: string) => void;
}

const ChartLoadingComponent: React.FC<ChartLoadingComponentProps> = ({
  onDataLoaded,
  onError,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [processingStatus, setProcessingStatus] = useState(
    "🔄 Checking for data..."
  );
  const [attempts, setAttempts] = useState(0);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const month = searchParams?.get("month") || "feb";

  const maxAttempts = 30; // Poll for up to 2.5 minutes (30 * 5 seconds)

  const startPolling = React.useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        setAttempts((prev) => prev + 1);
        setCurrentStep(3);
        setProcessingStatus(
          `🤖 AI is processing your transactions... (${
            attempts + 1
          }/${maxAttempts})`
        );

        const userDocRef = doc(db, "users", session?.user?.email || "");
        const nodesCollectionRef = collection(userDocRef, month);
        const nodesSnapshot = await getDocs(nodesCollectionRef);

        // Check if we have actual transaction data (not just parentChildMap)
        const transactionDocs = nodesSnapshot.docs.filter(
          (doc) => doc.id !== "parentChildMap" && doc.id !== "meta"
        );

        if (transactionDocs.length > 0) {
          // Data found! Process it
          setCurrentStep(4);
          setProcessingStatus("✅ Data found! Loading your chart...");

          const nodes = transactionDocs
            .map((snapshotDoc) => ({
              name: snapshotDoc.data().transaction,
              cost: snapshotDoc.data().cost || 0,
              index: snapshotDoc.data().index,
              isleaf: snapshotDoc.data().isleaf,
              value: snapshotDoc.data().cost || 0,
              visible: snapshotDoc.data().visible,
              date: snapshotDoc.data().date,
              location: snapshotDoc.data().location,
              file_source: snapshotDoc.data().file_source,
            }))
            .sort((a, b) => a.index - b.index);

          const mapDocRef = doc(nodesCollectionRef, "parentChildMap");
          const mapSnapshot = await getDoc(mapDocRef);

          const keys: number[] = mapSnapshot.exists()
            ? Object.keys(mapSnapshot.data()).map((key) => parseInt(key))
            : [];

          const parentChildMapArr: number[][] = mapSnapshot.exists()
            ? Object.values(mapSnapshot.data()).map(
                (values) => values as number[]
              )
            : [];

          const parentChildMap: Record<number, number[]> = keys.reduce(
            (acc: Record<number, number[]>, key, index) => {
              acc[key] = parentChildMapArr[index];
              return acc;
            },
            {}
          );

          // Fetch meta totals
          let metaTotals = null;
          try {
            const metaRef = doc(nodesCollectionRef, "meta");
            const metaSnap = await getDoc(metaRef);
            if (metaSnap.exists()) {
              metaTotals = metaSnap.data() as {
                creditCardPaymentsTotal?: number;
              };
            }
          } catch (e) {
            console.warn("Unable to load meta totals:", e);
          }

          clearInterval(pollInterval);

          // Pass the loaded data to parent
          onDataLoaded({
            nodes,
            parentChildMap,
            metaTotals,
            lastUpdated: new Date(),
          });
        } else if (attempts >= maxAttempts) {
          // Timeout reached
          clearInterval(pollInterval);
          setCurrentStep(0);
          setProcessingStatus(
            "⏰ Data is taking longer than expected to process"
          );
          onError(
            "Data processing is taking longer than expected. Please check back later or try uploading again."
          );
        }
      } catch (error) {
        console.error("Error polling for data:", error);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          onError("Unable to check for data. Please try refreshing the page.");
        }
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup function
    return () => clearInterval(pollInterval);
  }, [session, month, attempts, maxAttempts, onDataLoaded, onError]);

  useEffect(() => {
    if (!session?.user?.email) {
      onError("User not authenticated");
      return;
    }

    // Start polling after 30 seconds
    const initialDelay = setTimeout(() => {
      setCurrentStep(2);
      setProcessingStatus("🔍 Looking for your data in Firebase...");
      startPolling();
    }, 30000); // 30 seconds

    return () => clearTimeout(initialDelay);
  }, [session, onError, startPolling]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 p-6 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-600/30 backdrop-blur-sm">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-700 ${
                  currentStep >= step
                    ? "bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white shadow-lg animate-pulse-glow"
                    : "bg-slate-700 text-slate-400"
                } ${currentStep === step ? "animate-float" : ""} ${
                  currentStep > step ? "animate-step-complete" : ""
                }`}
              >
                {currentStep > step ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span
                    className={
                      currentStep === step ? "animate-gradient-text" : ""
                    }
                  >
                    {step}
                  </span>
                )}
              </div>
              {step < 4 && (
                <div
                  className={`w-12 h-1 transition-all duration-700 rounded-full ${
                    currentStep > step
                      ? "bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] animate-shimmer"
                      : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs font-medium">
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 1
                ? "text-[#80A1BA] animate-gradient-text"
                : "text-slate-400"
            }`}
          >
            Waiting
          </span>
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 2
                ? "text-[#80A1BA] animate-gradient-text"
                : "text-slate-400"
            }`}
          >
            Checking
          </span>
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 3
                ? "text-[#80A1BA] animate-gradient-text"
                : "text-slate-400"
            }`}
          >
            Processing
          </span>
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 4
                ? "text-[#80A1BA] animate-gradient-text"
                : "text-slate-400"
            }`}
          >
            Complete
          </span>
        </div>

        {/* Animated Processing Display */}
        <div className="relative">
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-full transition-all duration-1000 ease-out animate-progress-glow animate-shimmer"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Floating particles animation */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-[#91C4C3] rounded-full animate-particle-float opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-[#80A1BA] rounded-full animate-pulse animate-float" />
            <div
              className="w-3 h-3 bg-[#91C4C3] rounded-full animate-pulse animate-float"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-3 h-3 bg-[#B4DEBD] rounded-full animate-pulse animate-float"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <p className="text-sm text-slate-200 font-medium animate-gradient-text">
            {processingStatus}
          </p>
          {currentStep === 1 && (
            <p className="text-xs text-slate-400">
              Waiting 30 seconds for initial processing...
            </p>
          )}
          {currentStep === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 animate-loading-dots">
                AI is analyzing your transactions and categorizing them
              </p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-[#80A1BA] rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-[#91C4C3] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-[#B4DEBD] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="text-green-400 font-semibold animate-pulse">
              🎉 Data loaded! Preparing your chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartLoadingComponent;
