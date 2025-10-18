"use client";

import React, { useState, useEffect } from "react";
import { debugLog, timeStart, timeEnd } from "@/lib/debug";
import { UploadComponentProps } from "@/app/types/types";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "../styles/loading-animations.css";

type LinkSuccessMetadata = {
  institution?: {
    name?: string;
  };
};

type LinkExitMetadata = {
  display_message?: string;
  error_message?: string;
};

declare global {
  interface PlaidLinkHandler {
    open: () => void;
    exit: () => void;
    destroy: () => void;
  }

  interface PlaidLinkConfig {
    token: string;
    onSuccess: (publicToken: string, metadata: LinkSuccessMetadata) => void;
    onExit?: (error: LinkExitMetadata | null) => void;
  }

  interface Window {
    Plaid?: {
      create: (config: PlaidLinkConfig) => PlaidLinkHandler;
    };
  }
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  onUploadSuccess,
  useremail,
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [month, setMonth] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  // PLAID STATE VARIABLES - TEMPORARILY DISABLED
  // const [isLinking, setIsLinking] = useState(false);
  // const [isSyncing, setIsSyncing] = useState(false);
  // const [linkToken, setLinkToken] = useState<string | null>(null);
  // const [linkError, setLinkError] = useState<string | null>(null);
  // const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);
  // const [isPlaidReady, setIsPlaidReady] = useState(false);
  const router = useRouter();
  const [months, setMonths] = useState([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    timeStart("upload", "handleUpload");
    if (!files || files.length === 0) {
      alert("Please select at least one file first!");
      return;
    }
    if (!month) {
      alert("Please enter or select a month!");
      return;
    }

    const formData = new FormData();

    // Append all selected files
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    formData.append("month", month);
    formData.append("useremail", useremail);
    formData.append("storeFile", "true"); // Flag to store the original files

    setIsUploading(true);

    try {
      debugLog(
        "upload",
        `POST /api/upload start (files=${files.length}, month=${month})`
      );
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      debugLog("upload", `POST /api/upload status=${response.status}`);

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const result = await response.json();
      debugLog("upload", "upload response", result);

      if (result.status === "processing" && result.processingId) {
        // Redirect to chart page immediately - let chart page handle the loading
        onUploadSuccess();
        alert("Files uploaded successfully! Redirecting to chart...");
        router.push(`/chart?month=${encodeURIComponent(month)}`);
      } else {
        // Fallback for immediate success (shouldn't happen with new flow)
        onUploadSuccess();
        alert("File uploaded and categorized successfully! ✅");
        router.push(`/chart?month=${encodeURIComponent(month)}`);
      }
    } catch (error) {
      debugLog("upload", "Error uploading file", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
      timeEnd("upload", "handleUpload");
    }
  };

  // PLAID SCRIPT LOADING - TEMPORARILY DISABLED
  // useEffect(() => {
  //   if (typeof window === "undefined") {
  //     return;
  //   }

  //   if (window.Plaid) {
  //     setIsPlaidReady(true);
  //     return;
  //   }

  //   const script = document.createElement("script");
  //   script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
  //   script.async = true;
  //   script.onload = () => setIsPlaidReady(true);
  //   script.onerror = () => setLinkError("Unable to load aggregator widget");
  //   document.body.appendChild(script);

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);

  // PLAID FUNCTIONS - TEMPORARILY DISABLED
  // const fetchLinkToken = useCallback(async () => {
  //   const response = await fetch("/api/plaid/create-link-token", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ userId: useremail }),
  //   });

  //   if (!response.ok) {
  //     throw new Error("Failed to create link token");
  //   }

  //   const data = await response.json();
  //   if (typeof data.link_token !== "string") {
  //     throw new Error("Aggregator did not return a link token");
  //   }

  //   setLinkToken(data.link_token);
  //   return data.link_token as string;
  // }, [useremail]);

  // PLAID MAIN FUNCTION - TEMPORARILY DISABLED
  // const openAggregatorLink = useCallback(async () => {
  //   setLinkError(null);

  //   try {
  //     if (!isPlaidReady || typeof window === "undefined" || !window.Plaid) {
  //       throw new Error("Aggregator widget is not ready yet");
  //     }

  //     const token = linkToken ?? (await fetchLinkToken());
  //     setIsLinking(true);

  //     await new Promise<void>((resolve) => {
  //       const handler = window.Plaid!.create({
  //         token,
  //         onSuccess: async (
  //           public_token: string,
  //           metadata: LinkSuccessMetadata
  //         ) => {
  //           try {
  //             const exchangeResponse = await fetch(
  //               "/api/plaid/exchange-public-token",
  //               {
  //                 method: "POST",
  //                 headers: { "Content-Type": "application/json" },
  //                 body: JSON.stringify({
  //                   public_token,
  //                   userId: useremail,
  //                   institution: metadata?.institution?.name,
  //                 }),
  //               }
  //             );

  //             const exchangeJson = await exchangeResponse.json();
  //             if (!exchangeResponse.ok || !exchangeJson.success) {
  //               throw new Error(
  //                 exchangeJson.error || "Failed to exchange public token"
  //               );
  //             }

  //             const itemId = exchangeJson.itemId as string;
  //             setIsSyncing(true);
  //             const syncResponse = await fetch("/api/plaid/sync-transactions", {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({ userId: useremail, itemId }),
  //             });

  //             const syncJson = await syncResponse.json();
  //             if (!syncResponse.ok || !syncJson.success) {
  //               throw new Error(
  //                 syncJson.error || "Failed to sync transactions"
  //               );
  //             }

  //             const syncedMonth: string =
  //               syncJson.month ?? new Date().toISOString().slice(0, 7);
  //             setLastSyncMessage(
  //               `Synced ${
  //                 syncJson.syncedTransactions ?? 0
  //               } transactions for ${syncedMonth}.`
  //             );
  //             onUploadSuccess();
  //             router.push(`/chart?month=${encodeURIComponent(syncedMonth)}`);
  //           } catch (error) {
  //             console.error("Aggregator flow failed", error);
  //             setLinkError(
  //               error instanceof Error
  //                 ? error.message
  //                 : "Unexpected error connecting account"
  //             );
  //           } finally {
  //             setIsSyncing(false);
  //             handler.destroy();
  //             resolve();
  //           }
  //         },
  //         onExit: (err: LinkExitMetadata | null) => {
  //           handler.destroy();
  //           if (err?.display_message || err?.error_message) {
  //             setLinkError(err.display_message || err.error_message);
  //           }
  //           resolve();
  //         },
  //       });

  //       handler.open();
  //     });
  //   } catch (error) {
  //     console.error("Failed to open aggregator widget", error);
  //     setLinkError(
  //       error instanceof Error
  //         ? error.message
  //         : "Unable to start account connection"
  //     );
  //   } finally {
  //     setIsLinking(false);
  //   }
  // }, [
  //   fetchLinkToken,
  //   isPlaidReady,
  //   linkToken,
  //   onUploadSuccess,
  //   router,
  //   useremail,
  // ]);

  useEffect(() => {
    const fetchUserFields = async () => {
      try {
        const userDocRef = doc(db, "users", useremail);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          // console.log("User fields:", userData);

          if (userData.months) {
            setMonths(userData.months);
          } else {
            console.log("No months field found in user data");
          }
        } else {
          console.log("No such document exists!");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user document fields:", error);
        return null;
      }
    };

    fetchUserFields();
  }, [useremail]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {/* PLALD SIGN-IN TEMPORARILY DISABLED */}
      {/* <div className="w-full space-y-3 rounded-xl border border-border-primary/50 bg-background-primary/50 p-5 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-text-primary">Connect accounts</h3>
        <p className="text-sm text-text-secondary">
          Link a bank or card account securely to automatically import
          transactions.
        </p>
        <button
          onClick={openAggregatorLink}
          disabled={isLinking || isSyncing || !isPlaidReady}
          className={`w-full rounded-lg px-4 py-2.5 font-semibold transition-all transform ${
            isLinking || isSyncing || !isPlaidReady
              ? "bg-background-tertiary text-text-tertiary cursor-not-allowed"
              : "bg-gradient-to-r from-accent-500 to-secondary-500 hover:from-accent-600 hover:to-secondary-600 text-text-primary shadow-lg hover:scale-105"
          }`}
        >
          {isLinking
            ? "Launching secure link..."
            : isSyncing
            ? "Syncing transactions..."
            : "Connect financial account"}
        </button>
        {linkError && <p className="text-sm text-red-400">{linkError}</p>}
        {lastSyncMessage && (
          <p className="text-sm text-accent-500">{lastSyncMessage}</p>
        )}
      </div> */}

      <label className="flex flex-col items-center w-full">
        <span className="mb-2 font-semibold text-text-primary">
          Upload Multiple CSV Files
        </span>
        <p className="text-xs text-text-tertiary mb-2">
          Select CSV files - they will be combined with AI-detected bank names
        </p>
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileChange}
          className="p-3 border border-border-primary rounded-lg bg-background-primary/50 text-text-primary w-full cursor-pointer hover:border-primary-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer hover:file:bg-primary-600"
        />
        {files && files.length > 0 && (
          <p className="text-xs text-text-tertiary mt-2">
            Selected {files.length} CSV file(s)
          </p>
        )}
      </label>

      <div className="flex flex-col w-full">
        <label htmlFor="month" className="mb-2 font-semibold text-text-primary">
          Enter New Month
        </label>
        <div className="relative">
          <input
            id="month"
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="e.g. January, or 2023-01"
            className="p-3 border border-border-primary rounded-lg bg-background-primary/50 text-slate-900 placeholder-slate-500 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/30 transition w-full"
          />
          {month && (
            <button
              type="button"
              onClick={() => setMonth("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition"
            >
              ✕
            </button>
          )}
        </div>
        {month && (
          <p className="text-xs text-green-400 mt-1">✓ New month: {month}</p>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-3 rounded-lg transition duration-300 font-semibold shadow-lg transform ${
          isUploading
            ? "bg-background-tertiary cursor-not-allowed text-text-tertiary"
            : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-text-primary hover:scale-105"
        }`}
      >
        {/* Enhanced loading state */}
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="relative mr-3">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-primary-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <span>Uploading...</span>
          </div>
        ) : (
          "Upload Files"
        )}
      </button>

      {/* Enhanced Previous Months Section */}
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-text-primary">
            Previous Months
          </label>
          {months.length > 0 && (
            <span className="text-sm text-text-tertiary">
              {months.length} month{months.length !== 1 ? "s" : ""} available
            </span>
          )}
        </div>

        {months.length === 0 ? (
          <div className="text-center py-8 bg-background-secondary/30 rounded-xl border border-border-secondary/50">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-text-tertiary text-sm">
              No previous months found
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Upload some CSV files to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {months.map((eachMonth) => (
              <button
                key={eachMonth}
                onClick={() => {
                  // Navigate directly to the chart page for this month
                  router.push(`/chart?month=${encodeURIComponent(eachMonth)}`);
                }}
                className="p-3 rounded-lg border transition-all duration-200 text-left bg-background-secondary/50 border-border-primary hover:border-primary-500 text-text-secondary hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-secondary-500/10 hover:text-text-primary group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-white transition-colors"></div>
                    <span className="font-medium">{eachMonth}</span>
                  </div>
                  <div className="text-text-tertiary group-hover:text-text-primary transition-colors">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadComponent;
