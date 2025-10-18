"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
// import { useTheme } from "@/lib/theme-context";
import "../styles/loading-animations.css";

interface ChartLoadingComponentProps {
  onDataLoaded: (data: Record<string, unknown>) => void;
  onError: (error: string) => void;
}

const ChartLoadingComponent: React.FC<ChartLoadingComponentProps> = ({
  onDataLoaded,
  onError,
}) => {
  // const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [processingStatus, setProcessingStatus] = useState(
    "🔄 Checking for data..."
  );
  const [attempts, setAttempts] = useState(0);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const month = searchParams?.get("month") || "feb";

  const maxAttempts = 1000; // Poll for up to 1000 * 3 seconds

  const startPolling = React.useCallback(() => {
    // Don't start polling if session is not available
    if (!session?.user?.email) {
      console.log("Session not ready, waiting...");
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        setAttempts((prev) => prev + 1);
        setCurrentStep(3);
        setProcessingStatus(
          `🤖 AI is processing your transactions... (${
            attempts + 1
          }/${maxAttempts})`
        );

        // Validate session and email before proceeding
        if (!session?.user?.email) {
          throw new Error("User session or email not available");
        }

        if (!month) {
          throw new Error("Month parameter not available");
        }

        const userDocRef = doc(db, "users", session.user.email);
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
              bank: snapshotDoc.data().bank,
              raw_str: snapshotDoc.data().raw_str,
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
    }, 3000); // Poll every 3 seconds

    // Cleanup function
    return () => clearInterval(pollInterval);
  }, [session, month, attempts, maxAttempts, onDataLoaded, onError]);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      setProcessingStatus("⏳ Loading authentication...");
      return;
    }

    // Only start polling when session is available
    if (!session?.user?.email) {
      setProcessingStatus("⏳ Waiting for authentication...");
      return;
    }

    // Start polling when session is ready
    setCurrentStep(2);
    setProcessingStatus("🔍 Looking for your data in Firebase...");
    startPolling();
  }, [session, status, onError, startPolling]);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 p-6 rounded-xl bg-background-secondary border border-border-secondary backdrop-blur-sm">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-700 ${
                  currentStep >= step
                    ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-text-inverse shadow-lg animate-pulse-glow"
                    : "bg-background-tertiary text-text-tertiary"
                } ${currentStep === step ? "animate-float" : ""} ${
                  currentStep > step ? "animate-step-complete" : ""
                }`}
              >
                {currentStep > step ? (
                  <span className="text-emerald-400">✓</span>
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
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 animate-shimmer"
                      : "bg-background-tertiary"
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
                ? "text-primary-500 animate-gradient-text"
                : "text-text-tertiary"
            }`}
          >
            Waiting
          </span>
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 2
                ? "text-primary-500 animate-gradient-text"
                : "text-text-tertiary"
            }`}
          >
            Checking
          </span>
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 3
                ? "text-primary-500 animate-gradient-text"
                : "text-text-tertiary"
            }`}
          >
            Processing
          </span>
          <span
            className={`transition-colors duration-500 ${
              currentStep >= 4
                ? "text-primary-500 animate-gradient-text"
                : "text-text-tertiary"
            }`}
          >
            Complete
          </span>
        </div>

        {/* Animated Processing Display */}
        <div className="relative">
          <div className="w-full h-3 bg-background-tertiary rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000 ease-out animate-progress-glow animate-shimmer"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Floating particles animation */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-secondary-500 rounded-full animate-particle-float opacity-60"
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
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse animate-float" />
            <div
              className="w-3 h-3 bg-secondary-500 rounded-full animate-pulse animate-float"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-3 h-3 bg-accent-500 rounded-full animate-pulse animate-float"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <p className="text-sm text-text-primary font-medium animate-gradient-text">
            {processingStatus}
          </p>
          {currentStep === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-text-tertiary animate-loading-dots">
                AI is analyzing your transactions and categorizing them
              </p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="text-emerald-400 font-semibold animate-pulse">
              🎉 Data loaded! Preparing your chart...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartLoadingComponent;
