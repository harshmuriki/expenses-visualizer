import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import csv from "csv-parser";
import { uploadTransactionsInBatch } from "@/components/sendDataFirebase";
import { CSVRow, Map, SankeyNode } from "@/app/types/types";

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js' default body parsing
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
    await processAndUploadData(
      { nodes: output, parentChildMap: parentChildMap },
      parentChildMap,
      useremail,
      month,
      res
    );
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

// const processCsvData = (): { nodes: SankeyNode[]; parentChildMap: Map } => {
//   // Implement CSV processing logic here
//   return { nodes: [], parentChildMap: {} };
// };

// const uploadDataToFirebase = async (
//   nodes: SankeyNode[],
//   parentChildMap: Map,
//   useremail: string,
//   month: string
// ) => {
//   try {
//     console.log("Uploading data to Firebase:", nodes, parentChildMap);
//     const batchData = [];

//     // Prepare batch upload data for Firebase
//     nodes.forEach((node) => {
//       const isLeaf =
//         !parentChildMap.hasOwnProperty(node.index) && node.index !== 0;
//       batchData.push({
//         useremail,
//         month,
//         transaction: node.name,
//         index: node.index,
//         cost: node.cost || 0,
//         isleaf: isLeaf,
//         isMap: false,
//         key: null,
//         values: null,
//         visible: true,
//       });
//     });

//     for (const [key, values] of Object.entries(parentChildMap)) {
//       console.log("Sending data to firebase key:", key, "Values:", values);
//       batchData.push({
//         useremail,
//         month,
//         transaction: null,
//         index: null,
//         cost: null,
//         isleaf: null,
//         isMap: true,
//         key,
//         values,
//         visible: true,
//       });
//     }

//     await uploadTransactionsInBatch(batchData);
//   } catch (error) {
//     console.error("Error uploading data to Firebase:", error);
//     throw new Error("Failed to upload data");
//   }
// };

const processAndUploadData = async (
  processedData: { nodes: SankeyNode[]; parentChildMap: Map },
  parentChildMap: Map,
  useremail: string,
  month: string,
  res: NextApiResponse
) => {
  try {
    // Prepare batch data for nodes and parent-child maps
    const batchData = [];

    // Prepare nodes for batch upload
    for (const node of processedData.nodes) {
      const isLeaf =
        node.index === 0 ? false : !parentChildMap.hasOwnProperty(node.index);
      batchData.push({
        useremail: useremail,
        month: month,
        transaction: node.name,
        index: node.index,
        cost: node.cost || 0,
        isleaf: isLeaf,
        isMap: false,
        key: null,
        values: null,
        visible: true,
      });
    }

    // Prepare parent-child map for batch upload
    for (const [key, values] of Object.entries(parentChildMap)) {
      batchData.push({
        useremail: useremail,
        month: month,
        transaction: null,
        index: null,
        cost: null,
        isleaf: null,
        isMap: true,
        key: key,
        values: values,
        visible: true,
      });
    }

    // Upload all data in a single batch
    await uploadTransactionsInBatch(batchData);

    res
      .status(200)
      .json({ message: "Data processed successfully", success: true });
  } catch (error) {
    console.error("Error processing and uploading data:", error);
    res.status(500).json({ error: "Error processing and uploading data" });
  }
};

export default handler;
