import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import csv from "csv-parser";
import { CSVRow, Map, SankeyNode } from "@/app/types/types";
import { uploadSankeyToFirestore } from "@/lib/firebaseUpload";
import { syncTransactionsForItem } from "@/lib/transactionSync";
import { storeUploadedFile } from "@/lib/fileStorage";
import { Document } from "@/components/process";

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js' default body parsing
  },
};

// Helper function to extract file source from filename
const extractFileSource = (filename: string): string => {
  if (!filename) return "other";

  const lowerFilename = filename.toLowerCase();

  // Common bank/card issuer patterns
  const patterns = [
    { pattern: /amex|american.?express/, source: "amex" },
    { pattern: /capital.?one|capitalone/, source: "capitalone" },
    { pattern: /chase/, source: "chase" },
    { pattern: /bank.?of.?america|bofa/, source: "bankofamerica" },
    { pattern: /wells.?fargo|wells/, source: "wells" },
    { pattern: /discover/, source: "discover" },
    { pattern: /citi|citibank/, source: "citi" },
    { pattern: /us.?bank|usbank/, source: "usbank" },
    { pattern: /pnc/, source: "pnc" },
    { pattern: /truist/, source: "truist" },
    { pattern: /regions/, source: "regions" },
    { pattern: /huntington/, source: "huntington" },
    { pattern: /keybank|key.?bank/, source: "keybank" },
    { pattern: /citizens/, source: "citizens" },
    { pattern: /td.?bank|td/, source: "td" },
    { pattern: /bmo/, source: "bmo" },
    { pattern: /hsbc/, source: "hsbc" },
    { pattern: /barclays/, source: "barclays" },
    { pattern: /synchrony/, source: "synchrony" },
    { pattern: /comenity/, source: "comenity" },
    { pattern: /storecard/, source: "storecard" },
    { pattern: /paypal/, source: "paypal" },
    { pattern: /venmo/, source: "venmo" },
    { pattern: /zelle/, source: "zelle" },
    { pattern: /cashapp|cash.?app/, source: "cashapp" },
    { pattern: /apple.?pay|applepay/, source: "applepay" },
    { pattern: /google.?pay|googlepay/, source: "googlepay" },
    { pattern: /amazon/, source: "amazon" },
    { pattern: /stripe/, source: "stripe" },
    { pattern: /square/, source: "square" },
  ];

  for (const { pattern, source } of patterns) {
    if (pattern.test(lowerFilename)) {
      return source;
    }
  }

  return "other";
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.headers["content-type"]?.includes("application/json")) {
    const payload = await readJsonBody(req);
    if (payload?.source === "aggregator") {
      const { userId, itemId, month } = payload;
      if (
        !userId ||
        typeof userId !== "string" ||
        !itemId ||
        typeof itemId !== "string"
      ) {
        return res
          .status(400)
          .json({ error: "userId and itemId are required" });
      }

      try {
        const result = await syncTransactionsForItem({ userId, itemId, month });
        return res.status(result.success ? 200 : 400).json(result);
      } catch (error) {
        console.error("Aggregator sync failed", error);
        return res
          .status(500)
          .json({ error: "Failed to sync aggregator transactions" });
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
      const uploadedFiles = Array.isArray(files.file)
        ? files.file
        : [files.file];
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const useremail = Array.isArray(fields.useremail)
        ? fields.useremail[0]
        : fields.useremail || "default";
      const month = Array.isArray(fields.month)
        ? fields.month[0]
        : fields.month || "default";
      const storeFile = Array.isArray(fields.storeFile)
        ? fields.storeFile[0] === "true"
        : fields.storeFile === "true";

      // Process multiple files
      const results = [];
      for (const file of uploadedFiles) {
        if (!file) continue;

        if (file.mimetype === "application/pdf") {
          const result = await handlePdfFile(
            file,
            useremail,
            month,
            storeFile,
            res
          );
          results.push(result);
        } else if (file.mimetype === "text/csv") {
          const result = await handleCsvFile(
            file,
            useremail,
            month,
            storeFile,
            res
          );
          results.push(result);
        } else {
          console.warn(
            `Unsupported file type: ${file.mimetype} for file: ${file.originalFilename}`
          );
        }
      }

      if (results.length === 0) {
        return res.status(400).json({ error: "No valid files processed" });
      }

      return res.status(200).json({
        message: `Successfully processed ${results.length} file(s)`,
        results,
      });
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
  storeFile: boolean,
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
    console.log("✅ Lambda processed PDF data");
    const lambdaResponseBody = JSON.parse(lambdaResponseJson.body);

    const output: SankeyNode[] = parseSankeyNodes(lambdaResponseBody.output);
    console.log(`✅ Parsed ${output.length} nodes from Lambda response`);

    const parent_child_map: Map = lambdaResponseBody.parent_child_map;
    const parentChildMap: Map = {};
    for (const [parent, children] of Object.entries(parent_child_map)) {
      parentChildMap[Number(parent)] = children;
    }

    // Store the original file if requested
    if (storeFile && file.originalFilename) {
      try {
        const fileBlob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        const fileObject = new File([fileBlob], file.originalFilename, {
          type: "application/pdf",
        });
        await storeUploadedFile(fileObject, useremail, month);
        console.log("✅ PDF file stored successfully");
      } catch (error) {
        console.error(
          "⚠️ Failed to store PDF file, continuing with upload:",
          error
        );
        // Continue processing even if file storage fails
      }
    }

    // Save to Firestore
    console.log("💾 Saving to Firestore...");
    await uploadSankeyToFirestore({
      nodes: output,
      parentChildMap: parentChildMap,
      useremail,
      month,
    });
    console.log("✅ PDF data processed and saved successfully!");
    res
      .status(200)
      .json({ message: "PDF data processed and categorized by AI ✅" });
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
  storeFile: boolean,
  res: NextApiResponse
) => {
  const results: CSVRow[] = [];
  try {
    const fileStream = fs.createReadStream(file.filepath);

    fileStream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          console.log(`📊 Processing ${results.length} CSV rows...`);

          // Store the original file if requested
          if (storeFile && file.originalFilename) {
            try {
              const csvBytes = fs.readFileSync(file.filepath);
              const fileBlob = new Blob([new Uint8Array(csvBytes)], {
                type: "text/csv",
              });
              const fileObject = new File([fileBlob], file.originalFilename, {
                type: "text/csv",
              });
              await storeUploadedFile(fileObject, useremail, month);
              console.log("✅ CSV file stored successfully");
            } catch (error) {
              console.error(
                "⚠️ Failed to store CSV file, continuing with upload:",
                error
              );
              // Continue processing even if file storage fails
            }
          }

          // Process CSV locally using Document class (not Lambda)
          console.log("🤖 Processing CSV with AI categorization...");

          // Extract file source from filename
          const fileSource = extractFileSource(file.originalFilename || "");
          console.log(
            `📁 File source detected: ${fileSource} from filename: ${file.originalFilename}`
          );

          // Load parent tags from file
          const parentTagsPath = path.join(
            process.cwd(),
            "scripts",
            "parenttags.txt"
          );
          const parentTags = fs.readFileSync(parentTagsPath, "utf-8");
          const parentTagsArray = parentTags
            .split("\n")
            .filter((tag) => tag.trim() !== "");

          const document = new Document(
            results,
            [],
            null,
            parentTagsArray,
            fileSource
          );
          await document.convertDocToItems();
          const { output, parentChildMap } = document.convertData();

          console.log(
            `✅ Processed ${output.nodes.length} nodes with AI categorization`
          );

          // Convert to SankeyNode format
          const sankeyNodes: SankeyNode[] = output.nodes.map((node) => ({
            name: node.name,
            index: node.index,
            cost: node.cost || 0,
            visible: true,
            date: node.date,
            location: node.location,
            file_source: node.file_source,
          }));

          // Save to Firestore
          console.log("💾 Saving to Firestore...");
          await uploadSankeyToFirestore({
            nodes: sankeyNodes,
            parentChildMap: parentChildMap as Map,
            useremail,
            month,
          });

          console.log("✅ CSV data processed and saved successfully!");
          res
            .status(200)
            .json({ message: "CSV data processed and categorized by AI ✅" });
        } catch (error) {
          console.error("❌ Error processing CSV data:", error);
          res.status(500).json({ error: "Failed to process CSV file" });
        }
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

const readJsonBody = async (
  req: NextApiRequest
): Promise<Record<string, unknown>> => {
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
