/**
 * Server-Side Local Storage
 * File-system based storage for server-side operations (API routes)
 * Stores data as JSON files in a local directory
 */

import fs from "fs/promises";
import path from "path";
import { SankeyNode } from "@/app/types/types";
import { debugLog, timeStart, timeEnd } from "./debug";

const DATA_DIR = path.join(process.cwd(), ".local-data");

export type Map = Record<number, number[]>;

export interface StoredData {
  nodes: SankeyNode[];
  parentChildMap: Map;
  metaTotals?: {
    creditCardPaymentsTotal?: number;
  } | null;
  lastUpdated: string;
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Get file path for user and month
 */
function getFilePath(userEmail: string, month: string): string {
  const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9@._-]/g, "_");
  const sanitizedMonth = month.replace(/[^a-zA-Z0-9-]/g, "_");
  return path.join(DATA_DIR, `${sanitizedEmail}_${sanitizedMonth}.json`);
}

/**
 * Save data to local file system
 */
export async function saveDataToFile(
  userEmail: string,
  month: string,
  nodes: SankeyNode[],
  parentChildMap: Map,
  metaTotals?: { creditCardPaymentsTotal?: number } | null
): Promise<void> {
  await ensureDataDir();

  const data: StoredData = {
    nodes,
    parentChildMap,
    metaTotals,
    lastUpdated: new Date().toISOString(),
  };

  const filePath = getFilePath(userEmail, month);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`✓ Saved data to ${filePath}`);
}

/**
 * Load data from local file system
 */
export async function loadDataFromFile(
  userEmail: string,
  month: string
): Promise<StoredData | null> {
  timeStart("server-storage", "loadDataFromFile");
  debugLog("server-storage", `🔍 loadDataFromFile called`, { userEmail, month });
  
  const filePath = getFilePath(userEmail, month);
  debugLog("server-storage", `📁 File path: ${filePath}`);

  try {
    debugLog("server-storage", `📖 Reading file from filesystem`);
    const content = await fs.readFile(filePath, "utf-8");
    debugLog("server-storage", `✅ File read successfully`, {
      fileSize: content.length,
      filePath,
    });
    
    debugLog("server-storage", `🔨 Parsing JSON content`);
    const data = JSON.parse(content) as StoredData;
    debugLog("server-storage", `✅ JSON parsed successfully`, {
      nodesCount: data.nodes?.length || 0,
      mapEntriesCount: data.parentChildMap ? Object.keys(data.parentChildMap).length : 0,
      hasMetaTotals: !!data.metaTotals,
      lastUpdated: data.lastUpdated,
    });
    
    timeEnd("server-storage", "loadDataFromFile");
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist
      debugLog("server-storage", `⚠️ File not found (ENOENT)`, { filePath });
      timeEnd("server-storage", "loadDataFromFile");
      return null;
    }
    debugLog("server-storage", `❌ Error loading file`, { error, filePath });
    timeEnd("server-storage", "loadDataFromFile");
    throw error;
  }
}

/**
 * Get all months for a user
 */
export async function getUserMonths(userEmail: string): Promise<string[]> {
  await ensureDataDir();

  const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9@._-]/g, "_");
  const files = await fs.readdir(DATA_DIR);

  const months: string[] = [];
  const prefix = `${sanitizedEmail}_`;

  for (const file of files) {
    if (file.startsWith(prefix) && file.endsWith(".json")) {
      const month = file
        .substring(prefix.length)
        .replace(".json", "")
        .replace(/_/g, "-");
      months.push(month);
    }
  }

  return months;
}

/**
 * Delete data for a user and month
 */
export async function deleteDataFile(
  userEmail: string,
  month: string
): Promise<void> {
  const filePath = getFilePath(userEmail, month);

  try {
    await fs.unlink(filePath);
    console.log(`✓ Deleted data file ${filePath}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * Export all data for a user
 */
export async function exportAllUserData(userEmail: string): Promise<StoredData[]> {
  const months = await getUserMonths(userEmail);
  const allData: StoredData[] = [];

  for (const month of months) {
    const data = await loadDataFromFile(userEmail, month);
    if (data) {
      allData.push(data);
    }
  }

  return allData;
}
