import { NextApiRequest, NextApiResponse } from "next";
import { loadDataFromFile } from "@/lib/serverLocalStorage";

/**
 * API endpoint to fetch local data from server-side files
 * Used when browser IndexedDB is empty but server has data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userEmail, month } = req.query;

  if (!userEmail || !month || typeof userEmail !== "string" || typeof month !== "string") {
    return res.status(400).json({ error: "userEmail and month are required" });
  }

  try {
    console.log(`[api/local-data] Fetching data from server files`, { userEmail, month });
    const data = await loadDataFromFile(userEmail, month);

    if (!data) {
      console.log(`[api/local-data] No data found for ${userEmail}/${month}`);
      return res.status(404).json({ error: "Data not found" });
    }

    console.log(`[api/local-data] Data found`, {
      nodesCount: data.nodes.length,
      mapEntriesCount: Object.keys(data.parentChildMap).length,
    });

    return res.status(200).json({
      nodes: data.nodes,
      parentChildMap: data.parentChildMap,
      metaTotals: data.metaTotals,
    });
  } catch (error) {
    console.error("[api/local-data] Error loading data:", error);
    return res.status(500).json({ error: "Failed to load data" });
  }
}

