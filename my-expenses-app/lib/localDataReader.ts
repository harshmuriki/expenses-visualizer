/**
 * Local Data Reader
 * Helper functions for reading data from IndexedDB
 * Provides the same interface as Firebase reads for easy migration
 */

import { SankeyNode } from "@/app/types/types";
import { getTransactions, getUserData, StoredTransaction } from "./localStorageDB";

type Map = Record<number, number[]>;

export interface FetchedData {
  nodes: SankeyNode[];
  parentChildMap: Map;
  metaTotals?: {
    creditCardPaymentsTotal?: number;
  } | null;
}

/**
 * Fetch all data (nodes + parentChildMap) for a user and month
 * This is the main function used by SnakeyChartComponent
 */
export async function fetchDataFromLocal(
  userEmail: string,
  month: string
): Promise<FetchedData> {
  try {
    if (!userEmail || !month) {
      throw new Error("User email and month are required");
    }

    const transactions = await getTransactions(userEmail, month);

    if (transactions.length === 0) {
      return {
        nodes: [],
        parentChildMap: {},
        metaTotals: null,
      };
    }

    // Separate nodes from parent-child map
    const nodeTransactions = transactions.filter((t) => !t.isMap);
    const mapTransactions = transactions.filter((t) => t.isMap);

    // Build nodes array
    const nodes: SankeyNode[] = nodeTransactions
      .map((t) => ({
        name: t.transaction || "",
        originalName: t.transaction || "",
        cost: t.cost || 0,
        index: t.index || 0,
        isleaf: t.isleaf || false,
        value: t.cost || 0,
        visible: t.visible ?? true,
        date: t.date || undefined,
        location: t.location || undefined,
        bank: t.bank || undefined,
        raw_str: t.raw_str || undefined,
      }))
      .sort((a, b) => a.index - b.index);

    // Build parent-child map
    const parentChildMap: Map = {};
    for (const mapTransaction of mapTransactions) {
      if (mapTransaction.key && mapTransaction.values) {
        parentChildMap[parseInt(mapTransaction.key)] = mapTransaction.values;
      }
    }

    // Check for meta totals
    const metaTransaction = transactions.find(
      (t) => t.transaction === "meta" || t.key === "meta"
    );
    const metaTotals = metaTransaction
      ? {
          creditCardPaymentsTotal:
            (metaTransaction as any).creditCardPaymentsTotal || undefined,
        }
      : null;

    return {
      nodes,
      parentChildMap,
      metaTotals,
    };
  } catch (error) {
    console.error("Error fetching data from local storage:", error);
    throw error;
  }
}

/**
 * Get all months for a user
 */
export async function getUserMonths(userEmail: string): Promise<string[]> {
  try {
    const userData = await getUserData(userEmail);
    return userData?.months || [];
  } catch (error) {
    console.error("Error fetching user months:", error);
    return [];
  }
}

/**
 * Check if data exists for a user and month
 */
export async function hasDataForMonth(
  userEmail: string,
  month: string
): Promise<boolean> {
  try {
    const transactions = await getTransactions(userEmail, month);
    return transactions.length > 0;
  } catch (error) {
    console.error("Error checking data:", error);
    return false;
  }
}

/**
 * Get transaction count for a month
 */
export async function getTransactionCount(
  userEmail: string,
  month: string
): Promise<number> {
  try {
    const transactions = await getTransactions(userEmail, month);
    return transactions.filter((t) => !t.isMap && t.isleaf).length;
  } catch (error) {
    console.error("Error counting transactions:", error);
    return 0;
  }
}

/**
 * Get total spending for a month
 */
export async function getTotalSpending(
  userEmail: string,
  month: string
): Promise<number> {
  try {
    const transactions = await getTransactions(userEmail, month);
    const total = transactions
      .filter((t) => !t.isMap && t.isleaf && t.cost)
      .reduce((sum, t) => sum + (t.cost || 0), 0);
    return total;
  } catch (error) {
    console.error("Error calculating total spending:", error);
    return 0;
  }
}
