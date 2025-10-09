"use client";

import React, { useState, useEffect } from "react";
import { UploadComponentProps } from "@/app/types/types";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

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
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload files");
      }
      console.log(`Starting upload of ${files.length} file(s)...`);
      onUploadSuccess();
      alert("File uploaded and categorized successfully! ✅");
      console.log("File uploaded successfully!");
      router.push(`/chart?month=${encodeURIComponent(month)}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth: string = e.target.value;
    setMonth(selectedMonth);
    router.push(`/chart?month=${encodeURIComponent(selectedMonth)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {/* PLALD SIGN-IN TEMPORARILY DISABLED */}
      {/* <div className="w-full space-y-3 rounded-xl border border-slate-600/50 bg-slate-900/50 p-5 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white">Connect accounts</h3>
        <p className="text-sm text-slate-300">
          Link a bank or card account securely to automatically import
          transactions.
        </p>
        <button
          onClick={openAggregatorLink}
          disabled={isLinking || isSyncing || !isPlaidReady}
          className={`w-full rounded-lg px-4 py-2.5 font-semibold transition-all transform ${
            isLinking || isSyncing || !isPlaidReady
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#B4DEBD] to-[#91C4C3] hover:from-[#9AC9A4] hover:to-[#7AAFAD] text-white shadow-lg hover:scale-105"
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
          <p className="text-sm text-[#B4DEBD]">{lastSyncMessage}</p>
        )}
      </div> */}

      <label className="flex flex-col items-center w-full">
        <span className="mb-2 font-semibold text-white">
          Upload Multiple Files (CSV/PDF)
        </span>
        <p className="text-xs text-slate-400 mb-2">
          Select multiple files - file source will be detected from filename
        </p>
        <input
          type="file"
          accept=".csv, application/pdf"
          multiple
          onChange={handleFileChange}
          className="p-3 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-200 w-full cursor-pointer hover:border-[#80A1BA] transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#80A1BA] file:text-white file:cursor-pointer hover:file:bg-[#6B8BA4]"
        />
        {files && files.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Selected {files.length} file(s)
          </p>
        )}
      </label>

      <div className="flex flex-col w-full">
        <label htmlFor="month" className="mb-2 font-semibold text-white">
          Enter Month
        </label>
        <input
          id="month"
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="e.g. January, or 2023-01"
          className="p-3 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:border-[#91C4C3] focus:ring-2 focus:ring-[#91C4C3]/30 transition"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-3 rounded-lg transition duration-300 font-semibold shadow-lg transform ${
          isUploading
            ? "bg-slate-700 cursor-not-allowed text-slate-400"
            : "bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] hover:from-[#6B8BA4] hover:to-[#7AAFAD] text-white hover:scale-105"
        }`}
      >
        {/* Enhanced loading state */}
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="relative mr-3">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-[#80A1BA] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#91C4C3] rounded-full animate-pulse"></div>
              </div>
            </div>
            <span>Processing with AI...</span>
          </div>
        ) : (
          "Upload Files"
        )}
      </button>

      <div className="flex flex-col w-full">
        <label
          htmlFor="previousMonth"
          className="mb-2 font-semibold text-white"
        >
          Previous Months
        </label>
        <select
          id="previousMonth"
          value={month}
          onChange={handleMonthChange}
          className="p-3 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-200 focus:border-[#91C4C3] focus:ring-2 focus:ring-[#91C4C3]/30 transition cursor-pointer"
        >
          <option value="" disabled>
            Select a month
          </option>
          {months.map((eachMonth) => (
            <option key={eachMonth} value={eachMonth} className="bg-slate-800">
              {eachMonth}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UploadComponent;
