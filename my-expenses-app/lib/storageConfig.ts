/**
 * Storage Configuration
 * Centralized configuration for storage backend
 * Allows switching between Firebase (cloud) and local file system
 *
 * IMPORTANT: Storage mode is controlled ONLY by NEXT_PUBLIC_STORAGE_MODE in .env
 * Set NEXT_PUBLIC_STORAGE_MODE=local for local storage (privacy-first)
 * Set NEXT_PUBLIC_STORAGE_MODE=firebase for cloud storage
 */

export type StorageMode = "local" | "firebase";

/**
 * Get storage mode from environment variable
 * Priority: NEXT_PUBLIC_STORAGE_MODE > default (firebase)
 */
export function getStorageMode(): StorageMode {
  // Check environment variable (works on both server and client)
  const envMode = process.env.NEXT_PUBLIC_STORAGE_MODE;

  if (envMode === "local") {
    return "local";
  }

  if (envMode === "firebase") {
    return "firebase";
  }

  // Default to firebase for backward compatibility
  console.warn("NEXT_PUBLIC_STORAGE_MODE not set in .env, defaulting to firebase");
  return "firebase";
}

/**
 * Set storage mode - NOTE: This only updates localStorage for UI state
 * To actually change storage mode, update NEXT_PUBLIC_STORAGE_MODE in .env and restart server
 */
export function setStorageMode(mode: StorageMode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("storage_mode", mode);
    console.log(`✓ Storage mode UI preference set to: ${mode}`);
    console.warn(`⚠️ To apply changes, set NEXT_PUBLIC_STORAGE_MODE=${mode} in .env and restart the server`);
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
