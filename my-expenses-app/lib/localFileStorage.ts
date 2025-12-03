/**
 * Local File Storage
 * Privacy-first replacement for Firebase Storage
 * Stores files directly in IndexedDB
 */

import {
  saveFile as saveFileDB,
  getUserFiles as getUserFilesDB,
  deleteFile as deleteFileDB,
  StoredFile,
} from "./localStorageDB";

export interface UploadedFile {
  id?: string;
  fileName: string;
  fileType: string;
  downloadURL?: string; // Not used in local storage, kept for compatibility
  month: string;
  userEmail: string;
  uploadDate: string;
  fileSize: number;
  fileData?: ArrayBuffer; // Actual file data
}

/**
 * Store a file locally in IndexedDB
 */
export async function storeUploadedFile(
  file: File,
  userEmail: string,
  month: string
): Promise<UploadedFile> {
  try {
    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer();

    const fileMetadata: StoredFile = {
      fileName: file.name,
      fileType: file.type,
      fileData,
      month,
      userEmail,
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
    };

    const id = await saveFileDB(fileMetadata);

    return {
      id,
      fileName: file.name,
      fileType: file.type,
      month,
      userEmail,
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
    };
  } catch (error) {
    console.error("Error storing file locally:", error);
    throw error;
  }
}

/**
 * Get all uploaded files for a user and optional month
 */
export async function getUserFiles(
  userEmail: string,
  month?: string
): Promise<UploadedFile[]> {
  try {
    const files = await getUserFilesDB(userEmail, month);

    return files
      .map((file) => ({
        id: String(file.id),
        fileName: file.fileName,
        fileType: file.fileType,
        month: file.month,
        userEmail: file.userEmail,
        uploadDate: file.uploadDate,
        fileSize: file.fileSize,
      }))
      .sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
  } catch (error) {
    console.error("Error fetching user files:", error);
    return [];
  }
}

/**
 * Get file data (for download)
 */
export async function getFileData(fileId: string): Promise<Blob | null> {
  try {
    const files = await getUserFilesDB("", undefined);
    const file = files.find((f) => String(f.id) === fileId);

    if (!file) {
      console.error("File not found:", fileId);
      return null;
    }

    return new Blob([file.fileData], { type: file.fileType });
  } catch (error) {
    console.error("Error retrieving file data:", error);
    return null;
  }
}

/**
 * Delete a file
 */
export async function deleteUploadedFile(fileId: string): Promise<void> {
  try {
    await deleteFileDB(fileId);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Create a download URL for a locally stored file
 * This creates a temporary blob URL that can be used in the browser
 */
export async function getLocalFileURL(fileId: string): Promise<string | null> {
  const blob = await getFileData(fileId);
  if (!blob) return null;

  return URL.createObjectURL(blob);
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
