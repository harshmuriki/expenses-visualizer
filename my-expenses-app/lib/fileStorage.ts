import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { storage, db } from "@/components/firebaseConfig";

export interface UploadedFile {
  id?: string;
  fileName: string;
  fileType: string;
  downloadURL: string;
  month: string;
  userEmail: string;
  uploadDate: string;
  fileSize: number;
}

/**
 * Upload a file to Firebase Storage and save metadata to Firestore
 */
export async function storeUploadedFile(
  file: File,
  userEmail: string,
  month: string
): Promise<UploadedFile> {
  try {
    // Create a unique file path
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `uploads/${userEmail}/${month}/${timestamp}_${sanitizedFileName}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Save metadata to Firestore
    const fileMetadata: UploadedFile = {
      fileName: file.name,
      fileType: file.type,
      downloadURL,
      month,
      userEmail,
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
    };

    const docRef = await addDoc(collection(db, "uploadedFiles"), fileMetadata);

    return {
      ...fileMetadata,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error storing file:", error);
    // Don't throw error - file storage is optional
    // The main upload process should continue even if file storage fails
    console.warn("File upload will continue without storing the original file");
    return null as unknown as UploadedFile;
  }
}

/**
 * Get all uploaded files for a user and month
 */
export async function getUserFiles(
  userEmail: string,
  month?: string
): Promise<UploadedFile[]> {
  try {
    const filesRef = collection(db, "uploadedFiles");
    let q = query(
      filesRef,
      where("userEmail", "==", userEmail),
      orderBy("uploadDate", "desc")
    );

    if (month) {
      q = query(
        filesRef,
        where("userEmail", "==", userEmail),
        where("month", "==", month),
        orderBy("uploadDate", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    const files: UploadedFile[] = [];

    querySnapshot.forEach((doc) => {
      files.push({
        id: doc.id,
        ...doc.data(),
      } as UploadedFile);
    });

    return files;
  } catch (error) {
    console.error("Error fetching user files:", error);
    return [];
  }
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
