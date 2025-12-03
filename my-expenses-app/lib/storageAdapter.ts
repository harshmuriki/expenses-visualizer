/**
 * Storage Adapter
 * Unified interface for both Firebase and Local storage
 * Automatically routes to the correct storage backend based on configuration
 */

import { SankeyNode, Map } from "@/app/types/types";
import { getStorageMode } from "./storageConfig";

// Import types
import { UploadPayload as FirebaseUploadPayload } from "./firebaseUpload";
import { UploadPayload as LocalUploadPayload } from "./localUpload";
import { FetchedData } from "./localDataReader";

/**
 * Upload Sankey data to configured storage
 */
export async function uploadSankeyData(payload: {
  nodes: SankeyNode[];
  parentChildMap: Map;
  useremail: string;
  month: string;
  clearExisting?: boolean;
}): Promise<void> {
  const mode = getStorageMode();

  if (mode === "local") {
    const { uploadSankeyToLocalStorage } = await import("./localUpload");
    return uploadSankeyToLocalStorage(payload);
  } else {
    const { uploadSankeyToFirestore } = await import("./firebaseUpload");
    return uploadSankeyToFirestore(payload);
  }
}

/**
 * Fetch data from configured storage
 */
export async function fetchSankeyData(
  userEmail: string,
  month: string
): Promise<FetchedData> {
  const mode = getStorageMode();

  if (mode === "local") {
    const { fetchDataFromLocal } = await import("./localDataReader");
    return fetchDataFromLocal(userEmail, month);
  } else {
    // Import Firebase modules dynamically
    const { collection, doc, getDoc, getDocs } = await import(
      "firebase/firestore"
    );
    const { db } = await import("@/components/firebaseConfig");

    // Fetch from Firebase (copied from SnakeyChartComponent logic)
    const userDocRef = doc(db, "users", userEmail);
    const nodesCollectionRef = collection(userDocRef, month);
    const nodesSnapshot = await getDocs(nodesCollectionRef);

    const nodes: SankeyNode[] = nodesSnapshot.docs
      .filter((snapshotDoc) => snapshotDoc.id !== "parentChildMap")
      .map((snapshotDoc) => ({
        name: snapshotDoc.data().transaction,
        originalName: snapshotDoc.data().transaction,
        cost: snapshotDoc.data().cost || 0,
        index: snapshotDoc.data().index,
        isleaf: snapshotDoc.data().isleaf,
        value: snapshotDoc.data().cost || 0,
        visible: snapshotDoc.data().visible,
        date: snapshotDoc.data().date,
        location: snapshotDoc.data().location,
        bank: snapshotDoc.data().bank,
        raw_str: snapshotDoc.data().raw_str,
      }))
      .sort((a, b) => a.index - b.index);

    const mapDocRef = doc(nodesCollectionRef, "parentChildMap");
    const mapSnapshot = await getDoc(mapDocRef);

    const keys: number[] = mapSnapshot.exists()
      ? Object.keys(mapSnapshot.data()).map((key) => parseInt(key))
      : [];

    const parentChildMapArr: number[][] = mapSnapshot.exists()
      ? Object.values(mapSnapshot.data()).map((values) => values as number[])
      : [];

    const parentChildMap: Map = keys.reduce((acc: Map, key, index) => {
      acc[key] = parentChildMapArr[index];
      return acc;
    }, {});

    // Fetch meta totals
    let metaTotals = null;
    try {
      const metaRef = doc(nodesCollectionRef, "meta");
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        metaTotals = metaSnap.data() as { creditCardPaymentsTotal?: number };
      }
    } catch (e) {
      console.warn("Unable to load meta totals:", e);
    }

    return { nodes, parentChildMap, metaTotals };
  }
}

/**
 * Upload transactions in batch
 */
export async function uploadTransactionsBatch(
  batchData: Array<{
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
  }>
): Promise<void> {
  const mode = getStorageMode();

  if (mode === "local") {
    const { uploadTransactionsInBatch } = await import("./localSendData");
    return uploadTransactionsInBatch(batchData);
  } else {
    const { uploadTransactionsInBatch } = await import(
      "@/components/sendDataFirebase"
    );
    return uploadTransactionsInBatch(batchData);
  }
}

/**
 * Store uploaded file
 */
export async function storeFile(
  file: File,
  userEmail: string,
  month: string
): Promise<{ id?: string; fileName: string; fileSize: number }> {
  const mode = getStorageMode();

  if (mode === "local") {
    const { storeUploadedFile } = await import("./localFileStorage");
    return storeUploadedFile(file, userEmail, month);
  } else {
    const { storeUploadedFile } = await import("./fileStorage");
    return storeUploadedFile(file, userEmail, month);
  }
}

/**
 * Get user's uploaded files
 */
export async function getUserFiles(
  userEmail: string,
  month?: string
): Promise<
  Array<{
    id?: string;
    fileName: string;
    fileType: string;
    month: string;
    userEmail: string;
    uploadDate: string;
    fileSize: number;
  }>
> {
  const mode = getStorageMode();

  if (mode === "local") {
    const { getUserFiles } = await import("./localFileStorage");
    return getUserFiles(userEmail, month);
  } else {
    const { getUserFiles } = await import("./fileStorage");
    return getUserFiles(userEmail, month);
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
