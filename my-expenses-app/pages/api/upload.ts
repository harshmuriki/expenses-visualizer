// import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
// import path from "path";
import csv from "csv-parser";
// import { Document } from "@/components/process";
import uploadTransaction from "@/components/sendDataFirebase";
import {
  //   data0,
  //   parentChildMap_data0,
  parentChildMap_testdatamini,
  testdatamini,
} from "@/data/testData";
import { Fields, Files } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const formidable = require("formidable");

    const form = new formidable.IncomingForm();

    form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        return res.status(500).json({ error: "File upload failed" });
      }

      const month =
        Array.isArray(fields?.month) && fields.month.length > 0
          ? fields.month[0]
          : "default";

      const file =
        Array.isArray(files.file) && files.file.length > 0
          ? files.file[0]
          : null;

      if (!file) {
        console.log("error??", file);
        return res.status(400).json({ error: "No file uploaded" });
      }

      const results = [];

      // Read the file stream directly
      const fileStream = fs.createReadStream(file.filepath);

      fileStream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          //   const allparenttags = parentTags;

          //   const doc = new Document(results, allparenttags);
          //   await doc.convertDocToItems();
          //   const { nodes, parentChildMap } = doc.convertData();
          //   processedData = { nodes: output.nodes, parentChildMap };

          const nodes = testdatamini.nodes;
          const parentChildMap = parentChildMap_testdatamini;

          console.log("processed data");

          // Send the nodes to firebase
          for (const node of nodes) {
            console.log("node", node);
            const isLeaf =
              node.index === 0
                ? false
                : !parentChildMap.hasOwnProperty(node.index);
            await uploadTransaction({
              month: month,
              transaction: node.name,
              index: node.index,
              isleaf: isLeaf,
              cost: node.cost || 100,
              isMap: false,
              key: null,
              values: null,
              visible: true,
            });
          }

          // Send the map to Firebase
          for (const [key, values] of Object.entries(parentChildMap)) {
            console.log("map", { key, values });
            await uploadTransaction({
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

          res
            .status(200)
            .json({ message: "Data processed successfully", success: true });
        })
        .on("error", () => {
          res.status(500).json({ error: "Error processing CSV file" });
        });
    });
  } catch (error) {
    console.error("Error in /api/upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
