/**
 * Storage Adapter
 * Unified interface for both Firebase and Local storage
 * Automatically routes to the correct storage backend based on configuration
 */

import { SankeyNode, Map } from "@/app/types/types";
import { getStorageMode } from "./storageConfig";
import { debugLog, timeStart, timeEnd } from "./debug";

// Import types
import { FetchedData } from "./localDataReader";

/**
 * Upload Sankey data to configured storage
 * Storage mode is determined by NEXT_PUBLIC_STORAGE_MODE in .env
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
    // Check if we're on the server (Node.js) or browser
    if (typeof window === "undefined") {
      // Server-side: use file system storage
      const { saveDataToFile } = await import("./serverLocalStorage");
      return saveDataToFile(
        payload.useremail,
        payload.month,
        payload.nodes,
        payload.parentChildMap
      );
    } else {
      // Browser-side: use IndexedDB
      const { uploadSankeyToLocalStorage } = await import("./localUpload");
      return uploadSankeyToLocalStorage(payload);
    }
  } else {
    const { uploadSankeyToFirestore } = await import("./firebaseUpload");
    return uploadSankeyToFirestore(payload);
  }
}

/**
 * Fetch data from configured storage
 * Storage mode is determined by NEXT_PUBLIC_STORAGE_MODE in .env
 */
export async function fetchSankeyData(
  userEmail: string,
  month: string
): Promise<FetchedData> {
  timeStart("storage-adapter", "fetchSankeyData");
  const mode = getStorageMode();
  debugLog("storage-adapter", `🚀 fetchSankeyData called`, { userEmail, month });
  debugLog("storage-adapter", `📦 Storage mode: ${mode}`, { 
    isServer: typeof window === "undefined",
    isBrowser: typeof window !== "undefined",
  });

  if (mode === "local") {
    // Check if we're on the server (Node.js) or browser
    if (typeof window === "undefined") {
      // Server-side: use file system storage
      debugLog("storage-adapter", `🖥️ Server-side: Using file system storage`);
      const { loadDataFromFile } = await import("./serverLocalStorage");
      const data = await loadDataFromFile(userEmail, month);

      if (!data) {
        debugLog("storage-adapter", `⚠️ No data found in file system`, { userEmail, month });
        timeEnd("storage-adapter", "fetchSankeyData");
        return {
          nodes: [],
          parentChildMap: {},
          metaTotals: null,
        };
      }

      debugLog("storage-adapter", `✅ Data loaded from file system`, {
        nodesCount: data.nodes.length,
        mapEntriesCount: Object.keys(data.parentChildMap).length,
      });
      timeEnd("storage-adapter", "fetchSankeyData");
      
      return {
        nodes: data.nodes,
        parentChildMap: data.parentChildMap,
        metaTotals: data.metaTotals,
      };
    } else {
      // Browser-side: use IndexedDB
      debugLog("storage-adapter", `🌐 Browser-side: Using IndexedDB`);
      const { fetchDataFromLocal } = await import("./localDataReader");
      let result = await fetchDataFromLocal(userEmail, month);
      
      // If no data in IndexedDB and we're in local mode, try to sync from server-side files
      // (This handles the case where data was uploaded server-side but not yet synced to browser IndexedDB)
      if (result.nodes.length === 0 && mode === "local") {
        debugLog("storage-adapter", `⚠️ No data in IndexedDB, checking server-side files for sync`);
        try {
          // Fetch from server API endpoint that reads from file system
          const response = await fetch(`/api/local-data?userEmail=${encodeURIComponent(userEmail)}&month=${encodeURIComponent(month)}`);
          if (response.ok) {
            const serverData = await response.json();
            if (serverData.nodes && serverData.nodes.length > 0) {
              debugLog("storage-adapter", `✅ Found data on server files, syncing to IndexedDB`, {
                nodesCount: serverData.nodes.length,
              });
              // Sync to IndexedDB for future reads
              const { uploadSankeyToLocalStorage } = await import("./localUpload");
              await uploadSankeyToLocalStorage({
                nodes: serverData.nodes,
                parentChildMap: serverData.parentChildMap,
                useremail: userEmail,
                month,
              });
              // Fetch again from IndexedDB now that it's synced
              result = await fetchDataFromLocal(userEmail, month);
              debugLog("storage-adapter", `✅ Data synced from server files to IndexedDB`, {
                nodesCount: result.nodes.length,
              });
            } else {
              debugLog("storage-adapter", `No data found on server files either`);
            }
          } else if (response.status === 404) {
            debugLog("storage-adapter", `No data found on server files (404)`);
          }
        } catch (syncError) {
          debugLog("storage-adapter", `Failed to sync from server files`, syncError);
        }
      }
      
      debugLog("storage-adapter", `✅ Data loaded from IndexedDB`, {
        nodesCount: result.nodes.length,
        mapEntriesCount: Object.keys(result.parentChildMap).length,
      });
      timeEnd("storage-adapter", "fetchSankeyData");
      return result;
    }
  } else {
    debugLog("storage-adapter", `☁️ Using Firebase storage`);
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

    debugLog("storage-adapter", `✅ Data loaded from Firebase`, {
      nodesCount: nodes.length,
      mapEntriesCount: Object.keys(parentChildMap).length,
    });
    timeEnd("storage-adapter", "fetchSankeyData");
    
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
 * Get all months for a user from configured storage
 */
export async function getUserMonths(userEmail: string): Promise<string[]> {
  const mode = getStorageMode();

  if (mode === "local") {
    // Check if we're on the server (Node.js) or browser
    if (typeof window === "undefined") {
      // Server-side: use file system storage
      const { getUserMonths } = await import("./serverLocalStorage");
      return getUserMonths(userEmail);
    } else {
      // Browser-side: use IndexedDB
      const { getUserMonths } = await import("./localDataReader");
      return getUserMonths(userEmail);
    }
  } else {
    // Firebase: get from user document
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/components/firebaseConfig");
    
    const userDocRef = doc(db, "users", userEmail);
    const userDocSnapshot = await getDoc(userDocRef);
    
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      return userData.months || [];
    }
    
    return [];
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
