"use client";

import React, { useState, useEffect } from "react";
import { getStorageMode, StorageMode } from "@/lib/storageConfig";
import { FiCloud, FiHardDrive, FiInfo } from "react-icons/fi";

interface StorageModeToggleProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  onModeChange?: (mode: StorageMode) => void;
}

export const StorageModeToggle: React.FC<StorageModeToggleProps> = ({
  showLabel = true,
  size = "md",
  onModeChange,
}) => {
  const [mode, setMode] = useState<StorageMode>(getStorageMode());
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMode(getStorageMode());
  }, []);

  const handleToggle = () => {
    const newMode: StorageMode = mode === "local" ? "firebase" : "local";
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const sizeClasses = {
    sm: "h-6 w-12",
    md: "h-8 w-16",
    lg: "h-10 w-20",
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">Storage:</span>
          <div className="relative">
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-1 rounded-full hover:bg-background-secondary transition-colors"
              aria-label="Storage info"
            >
              <FiInfo className="w-4 h-4 text-text-tertiary" />
            </button>
            {showTooltip && (
              <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-background-card border-2 border-border-secondary rounded-lg shadow-xl z-50">
                <p className="text-xs text-text-secondary mb-2">
                  <strong className="text-text-primary">Local Storage:</strong> Data stays on your device. Privacy-first, requires manual backups.
                </p>
                <p className="text-xs text-text-secondary">
                  <strong className="text-text-primary">Firebase:</strong> Data synced to cloud. Access from anywhere.
                </p>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="mt-2 text-xs text-primary-500 hover:text-primary-600"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Local Storage Indicator */}
        <div className={`flex items-center gap-2 transition-opacity ${mode === "local" ? "opacity-100" : "opacity-40"}`}>
          <FiHardDrive
            className="transition-colors"
            size={iconSize[size]}
            style={{ color: mode === "local" ? "var(--color-primary-500)" : "var(--color-text-tertiary)" }}
          />
          {showLabel && (
            <span className="text-xs font-semibold" style={{
              color: mode === "local" ? "var(--color-primary-500)" : "var(--color-text-tertiary)"
            }}>
              Local
            </span>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative rounded-full transition-all duration-300 ${sizeClasses[size]} cursor-pointer hover:shadow-lg`}
          style={{
            backgroundColor: mode === "local"
              ? "var(--color-primary-500)"
              : "var(--color-secondary-500)",
          }}
          aria-label={`Switch to ${mode === "local" ? "Firebase" : "Local Storage"}`}
        >
          <div
            className={`absolute top-1 bg-white rounded-full transition-all duration-300 shadow-md ${
              mode === "local" ? "left-1" : `right-1`
            }`}
            style={{
              width: size === "sm" ? "16px" : size === "md" ? "24px" : "32px",
              height: size === "sm" ? "16px" : size === "md" ? "24px" : "32px",
            }}
          />
        </button>

        {/* Firebase Indicator */}
        <div className={`flex items-center gap-2 transition-opacity ${mode === "firebase" ? "opacity-100" : "opacity-40"}`}>
          <FiCloud
            className="transition-colors"
            size={iconSize[size]}
            style={{ color: mode === "firebase" ? "var(--color-secondary-500)" : "var(--color-text-tertiary)" }}
          />
          {showLabel && (
            <span className="text-xs font-semibold" style={{
              color: mode === "firebase" ? "var(--color-secondary-500)" : "var(--color-text-tertiary)"
            }}>
              Firebase
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageModeToggle;
