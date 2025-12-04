/**
 * Local Upload Module
 * Privacy-first replacement for firebaseUpload.ts
 * Stores data in IndexedDB instead of Firestore
 */

import { Map, SankeyNode } from "@/app/types/types";
import {
  StoredTransaction,
  saveTransactionsBatch,
  addUserMonth,
  clearTransactions,
} from "./localStorageDB";

export interface UploadPayload {
  nodes: SankeyNode[];
  parentChildMap: Map;
  useremail: string;
  month: string;
  clearExisting?: boolean; // Option to clear existing data before upload
}

/**
 * Upload Sankey data to local IndexedDB storage
 */
export const uploadSankeyToLocalStorage = async ({
  nodes,
  parentChildMap,
  useremail,
  month,
  clearExisting = false,
}: UploadPayload): Promise<void> => {
  try {
    // Clear existing data if requested (useful for re-uploads)
    if (clearExisting) {
      await clearTransactions(useremail, month);
    }

    const batchData: StoredTransaction[] = [];

    // Add all nodes
    for (const node of nodes) {
      const isLeaf =
        node.index === 0
          ? false
          : !Object.prototype.hasOwnProperty.call(parentChildMap, node.index);

      batchData.push({
        userEmail: useremail,
        month,
        transaction: node.name,
        index: node.index,
        cost: node.cost ?? 0,
        isleaf: isLeaf,
        isMap: false,
        key: null,
        values: null,
        visible: node.visible ?? true,
        date: node.date,
        location: node.location,
        bank: node.bank,
        raw_str: node.raw_str,
      });
    }

    // Add parent-child map entries
    for (const [key, values] of Object.entries(parentChildMap)) {
      batchData.push({
        userEmail: useremail,
        month,
        transaction: null,
        index: null,
        cost: null,
        isleaf: null,
        isMap: true,
        key,
        values: values as number[],
        visible: true,
      });
    }

    // Save all data in batch
    await saveTransactionsBatch(batchData);

    // Update user's month list
    await addUserMonth(useremail, month);

    console.log(
      `✓ Successfully saved ${nodes.length} transactions locally for ${useremail}/${month}`
    );
  } catch (error) {
    console.error("Error uploading to local storage:", error);
    throw error;
  }
};

/**
 * Compatibility wrapper for existing code
 * Can be used as a drop-in replacement for uploadSankeyToFirestore
 */
export const uploadSankeyToFirestore = uploadSankeyToLocalStorage;
