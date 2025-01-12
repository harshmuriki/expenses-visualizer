import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import csv from "csv-parser";
import pdfParse from "pdf-parse";
import { Document } from "@/components/process";
import uploadTransaction from "@/components/sendDataFirebase";
import { parentChildMap_testdatamini, testdatamini } from "@/data/testData";
import { Fields, Files } from "formidable";
import { parentTags } from "@/components/variables";
import { CSVRow, Map, SankeyNode } from "@/app/types/types";

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
      const useremail =
        Array.isArray(fields.useremail) && fields.useremail.length > 0
          ? fields.useremail[0]
          : "default";

      if (!file) {
        console.log("error??", file);
        return res.status(400).json({ error: "No file uploaded" });
      }

      const results: CSVRow[] = [];
      const fileStream = fs.createReadStream(file.filepath);
      const test = process.env.NEXT_PUBLIC_TEST_KEY == "true";
      let processedData: { nodes: SankeyNode[]; parentChildMap: Map };
      let parentChildMap: Map;

      if (file.mimetype === "text/csv") {
        fileStream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", async () => {
            const allparenttags = parentTags;
            console.log("results", results);
            const doc = new Document(results, allparenttags);
            await doc.convertDocToItems();

            if (test) {
              processedData = testdatamini;
              parentChildMap = parentChildMap_testdatamini;
            } else {
              const { output, parentChildMap: convertedParentChildMap } =
                doc.convertData();
              processedData = {
                nodes: output.nodes,
                parentChildMap: convertedParentChildMap,
              };
              parentChildMap = convertedParentChildMap;
            }

            await processAndUploadData(
              processedData,
              parentChildMap,
              useremail,
              month,
              res
            );
          })
          .on("error", () => {
            res.status(500).json({ error: "Error processing CSV file" });
          });
      } else if (file.mimetype === "application/pdf") {
        console.log("PDF file uploaded");

        const pdfBytes = fs.readFileSync(file.filepath);
        let text = "";

        const data = await pdfParse(pdfBytes);

        text = data.text;
        const allparenttags = parentTags;
        const doc = new Document(null, [], null, allparenttags, text, true);
        await doc.convertDocToItems();

        if (test) {
          processedData = testdatamini;
          parentChildMap = parentChildMap_testdatamini;
        } else {
          const { output, parentChildMap: convertedParentChildMap } =
            doc.convertData();
          processedData = {
            nodes: output.nodes,
            parentChildMap: convertedParentChildMap,
          };
          parentChildMap = convertedParentChildMap;
        }

        await processAndUploadData(
          processedData,
          parentChildMap,
          useremail,
          month,
          res
        );
      } else {
        res.status(400).json({ error: "Unsupported file type" });
      }
    });
  } catch (error) {
    console.error("Error in /api/upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const processAndUploadData = async (
  processedData: { nodes: SankeyNode[]; parentChildMap: Map },
  parentChildMap: Map,
  useremail: string,
  month: string,
  res: NextApiResponse
) => {
  try {
    // Send the nodes to firebase
    for (const node of processedData.nodes) {
      const isLeaf =
        node.index === 0 ? false : !parentChildMap.hasOwnProperty(node.index);
      await uploadTransaction({
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

    // Send the map to Firebase
    for (const [key, values] of Object.entries(parentChildMap)) {
      await uploadTransaction({
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

    res
      .status(200)
      .json({ message: "Data processed successfully", success: true });
  } catch (error) {
    console.error("Error processing and uploading data:", error);
    res.status(500).json({ error: "Error processing and uploading data" });
  }
};

export default handler;
