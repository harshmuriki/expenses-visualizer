/**
 * Local Send Data Module
 * Privacy-first replacement for sendDataFirebase.js
 * Stores data in IndexedDB instead of Firestore
 */

import { DEBUG_ENABLED } from "@/lib/debug";
import {
  StoredTransaction,
  addUserMonth,
  saveTransactionsBatch,
  getTransactions,
  deleteTransaction,
  upsertTransaction,
} from "./localStorageDB";

interface TransactionData {
  useremail: string;
  month: string;
  transaction: string | null;
  index: number | null;
  cost: number | null;
  isleaf: boolean | null;
  visible: boolean;
  isMap: boolean;
  key: string | null;
  values: number[] | null;
  date?: string | null;
  location?: string | null;
  bank?: string | null;
  raw_str?: string | null;
  originalName?: string | null;
}

/**
 * Upload a single transaction to local storage
 */
export const uploadTransaction = async ({
  useremail,
  month,
  transaction,
  index,
  cost,
  isleaf,
  visible,
  isMap,
  key,
  values,
  date,
  location,
  bank,
  raw_str,
}: TransactionData): Promise<void> => {
  try {
    // Add month to user's list
    await addUserMonth(useremail, month);

    if (DEBUG_ENABLED) {
      console.log("[local-storage] single write", {
        isMap,
        transaction,
        index,
      });
    }

    // Default and sanitize fields
    const safeDate = date ?? new Date().toISOString();
    const safeLocation = location ?? "None";
    const safeBank = bank ?? "Unknown Bank";
    const safeRawStr = raw_str ?? null;

    const data: StoredTransaction = {
      userEmail: useremail,
      month,
      transaction: isMap ? null : transaction,
      cost: isMap ? null : cost,
      index: isMap ? null : index,
      isleaf: isMap ? null : isleaf,
      visible,
      isMap,
      key: isMap ? key : null,
      values: isMap ? values : null,
      date: isMap ? null : safeDate,
      location: isMap ? null : safeLocation,
      bank: isMap ? null : safeBank,
      raw_str: isMap ? null : safeRawStr,
    };

    await upsertTransaction(data);
  } catch (error) {
    console.error("Error saving to local storage:", error);
    throw error;
  }
};

/**
 * Upload multiple transactions in batch to local storage
 */
export const uploadTransactionsInBatch = async (
  batchData: TransactionData[]
): Promise<void> => {
  try {
    if (batchData.length === 0) {
      console.warn("No data to upload");
      return;
    }

    const userEmail = batchData[0].useremail;
    const month = batchData[0].month;

    // Add month to user's list
    await addUserMonth(userEmail, month);

    // Handle deletions for name changes
    const existingTransactions = await getTransactions(userEmail, month);
    const deletionPromises: Promise<void>[] = [];

    for (const data of batchData) {
      if (
        !data.isMap &&
        data.originalName &&
        data.originalName !== data.transaction
      ) {
        // Find and delete the old transaction with the original name
        const oldTransaction = existingTransactions.find(
          (t) =>
            !t.isMap &&
            t.transaction === data.originalName &&
            t.index === data.index
        );

        if (oldTransaction && oldTransaction.id) {
          deletionPromises.push(deleteTransaction(oldTransaction.id));
          if (DEBUG_ENABLED) {
            console.log("[batch] deleting old doc", {
              oldName: data.originalName,
              index: data.index,
            });
          }
        }
      }
    }

    // Wait for all deletions to complete
    await Promise.all(deletionPromises);

    // Prepare batch data
    const storedTransactions: StoredTransaction[] = batchData.map((data) => {
      const safeDate = data.date ?? new Date().toISOString();
      const safeLocation = data.location ?? "None";
      const safeBank = data.bank ?? "Unknown Bank";
      const safeRawStr = data.raw_str ?? null;

      return {
        userEmail: data.useremail,
        month: data.month,
        transaction: data.isMap ? null : data.transaction || "None",
        cost: data.isMap ? null : data.cost,
        index: data.isMap ? null : data.index,
        isleaf: data.isMap ? null : data.isleaf,
        visible: data.visible,
        isMap: data.isMap,
        key: data.isMap ? data.key : null,
        values: data.isMap ? data.values : null,
        date: data.isMap ? null : safeDate,
        location: data.isMap ? null : safeLocation,
        bank: data.isMap ? null : safeBank,
        raw_str: data.isMap ? null : safeRawStr,
      };
    });

    // Save all transactions
    await saveTransactionsBatch(storedTransactions);

    if (DEBUG_ENABLED) {
      console.log("Batch upload to local storage successful!");
    }
  } catch (error) {
    console.error("Error during batch upload to local storage:", error);
    throw error;
  }
};
