import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import csv from "csv-parser";
import { CSVRow, Map, SankeyNode } from "@/app/types/types";
import { uploadSankeyToFirestore } from "@/lib/firebaseUpload";
import { syncTransactionsForItem } from "@/lib/transactionSync";

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js' default body parsing
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers["content-type"]?.includes("application/json")) {
    const payload = await readJsonBody(req);
    if (payload?.source === "aggregator") {
      const { userId, itemId, month } = payload;
      if (!userId || typeof userId !== "string" || !itemId || typeof itemId !== "string") {
        return res.status(400).json({ error: "userId and itemId are required" });
      }

      try {
        const result = await syncTransactionsForItem({ userId, itemId, month });
        return res.status(result.success ? 200 : 400).json(result);
      } catch (error) {
        console.error("Aggregator sync failed", error);
        return res.status(500).json({ error: "Failed to sync aggregator transactions" });
      }
    }

    return res.status(400).json({ error: "Unsupported JSON payload" });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const formidable = require("formidable");
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const useremail = Array.isArray(fields.useremail)
        ? fields.useremail[0]
        : fields.useremail || "default";
      const month = Array.isArray(fields.month)
        ? fields.month[0]
        : fields.month || "default";

      if (file.mimetype === "application/pdf") {
        await handlePdfFile(file, useremail, month, res);
      } else if (file.mimetype === "text/csv") {
        await handleCsvFile(file, useremail, month, res);
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

const handlePdfFile = async (
  file: formidable.File,
  useremail: string,
  month: string,
  res: NextApiResponse
) => {
  try {
    const pdfBytes = fs.readFileSync(file.filepath);
    const base64Pdf = pdfBytes.toString("base64");

    const lambdaEndpoint = process.env.AWS_LAMBDA_ENDPOINT;
    if (!lambdaEndpoint) {
      throw new Error("AWS_LAMBDA_ENDPOINT is not defined");
    }

    const lambdaResponse = await fetch(lambdaEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isBase64Encoded: true,
        body: base64Pdf,
      }),
    });

    if (!lambdaResponse.ok) {
      const errorMessage = await lambdaResponse.text();
      console.error("Lambda error:", errorMessage);
      throw new Error("Failed to process file in Lambda");
    }

    const lambdaResponseJson = await lambdaResponse.json();
    // console.log("Lambda response:", lambdaResponseJson);
    const lambdaResponseBody = JSON.parse(lambdaResponseJson.body);

    const output: SankeyNode[] = parseSankeyNodes(lambdaResponseBody.output);

    const parent_child_map: Map = lambdaResponseBody.parent_child_map;
    const parentChildMap: Map = {};
    for (const [parent, children] of Object.entries(parent_child_map)) {
      parentChildMap[parent] = children;
    }

    // await uploadDataToFirebase(output, parent_child_map, useremail, month);
    await uploadSankeyToFirestore({
      nodes: output,
      parentChildMap: parentChildMap,
      useremail,
      month,
    });
    res.status(200).json({ message: "PDF data processed successfully" });
  } catch (error) {
    console.error("Error handling PDF file:", error);
    res.status(500).json({ error: "Error processing PDF file" });
  }
};

const parseSankeyNodes = (
  output: { name: string; index: number; cost?: number }[]
): SankeyNode[] => {
  return Array.isArray(output)
    ? output.map((item: { name: string; index: number; cost?: number }) => ({
        name: item.name,
        index: item.index,
        cost: item.cost || 0,
        visible: true,
      }))
    : [];
};

const handleCsvFile = async (
  file: formidable.File,
  useremail: string,
  month: string,
  res: NextApiResponse
) => {
  const results: CSVRow[] = [];
  try {
    const fileStream = fs.createReadStream(file.filepath);

    fileStream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        // Process CSV rows here
        // const processedData = processCsvData();
        // await uploadDataToFirebase(processedData, useremail, month);
        res.status(200).json({ message: "CSV data processed successfully" });
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error);
        res.status(500).json({ error: "Error processing CSV file" });
      });
  } catch (error) {
    console.error("Error handling CSV file:", error);
    res.status(500).json({ error: "Error processing CSV file" });
  }
};

const readJsonBody = async (req: NextApiRequest): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => resolve());
    req.on("error", (err) => reject(err));
  });

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    console.error("Failed to parse JSON body", error);
    return {};
  }
};

export default handler;
