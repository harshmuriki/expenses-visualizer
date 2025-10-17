import { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/components/firebaseConfig";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { processingId } = req.query;

  if (!processingId || typeof processingId !== "string") {
    return res.status(400).json({ error: "Processing ID is required" });
  }

  try {
    const statusDocRef = doc(db, "processing_status", processingId);
    const statusDoc = await getDoc(statusDocRef);

    if (!statusDoc.exists()) {
      return res.status(404).json({ error: "Processing status not found" });
    }

    const statusData = statusDoc.data();

    return res.status(200).json({
      processingId,
      status: statusData.status,
      message: statusData.message,
      result: statusData.result || null,
      error: statusData.error || null,
      timestamp: statusData.timestamp,
      updatedAt: statusData.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching processing status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
