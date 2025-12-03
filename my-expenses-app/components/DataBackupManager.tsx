"use client";

import React, { useState } from "react";
import { FiDownload, FiUpload, FiTrash2, FiDatabase, FiAlertCircle } from "react-icons/fi";
import {
  exportAllData,
  importAllData,
  clearAllData,
  getDatabaseSize,
} from "@/lib/localStorageDB";
import {
  getStorageMode,
  setStorageMode,
  getStorageModeDisplayName,
  getStorageModeWarning,
  StorageMode,
} from "@/lib/storageConfig";

export const DataBackupManager: React.FC = () => {
  const [storageMode, setStorageModeState] = useState<StorageMode>(
    getStorageMode()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dbSize, setDbSize] = useState<{
    usage: number;
    quota: number;
    percentage: number;
  } | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  React.useEffect(() => {
    loadDatabaseSize();
  }, []);

  const loadDatabaseSize = async () => {
    try {
      const size = await getDatabaseSize();
      setDbSize(size);
    } catch (error) {
      console.error("Error loading database size:", error);
    }
  };

  const showMessage = (
    text: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage("✓ Data exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      showMessage("✗ Error exporting data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      await loadDatabaseSize();
      showMessage("✓ Data imported successfully!", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error importing data:", error);
      showMessage("✗ Error importing data. Please check the file format.", "error");
    } finally {
      setIsImporting(false);
      event.target.value = ""; // Reset input
    }
  };

  const handleClearData = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will permanently delete ALL your local data.\n\nThis action cannot be undone!\n\nAre you sure you want to continue?"
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This is your last chance!\n\nAll transactions, files, and user data will be deleted.\n\nType 'DELETE' in the next prompt to confirm."
      )
    ) {
      return;
    }

    const confirmation = prompt(
      "Type 'DELETE' (in capital letters) to confirm:"
    );
    if (confirmation !== "DELETE") {
      showMessage("Deletion cancelled", "info");
      return;
    }

    try {
      await clearAllData();
      await loadDatabaseSize();
      showMessage("✓ All data cleared successfully", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error clearing data:", error);
      showMessage("✗ Error clearing data", "error");
    }
  };

  const handleStorageModeChange = (mode: StorageMode) => {
    setStorageMode(mode);
    setStorageModeState(mode);
    showMessage(
      `✓ Storage mode changed to ${mode}. Reload the page to apply changes.`,
      "info"
    );
    setTimeout(() => window.location.reload(), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiDatabase className="text-blue-600" />
          Storage & Privacy Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your data storage and backups
        </p>
      </div>

      {/* Storage Mode Selector */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FiAlertCircle className="text-blue-600" />
          Storage Mode
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="local"
              name="storage"
              checked={storageMode === "local"}
              onChange={() => handleStorageModeChange("local")}
              className="w-4 h-4"
            />
            <label htmlFor="local" className="flex-1 cursor-pointer">
              <div className="font-medium text-gray-900 dark:text-white">
                Local Storage (Privacy-First) 🔒
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                All data stays on your device. No cloud sync. Make sure to
                export backups regularly!
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="firebase"
              name="storage"
              checked={storageMode === "firebase"}
              onChange={() => handleStorageModeChange("firebase")}
              className="w-4 h-4"
            />
            <label htmlFor="firebase" className="flex-1 cursor-pointer">
              <div className="font-medium text-gray-900 dark:text-white">
                Firebase (Cloud Storage) ☁️
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Data synced to cloud. Access from any device. Requires Firebase
                configuration.
              </div>
            </label>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
          <strong>Current:</strong> {getStorageModeDisplayName()}
          <br />
          <span className="text-xs">{getStorageModeWarning(storageMode)}</span>
        </div>
      </div>

      {/* Database Size (only for local storage) */}
      {storageMode === "local" && dbSize && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Storage Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Used:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatBytes(dbSize.usage)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Quota:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatBytes(dbSize.quota)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(dbSize.percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {dbSize.percentage.toFixed(2)}% used
            </div>
          </div>
        </div>
      )}

      {/* Backup Actions (only for local storage) */}
      {storageMode === "local" && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Backup & Restore
          </h3>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <FiDownload />
            {isExporting ? "Exporting..." : "Export All Data (JSON)"}
          </button>

          <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors cursor-pointer">
            <FiUpload />
            {isImporting ? "Importing..." : "Import Data (JSON)"}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <FiTrash2 />
            Clear All Local Data
          </button>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
              : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          💡 Privacy Tips
        </h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Local storage keeps all data on your device only</li>
          <li>Export backups regularly to prevent data loss</li>
          <li>
            Clearing browser data will delete all local expenses data
          </li>
          <li>
            Import/export works with JSON files - keep them secure
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataBackupManager;
