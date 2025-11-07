import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { listUserItems } from "@/lib/secureStore";

interface ConnectedAccount {
  itemId: string;
  institution?: string | null;
  createdAt: string;
  updatedAt: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate user
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.email;
    const items = await listUserItems(userId);

    const accounts: ConnectedAccount[] = items.map((item) => ({
      itemId: item.itemId,
      institution: item.institution,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return res.status(200).json({ accounts });
  } catch (error) {
    console.error("Failed to list accounts", error);
    return res.status(500).json({ error: "Unable to list accounts" });
  }
};

export default handler;
