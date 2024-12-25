import formidable from "formidable";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Document } from "@/components/process";
import { parentTags } from "@/data/testData";

let processedData = { nodes: [], parentChildMap: {} }; // In-memory storage

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const formidable = require("formidable");
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "File upload failed" });
      }

      const file = files.file[0]; // Access the first element of the array
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const results = [];

      // Read the file stream directly
      const fileStream = fs.createReadStream(file.filepath || file.path);

      fileStream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          const allparenttags = parentTags;

          const doc = new Document(results, allparenttags);
          await doc.convertDocToItems();
          const { output, parentChildMap } = doc.convertData();
          processedData = { nodes: output.nodes, parentChildMap };

          console.log("processed data");
          console.log("processed data", processedData);

        //   Send the data to firebase

          res
            .status(200)
            .json({ message: "Data processed successfully", success: true });
        })
        .on("error", (error) => {
          res.status(500).json({ error: "Error processing CSV file" });
        });
    });
  } catch (error) {
    console.error("Error in /api/upload:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// Export the processed data for access by other routes
export const getProcessedData = () => processedData;

export default handler;
