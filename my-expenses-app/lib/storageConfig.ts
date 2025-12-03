/**
 * Storage Configuration
 * Centralized configuration for storage backend
 * Allows switching between Firebase (cloud) and IndexedDB (local)
 */

export type StorageMode = "local" | "firebase";

/**
 * Get storage mode from environment or localStorage
 * Priority: localStorage > environment variable > default (local)
 */
export function getStorageMode(): StorageMode {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("storage_mode");
    if (saved === "local" || saved === "firebase") {
      return saved;
    }
  }

  // Check environment variable
  const envMode = process.env.NEXT_PUBLIC_STORAGE_MODE;
  if (envMode === "local" || envMode === "firebase") {
    return envMode;
  }

  // Default to local for privacy
  return "local";
}

/**
 * Set storage mode (persists to localStorage)
 */
export function setStorageMode(mode: StorageMode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("storage_mode", mode);
    console.log(`✓ Storage mode set to: ${mode}`);
  }
}

/**
 * Check if local storage is enabled
 */
export function isLocalStorageEnabled(): boolean {
  return getStorageMode() === "local";
}

/**
 * Check if Firebase storage is enabled
 */
export function isFirebaseStorageEnabled(): boolean {
  return getStorageMode() === "firebase";
}

/**
 * Get storage mode display name
 */
export function getStorageModeDisplayName(): string {
  const mode = getStorageMode();
  return mode === "local"
    ? "Local Storage (Privacy-First)"
    : "Firebase (Cloud Storage)";
}

/**
 * Warn user about storage mode implications
 */
export function getStorageModeWarning(mode: StorageMode): string {
  if (mode === "local") {
    return "⚠️ Local storage: Your data stays on this device only. Make sure to export backups! Data will be lost if you clear browser data.";
  } else {
    return "⚠️ Firebase storage: Your data will be stored in the cloud. Requires Firebase configuration.";
  }
}

/**
 * Check if storage migration is needed
 */
export async function checkStorageMigration(): Promise<{
  needsMigration: boolean;
  fromMode: StorageMode;
  toMode: StorageMode;
}> {
  // This would check if there's data in one storage but not the other
  // and suggest migration
  return {
    needsMigration: false,
    fromMode: "local",
    toMode: "local",
  };
}
