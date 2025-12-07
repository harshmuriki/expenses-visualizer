"use client";

import React, { useState, useEffect } from "react";
import { debugLog, timeStart, timeEnd } from "@/lib/debug";
import { UploadComponentProps } from "@/app/types/types";
import { useRouter } from "next/navigation";
import { getUserMonths, uploadTransactionsBatch } from "@/lib/storageAdapter";
import "../styles/loading-animations.css";

const UploadComponent: React.FC<UploadComponentProps> = ({
  onUploadSuccess,
  useremail,
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [month, setMonth] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const router = useRouter();
  const [months, setMonths] = useState<string[]>([]);

  // Helpers for local month backup file
  const buildLocalFileName = (inputMonth: string) => {
    const safeMonth = (inputMonth || "unknown").replace(/[^a-z0-9-_]/gi, "_");
    return `expenses-${safeMonth}.json`;
  };

  const normalizeParentChildMap = (
    input: Record<string | number, number[]>
  ): Record<number, number[]> => {
    const normalized: Record<number, number[]> = {};
    if (!input) return normalized;

    Object.entries(input).forEach(([key, value]) => {
      const numKey = Number(key);
      if (Number.isNaN(numKey) || !Array.isArray(value)) return;
      normalized[numKey] = value
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v));
    });
    return normalized;
  };

  const getOrPickDirectoryHandle = async () => {
    const directoryPicker = (typeof window !== "undefined" &&
      (window as any).showDirectoryPicker) as (() => Promise<any>) | undefined;

    if (!directoryPicker) {
      alert("Local folder access is not supported in this browser.");
      return null;
    }

    return directoryPicker();
  };

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

  // Load a saved month JSON (from Sync to Local) directly into storage and open chart
  const handleLoadFromLocal = async () => {
    if (typeof window === "undefined") return;

    if (!month) {
      alert("Enter the month name to load (e.g., january or 2023-01).");
      return;
    }

    setIsLoadingLocal(true);
    try {
      const directoryHandle = await getOrPickDirectoryHandle();
      if (!directoryHandle) {
        return;
      }

      const fileName = buildLocalFileName(month);
      let fileHandle: any;
      try {
        fileHandle = await directoryHandle.getFileHandle(fileName, {
          create: false,
        });
      } catch (err) {
        alert(`Could not find ${fileName} in the selected folder.`);
        return;
      }

      if (fileHandle.requestPermission) {
        const filePermission = await fileHandle.requestPermission({
          mode: "readwrite",
        });
        if (filePermission === "denied") {
          alert("Permission denied to read the file.");
          return;
        }
      }

      const file = await fileHandle.getFile();
      const text = await file.text();

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        alert("Local file is not valid JSON.");
        return;
      }

      const nodes = parsed?.nodes;
      if (!Array.isArray(nodes)) {
        alert("Local file missing required data for nodes.");
        return;
      }

      const targetMonth = parsed?.month || month;
      const userEmail = parsed?.userEmail || useremail;
      const parentChildMap = normalizeParentChildMap(parsed?.parentChildMap);
      const metaTotals = parsed?.metaTotals ?? null;

      const batchData: Array<{
        useremail: string;
        month: string;
        transaction: string | null;
        index: number | null;
        cost: number | null;
        isleaf: boolean | null;
        isMap: boolean;
        key: string | null;
        values: number[] | null;
        visible: boolean;
        date?: string | null;
        location?: string | null;
        bank?: string | null;
        raw_str?: string | null;
        originalName?: string | null;
      }> = [];

      nodes.forEach((node: any) => {
        if (node?.index === 0) return; // skip root

        const safeTransactionName =
          (node?.name || "").trim() || "Unnamed Transaction";
        const safeCost = typeof node?.cost === "number" ? node.cost : 0;
        const safeIndex = typeof node?.index === "number" ? node.index : 0;
        const isLeaf =
          !Object.prototype.hasOwnProperty.call(parentChildMap, safeIndex) &&
          safeIndex !== 0;
        const nowIso = new Date().toISOString();

        batchData.push({
          useremail: userEmail,
          month: targetMonth,
          transaction: safeTransactionName,
          originalName: node?.originalName,
          index: safeIndex,
          cost: safeCost,
          isleaf: isLeaf,
          isMap: false,
          key: null,
          values: null,
          visible: node?.visible ?? true,
          date: isLeaf ? node?.date ?? nowIso : nowIso,
          location: node?.location ?? "None",
          bank: node?.bank ?? "Unknown Bank",
          raw_str: node?.raw_str || "None",
        });
      });

      for (const [key, values] of Object.entries(parentChildMap)) {
        batchData.push({
          useremail: userEmail,
          month: targetMonth,
          transaction: null,
          index: null,
          cost: null,
          isleaf: null,
          isMap: true,
          key,
          values: values as number[],
          visible: true,
        });
      }

      // Meta totals saved as a special map entry for compatibility
      if (metaTotals) {
        batchData.push({
          useremail: userEmail,
          month: targetMonth,
          transaction: "meta",
          index: null,
          cost: null,
          isleaf: null,
          isMap: false,
          key: null,
          values: null,
          visible: true,
          date: new Date().toISOString(),
          location: null,
          bank: null,
          raw_str: null,
        });
      }

      await uploadTransactionsBatch(batchData);
      onUploadSuccess();
      alert(`Loaded ${fileName} successfully. Redirecting to chart...`);
      setMonth(targetMonth);
      router.push(`/chart?month=${encodeURIComponent(targetMonth)}`);
    } catch (error) {
      console.error("Error loading local file:", error);
      alert("Failed to load from local file.");
    } finally {
      setIsLoadingLocal(false);
    }
  };

  useEffect(() => {
    const fetchUserMonths = async () => {
      try {
        // Use storage adapter to get months (works with both local and Firebase)
        const monthsList = await getUserMonths(useremail);
        setMonths(monthsList);
      } catch (error) {
        console.error("Error fetching user months:", error);
        setMonths([]);
      }
    };

    if (useremail) {
      fetchUserMonths();
    }
  }, [useremail]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
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
          className="glass-input cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:glass-button-primary file:cursor-pointer"
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
            className="glass-input"
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

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={handleUpload}
          disabled={isUploading || isLoadingLocal}
          className={`flex-1 px-6 py-3 rounded-lg transition duration-300 font-semibold transform ${
            isUploading
              ? "glass-button opacity-50 cursor-not-allowed"
              : "glass-button-primary hover:scale-105"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="relative mr-3">
                <div className="w-5 h-5 border-2 border-text-tertiary border-t-primary-500 rounded-full animate-spin"></div>
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

        <button
          onClick={handleLoadFromLocal}
          disabled={isLoadingLocal || isUploading}
          className={`flex-1 px-6 py-3 rounded-lg transition duration-300 font-semibold transform ${
            isLoadingLocal
              ? "glass-button opacity-50 cursor-not-allowed"
              : "glass-button-secondary hover:scale-105"
          }`}
        >
          {isLoadingLocal ? (
            <div className="flex items-center justify-center">
              <div className="relative mr-3">
                <div className="w-5 h-5 border-2 border-text-tertiary border-t-secondary-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <span>Loading from Local...</span>
            </div>
          ) : (
            "Load from Local"
          )}
        </button>
      </div>

      {/* Enhanced Previous Months Section */}
      {/* <div className="flex flex-col w-full">
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
            <p className="text-text-tertiary text-xs mt-1">
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
                className="glass-card p-3 transition-all duration-200 text-left text-text-secondary hover:text-text-primary group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-text-tertiary group-hover:bg-text-primary transition-colors"></div>
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
      </div> */}
    </div>
  );
};

export default UploadComponent;
