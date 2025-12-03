/**
 * Local Storage Database using IndexedDB
 * Privacy-first replacement for Firebase Firestore
 * All data stays on the user's device
 */

import { SankeyNode } from "@/app/types/types";

const DB_NAME = "ExpensesVisualizerDB";
const DB_VERSION = 1;

// Store names
const TRANSACTIONS_STORE = "transactions";
const FILES_STORE = "uploadedFiles";
const USER_STORE = "users";

export interface StoredTransaction {
  id?: string; // Auto-generated key
  userEmail: string;
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
}

export interface StoredFile {
  id?: string;
  fileName: string;
  fileType: string;
  fileData: ArrayBuffer; // Store actual file data
  month: string;
  userEmail: string;
  uploadDate: string;
  fileSize: number;
}

export interface UserData {
  email: string;
  months: string[];
  monthMetadata?: Record<string, { createdAt: string; createdTimestamp: number }>;
}

/**
 * Initialize IndexedDB database
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create transactions store with composite index
      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        const transactionStore = db.createObjectStore(TRANSACTIONS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        transactionStore.createIndex("userEmail_month", ["userEmail", "month"], {
          unique: false,
        });
        transactionStore.createIndex("userEmail", "userEmail", { unique: false });
      }

      // Create files store
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const fileStore = db.createObjectStore(FILES_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        fileStore.createIndex("userEmail_month", ["userEmail", "month"], {
          unique: false,
        });
        fileStore.createIndex("userEmail", "userEmail", { unique: false });
      }

      // Create users store
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: "email" });
      }
    };
  });
}

/**
 * Save a single transaction
 */
export async function saveTransaction(
  transaction: StoredTransaction
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readwrite");
    const store = tx.objectStore(TRANSACTIONS_STORE);

    const request = store.add(transaction);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save multiple transactions in batch
 */
export async function saveTransactionsBatch(
  transactions: StoredTransaction[]
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readwrite");
    const store = tx.objectStore(TRANSACTIONS_STORE);

    let completed = 0;
    const total = transactions.length;

    transactions.forEach((transaction) => {
      const request = store.add(transaction);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    if (total === 0) {
      resolve();
    }
  });
}

/**
 * Get all transactions for a user and month
 */
export async function getTransactions(
  userEmail: string,
  month: string
): Promise<StoredTransaction[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readonly");
    const store = tx.objectStore(TRANSACTIONS_STORE);
    const index = store.index("userEmail_month");

    const request = index.getAll([userEmail, month]);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all transactions for a user and month (for re-upload)
 */
export async function clearTransactions(
  userEmail: string,
  month: string
): Promise<void> {
  const db = await initDB();
  const transactions = await getTransactions(userEmail, month);

  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readwrite");
    const store = tx.objectStore(TRANSACTIONS_STORE);

    let deleted = 0;
    const total = transactions.length;

    if (total === 0) {
      resolve();
      return;
    }

    transactions.forEach((transaction) => {
      const request = store.delete(transaction.id!);
      request.onsuccess = () => {
        deleted++;
        if (deleted === total) {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Update or insert transaction (upsert operation)
 */
export async function upsertTransaction(
  transaction: StoredTransaction
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readwrite");
    const store = tx.objectStore(TRANSACTIONS_STORE);

    const request = transaction.id ? store.put(transaction) : store.add(transaction);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a transaction by ID
 */
export async function deleteTransaction(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readwrite");
    const store = tx.objectStore(TRANSACTIONS_STORE);

    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update user metadata
 */
export async function saveUserData(userData: UserData): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_STORE], "readwrite");
    const store = tx.objectStore(USER_STORE);

    const request = store.put(userData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get user metadata
 */
export async function getUserData(email: string): Promise<UserData | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([USER_STORE], "readonly");
    const store = tx.objectStore(USER_STORE);

    const request = store.get(email);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a month to user's month list
 */
export async function addUserMonth(
  email: string,
  month: string
): Promise<void> {
  const userData = await getUserData(email);
  if (userData) {
    if (!userData.months.includes(month)) {
      userData.months.push(month);
      userData.monthMetadata = userData.monthMetadata || {};
      userData.monthMetadata[month] = {
        createdAt: new Date().toISOString(),
        createdTimestamp: Date.now(),
      };
      await saveUserData(userData);
    }
  } else {
    await saveUserData({
      email,
      months: [month],
      monthMetadata: {
        [month]: {
          createdAt: new Date().toISOString(),
          createdTimestamp: Date.now(),
        },
      },
    });
  }
}

/**
 * Save uploaded file data
 */
export async function saveFile(file: StoredFile): Promise<string> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readwrite");
    const store = tx.objectStore(FILES_STORE);

    const request = store.add(file);
    request.onsuccess = () => resolve(String(request.result));
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all files for a user
 */
export async function getUserFiles(
  userEmail: string,
  month?: string
): Promise<StoredFile[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readonly");
    const store = tx.objectStore(FILES_STORE);

    if (month) {
      const index = store.index("userEmail_month");
      const request = index.getAll([userEmail, month]);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      const index = store.index("userEmail");
      const request = index.getAll(userEmail);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }
  });
}

/**
 * Delete a file by ID
 */
export async function deleteFile(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readwrite");
    const store = tx.objectStore(FILES_STORE);

    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Export all data for backup (returns JSON)
 */
export async function exportAllData(): Promise<{
  transactions: StoredTransaction[];
  files: Array<Omit<StoredFile, "fileData"> & { fileDataBase64: string }>;
  users: UserData[];
}> {
  const db = await initDB();

  const transactions = await new Promise<StoredTransaction[]>((resolve, reject) => {
    const tx = db.transaction([TRANSACTIONS_STORE], "readonly");
    const store = tx.objectStore(TRANSACTIONS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const filesRaw = await new Promise<StoredFile[]>((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readonly");
    const store = tx.objectStore(FILES_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Convert file data to base64 for JSON serialization
  const files = filesRaw.map((file) => ({
    ...file,
    fileData: undefined as any,
    fileDataBase64: btoa(
      String.fromCharCode(...new Uint8Array(file.fileData))
    ),
  }));

  const users = await new Promise<UserData[]>((resolve, reject) => {
    const tx = db.transaction([USER_STORE], "readonly");
    const store = tx.objectStore(USER_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return { transactions, files, users };
}

/**
 * Import data from backup
 */
export async function importAllData(data: {
  transactions: StoredTransaction[];
  files: Array<Omit<StoredFile, "fileData"> & { fileDataBase64: string }>;
  users: UserData[];
}): Promise<void> {
  const db = await initDB();

  // Import transactions
  if (data.transactions && data.transactions.length > 0) {
    const tx1 = db.transaction([TRANSACTIONS_STORE], "readwrite");
    const store1 = tx1.objectStore(TRANSACTIONS_STORE);
    for (const transaction of data.transactions) {
      store1.add(transaction);
    }
    await new Promise<void>((resolve, reject) => {
      tx1.oncomplete = () => resolve();
      tx1.onerror = () => reject(tx1.error);
    });
  }

  // Import files (convert base64 back to ArrayBuffer)
  if (data.files && data.files.length > 0) {
    const tx2 = db.transaction([FILES_STORE], "readwrite");
    const store2 = tx2.objectStore(FILES_STORE);
    for (const file of data.files) {
      const binaryString = atob(file.fileDataBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const fileWithData: StoredFile = {
        ...file,
        fileData: bytes.buffer,
      };
      delete (fileWithData as any).fileDataBase64;
      store2.add(fileWithData);
    }
    await new Promise<void>((resolve, reject) => {
      tx2.oncomplete = () => resolve();
      tx2.onerror = () => reject(tx2.error);
    });
  }

  // Import users
  if (data.users && data.users.length > 0) {
    const tx3 = db.transaction([USER_STORE], "readwrite");
    const store3 = tx3.objectStore(USER_STORE);
    for (const user of data.users) {
      store3.put(user);
    }
    await new Promise<void>((resolve, reject) => {
      tx3.oncomplete = () => resolve();
      tx3.onerror = () => reject(tx3.error);
    });
  }
}

/**
 * Clear all data from IndexedDB (for privacy/reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await initDB();

  const tx = db.transaction(
    [TRANSACTIONS_STORE, FILES_STORE, USER_STORE],
    "readwrite"
  );

  tx.objectStore(TRANSACTIONS_STORE).clear();
  tx.objectStore(FILES_STORE).clear();
  tx.objectStore(USER_STORE).clear();

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
}> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: estimate.quota
        ? ((estimate.usage || 0) / estimate.quota) * 100
        : 0,
    };
  }
  return { usage: 0, quota: 0, percentage: 0 };
}
