import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { DEBUG_ENABLED } from "@/lib/debug";
import formidable, { Fields, Files } from "formidable";
import csv from "csv-parser";
import { CSVRow, Map, SankeyNode } from "@/app/types/types";
import { uploadSankeyToFirestore } from "@/lib/firebaseUpload";
import { syncTransactionsForItem } from "@/lib/transactionSync";
// import { storeUploadedFile } from "@/lib/fileStorage";
import { Document } from "@/components/process";
import { OpenAI } from "openai";

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js' default body parsing
  },
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
});

// Helper function to get bank name using OpenAI
const getBankNameFromFilename = async (filename: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `From this filename, extract the bank or financial institution name. Return ONLY the bank name, nothing else.
          
Filename: ${filename}

Common banks include: Chase, Bank of America, Wells Fargo, Capital One, Citi, American Express, Discover, etc.
If you cannot determine a specific bank, return "Unknown Bank".`,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const bankName =
      completion.choices[0]?.message?.content?.trim() || "Unknown Bank";
    console.log(
      `🏦 AI detected bank: "${bankName}" from filename: ${filename}`
    );
    return bankName;
  } catch (error) {
    console.error("Error getting bank name from OpenAI:", error);
    return "Unknown Bank";
  }
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
        const result = await syncTransactionsForItem({
          userId,
          itemId,
          month: typeof month === "string" ? month : undefined,
        });
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
      if (DEBUG_ENABLED) console.time("api-upload-total");
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
      // const storeFile = Array.isArray(fields.storeFile)
      //   ? fields.storeFile[0] === "true"
      //   : fields.storeFile === "true";

      // Only process CSV files
      const csvFiles = uploadedFiles.filter(
        (f): f is formidable.File =>
          f !== undefined && f.mimetype === "text/csv"
      );

      if (csvFiles.length === 0) {
        return res.status(400).json({
          error: "No CSV files uploaded. Please upload CSV files only.",
        });
      }

      // Warn about non-CSV files
      const nonCsvFiles = uploadedFiles.filter(
        (f) => f && f.mimetype !== "text/csv"
      );
      if (nonCsvFiles.length > 0) {
        console.warn(`⚠️ Ignoring ${nonCsvFiles.length} non-CSV file(s)`);
      }

      // OPTION A: Process synchronously in this request
      if (DEBUG_ENABLED)
        console.log("[api/upload] synchronous processing start", {
          files: csvFiles.length,
          month,
          useremail,
        });
      const result = await handleCombinedCsvFiles(csvFiles, useremail, month);
      const json = { status: "completed", result };
      if (DEBUG_ENABLED)
        console.log("[api/upload] synchronous processing done", json);
      if (DEBUG_ENABLED) console.timeEnd("api-upload-total");
      return res.status(200).json(json);
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

// Async processing function that runs in background
// const processCsvFilesAsync = async (
//   files: formidable.File[],
//   useremail: string,
//   month: string,
//   processingId: string
// ) => {
//   try {
//     if (DEBUG_ENABLED) console.time(`[processCsvFilesAsync] ${processingId}`);
//     if (DEBUG_ENABLED)
//       console.log("[process] start", {
//         files: files.length,
//         useremail,
//         month,
//         processingId,
//       });

//     // Update status to processing
//     await updateProcessingStatus(
//       processingId,
//       "processing",
//       "Processing CSV files..."
//     );

//     const result = await handleCombinedCsvFiles(files, useremail, month);

//     // Update status to completed
//     await updateProcessingStatus(
//       processingId,
//       "completed",
//       "Processing completed successfully!",
//       result
//     );

//     if (DEBUG_ENABLED) console.log("[process] completed", { processingId });
//     if (DEBUG_ENABLED)
//       console.timeEnd(`[processCsvFilesAsync] ${processingId}`);
//   } catch (error) {
//     console.error(`❌ Async processing failed for ${processingId}:`, error);

//     // Update status to failed
//     await updateProcessingStatus(
//       processingId,
//       "failed",
//       "Processing failed",
//       null,
//       error instanceof Error ? error.message : "Unknown error"
//     );
//   }
// };

// Function to update processing status in Firestore
// const updateProcessingStatus = async (
//   processingId: string,
//   status: "processing" | "completed" | "failed",
//   message: string,
//   result?: Record<string, unknown>,
//   error?: string
// ) => {
//   try {
//     const { doc, setDoc } = await import("firebase/firestore");
//     const { db } = await import("@/components/firebaseConfig");

//     const statusDocRef = doc(db, "processing_status", processingId);

//     // Build the document data, excluding undefined values
//     const docData: Record<string, unknown> = {
//       status,
//       message,
//       timestamp: new Date().toISOString(),
//       updatedAt: Date.now(),
//     };

//     // Only add result and error if they are defined
//     if (result !== undefined) {
//       docData.result = result;
//     }
//     if (error !== undefined) {
//       docData.error = error;
//     }

//     await setDoc(statusDocRef, docData);
//   } catch (error) {
//     console.error("Failed to update processing status:", error);
//   }
// };

// New function to handle combined CSV files
const handleCombinedCsvFiles = async (
  files: formidable.File[],
  useremail: string,
  month: string
  // _storeFile: boolean
) => {
  try {
    // Step 1: Read all CSV files and get bank names
    const allRows: Array<CSVRow & { Bank: string }> = [];

    for (const file of files) {
      // Get bank name from filename using AI
      const bankName = await getBankNameFromFilename(
        file.originalFilename || ""
      );

      // Read CSV file
      const fileRows: CSVRow[] = await new Promise((resolve, reject) => {
        const rows: CSVRow[] = [];
        fs.createReadStream(file.filepath)
          .pipe(csv())
          .on("data", (data) => rows.push(data))
          .on("end", () => resolve(rows))
          .on("error", (error) => reject(error));
      });

      // Add Bank column to each row
      const rowsWithBank = fileRows.map((row) => ({
        ...row,
        Bank: bankName,
      }));

      allRows.push(...rowsWithBank);
      if (DEBUG_ENABLED)
        console.log("[ai] rows loaded", {
          file: file.originalFilename,
          rows: fileRows.length,
          bankName,
        });

      // // Store original file if requested
      // if (storeFile && file.originalFilename) {
      //   try {
      //     const csvBytes = fs.readFileSync(file.filepath);
      //     const fileBlob = new Blob([new Uint8Array(csvBytes)], {
      //       type: "text/csv",
      //     });
      //     const fileObject = new File([fileBlob], file.originalFilename, {
      //       type: "text/csv",
      //     });
      //     await storeUploadedFile(fileObject, useremail, month);
      //     console.log(`✅ Stored ${file.originalFilename}`);
      //   } catch (error) {
      //     console.error(`⚠️ Failed to store ${file.originalFilename}:`, error);
      //   }
      // }
    }

    if (DEBUG_ENABLED)
      console.log("[ai] combined total", {
        rows: allRows.length,
        files: files.length,
      });

    // Step 2: Process combined data with AI
    const parentTagsPath = path.join(
      process.cwd(),
      "scripts",
      "parenttags.txt"
    );
    const parentTags = fs.readFileSync(parentTagsPath, "utf-8");
    const parentTagsArray = parentTags
      .split("\n")
      .filter((tag) => tag.trim() !== "");
    if (!parentTagsArray.includes("Credit Card Payments")) {
      parentTagsArray.push("Credit Card Payments");
    }

    if (DEBUG_ENABLED) console.time("ai-categorization");

    const document = new Document(
      allRows,
      [],
      null,
      parentTagsArray,
      "combined" // file_source for combined data
    );

    await document.convertDocToItems();
    const { output, parentChildMap } = document.convertData();
    if (DEBUG_ENABLED) console.timeEnd("ai-categorization");

    // Exclude credit card payments from saved nodes, but keep a meta total
    const creditCardCategoryNames = new Set([
      "Credit Card Payments",
      "Credit Card Payment",
    ]);
    const creditCardCategoryIndex = output.nodes.find((n) =>
      n && typeof n.index === "number" && typeof n.name === "string"
        ? creditCardCategoryNames.has(n.name)
        : false
    )?.index as number | undefined;

    let excludedChildIndexes = new Set<number>();
    let creditCardPaymentsTotal = 0;
    if (
      typeof creditCardCategoryIndex === "number" &&
      parentChildMap &&
      (parentChildMap as Record<number, number[]>)[creditCardCategoryIndex]
    ) {
      const childIdxs = (parentChildMap as Record<number, number[]>)[
        creditCardCategoryIndex
      ] as number[];
      excludedChildIndexes = new Set(childIdxs);
      for (const idx of childIdxs) {
        const node = output.nodes.find((n) => n.index === idx);
        if (node && typeof node.cost === "number") {
          creditCardPaymentsTotal += Math.max(0, node.cost);
        }
      }
      delete (parentChildMap as Record<number, number[]>)[
        creditCardCategoryIndex
      ];
    }

    const filteredNodes = output.nodes.filter((n) => {
      if (!n) return false;
      if (
        typeof creditCardCategoryIndex === "number" &&
        n.index === creditCardCategoryIndex
      ) {
        return false;
      }
      if (excludedChildIndexes.size > 0 && excludedChildIndexes.has(n.index)) {
        return false;
      }
      return true;
    });

    if (DEBUG_ENABLED)
      console.log("[ai] processed nodes", {
        totalNodes: output.nodes.length,
        inputRows: allRows.length,
        validItems: document.items.length,
      });

    // Convert to SankeyNode format
    const sankeyNodes: SankeyNode[] = filteredNodes.map((node) => ({
      name: node.name,
      index: node.index,
      cost: node.cost || 0,
      visible: true,
      date: node.date,
      location: node.location,
      file_source: node.file_source,
      bank: node.bank,
    }));

    // Save to Firestore
    if (DEBUG_ENABLED) console.time("firestore-save");
    await uploadSankeyToFirestore({
      nodes: sankeyNodes,
      parentChildMap: parentChildMap as Map,
      useremail,
      month,
    });
    if (DEBUG_ENABLED) console.timeEnd("firestore-save");

    // Save meta totals for insights
    try {
      const { doc, collection, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/components/firebaseConfig");
      const userDocRef = doc(db, "users", useremail);
      const monthCollectionRef = collection(userDocRef, month);
      const metaDocRef = doc(monthCollectionRef, "meta");
      await setDoc(
        metaDocRef,
        { creditCardPaymentsTotal: creditCardPaymentsTotal || 0 },
        { merge: true }
      );
    } catch (e) {
      console.error("Failed saving meta totals:", e);
    }

    if (DEBUG_ENABLED) console.log("[save] completed");

    return {
      totalRows: allRows.length,
      totalFiles: files.length,
      totalNodes: output.nodes.length,
    };
  } catch (error) {
    console.error("Error handling combined CSV files:", error);
    throw error;
  }
};

// const parseSankeyNodes = (
//   output: { name: string; index: number; cost?: number }[]
// ): SankeyNode[] => {
//   return Array.isArray(output)
//     ? output.map((item: { name: string; index: number; cost?: number }) => ({
//         name: item.name,
//         index: item.index,
//         cost: item.cost || 0,
//         visible: true,
//       }))
//     : [];
// };

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
