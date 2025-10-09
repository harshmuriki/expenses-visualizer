"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);
  const [isPlaidReady, setIsPlaidReady] = useState(false);
  const router = useRouter();
  const [months, setMonths] = useState([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    if (!month) {
      alert("Please enter or select a month!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("month", month);
    formData.append("useremail", useremail);

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      console.log("Starting upload...");
      onUploadSuccess();
      alert("File uploaded successfully!");
      console.log("File uploaded successfully!");
      router.push(`/chart?month=${encodeURIComponent(month)}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.Plaid) {
      setIsPlaidReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    script.onload = () => setIsPlaidReady(true);
    script.onerror = () => setLinkError("Unable to load aggregator widget");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchLinkToken = useCallback(async () => {
    const response = await fetch("/api/plaid/create-link-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: useremail }),
    });

    if (!response.ok) {
      throw new Error("Failed to create link token");
    }

    const data = await response.json();
    if (typeof data.link_token !== "string") {
      throw new Error("Aggregator did not return a link token");
    }

    setLinkToken(data.link_token);
    return data.link_token as string;
  }, [useremail]);

  const openAggregatorLink = useCallback(async () => {
    setLinkError(null);

    try {
      if (!isPlaidReady || typeof window === "undefined" || !window.Plaid) {
        throw new Error("Aggregator widget is not ready yet");
      }

      const token = linkToken ?? (await fetchLinkToken());
      setIsLinking(true);

      await new Promise<void>((resolve) => {
        const handler = window.Plaid!.create({
          token,
          onSuccess: async (public_token: string, metadata: LinkSuccessMetadata) => {
            try {
              const exchangeResponse = await fetch(
                "/api/plaid/exchange-public-token",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    public_token,
                    userId: useremail,
                    institution: metadata?.institution?.name,
                  }),
                }
              );

              const exchangeJson = await exchangeResponse.json();
              if (!exchangeResponse.ok || !exchangeJson.success) {
                throw new Error(exchangeJson.error || "Failed to exchange public token");
              }

              const itemId = exchangeJson.itemId as string;
              setIsSyncing(true);
              const syncResponse = await fetch("/api/plaid/sync-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: useremail, itemId }),
              });

              const syncJson = await syncResponse.json();
              if (!syncResponse.ok || !syncJson.success) {
                throw new Error(syncJson.error || "Failed to sync transactions");
              }

              const syncedMonth: string = syncJson.month ?? new Date().toISOString().slice(0, 7);
              setLastSyncMessage(
                `Synced ${syncJson.syncedTransactions ?? 0} transactions for ${syncedMonth}.`
              );
              onUploadSuccess();
              router.push(`/chart?month=${encodeURIComponent(syncedMonth)}`);
            } catch (error) {
              console.error("Aggregator flow failed", error);
              setLinkError(
                error instanceof Error
                  ? error.message
                  : "Unexpected error connecting account"
              );
            } finally {
              setIsSyncing(false);
              handler.destroy();
              resolve();
            }
          },
          onExit: (err: LinkExitMetadata | null) => {
            handler.destroy();
            if (err?.display_message || err?.error_message) {
              setLinkError(err.display_message || err.error_message);
            }
            resolve();
          },
        });

        handler.open();
      });
    } catch (error) {
      console.error("Failed to open aggregator widget", error);
      setLinkError(error instanceof Error ? error.message : "Unable to start account connection");
    } finally {
      setIsLinking(false);
    }
  }, [fetchLinkToken, isPlaidReady, linkToken, onUploadSuccess, router, useremail]);

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
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gray-800 text-gray-200 shadow-md rounded-lg border border-gray-700">
      <div className="w-full space-y-2 rounded-md border border-gray-700 bg-gray-900 p-4">
        <h3 className="text-lg font-semibold">Connect accounts</h3>
        <p className="text-sm text-gray-400">
          Link a bank or card account securely to automatically import transactions.
        </p>
        <button
          onClick={openAggregatorLink}
          disabled={isLinking || isSyncing || !isPlaidReady}
          className={`w-full rounded-md px-4 py-2 font-semibold transition-colors ${
            isLinking || isSyncing || !isPlaidReady
              ? "bg-gray-600 text-gray-300"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isLinking
            ? "Launching secure link..."
            : isSyncing
            ? "Syncing transactions..."
            : "Connect financial account"}
        </button>
        {linkError && <p className="text-sm text-red-400">{linkError}</p>}
        {lastSyncMessage && <p className="text-sm text-emerald-400">{lastSyncMessage}</p>}
      </div>

      <label className="flex flex-col items-center w-full">
        <span className="mb-2 font-semibold">Upload PDF Files</span>
        {/* Enabled multiple pdf files upload */}
        <input
          type="file"
          accept=".csv, application/pdf"
          multiple
          onChange={handleFileChange}
          className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200 w-full cursor-pointer"
        />
      </label>

      <div className="flex flex-col w-full">
        <label htmlFor="month" className="mb-1 font-semibold">
          Enter Month
        </label>
        <input
          id="month"
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="e.g. January, or 2023-01"
          className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-2 rounded-md transition duration-300 font-semibold ${
          isUploading
            ? "bg-gray-500 cursor-not-allowed text-gray-200"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {/* A simple spinning circle */}
        {isUploading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Processing using AI...
          </div>
        ) : (
          "Upload"
        )}
      </button>

      <div className="flex flex-col w-full">
        <label htmlFor="month" className="mb-1 font-semibold">
          Previous Months
        </label>
        <select
          id="month"
          value={month}
          onChange={handleMonthChange}
          className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
        >
          <option value="" disabled>
            Select a month
          </option>
          {months.map((eachMonth) => (
            <option key={eachMonth} value={eachMonth}>
              {eachMonth}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UploadComponent;
