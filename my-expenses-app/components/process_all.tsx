// Import necessary modules
import * as fs from "fs";
// import * as path from "path";
import * as dotenv from "dotenv";
// import * as csv from "csv-parser";
import axios, { AxiosResponse } from "axios";
import {
  EnvConfig,
  CSVRow,
  OpenAICompletionResponse,
  OutputNode,
  HierarchicalData,
} from "@/app/types/types";
import path from "path";

// Load environment variables
dotenv.config();
// import OpenAI from "openai";

// Define the Item class
class Item {
  name: string | null;
  cost: number | null;
  index: string | number | null;
  parenttag: string | null;
  raw_str: string | null;
  alltags: string[] | null;
  allparenttags: string[] | null;

  constructor(
    name: string | null = null,
    price: number | null = null,
    index: string | number | null = null,
    parenttag: string | null = null,
    raw_str: string | null = null,
    alltags: string[] | null = null,
    allparenttags: string[] | null = null
  ) {
    this.name = name;
    this.cost = price;
    this.index = index;
    this.parenttag = parenttag;
    this.raw_str = raw_str;
    this.alltags = alltags;
    this.allparenttags = allparenttags;
  }

  isValid(): boolean {
    return (
      typeof this.name === "string" &&
      this.name.trim() !== "" &&
      typeof this.cost === "number" &&
      this.cost >= 0 &&
      (typeof this.index === "string" || typeof this.index === "number") &&
      String(this.index).trim() !== "" &&
      typeof this.parenttag === "string" &&
      this.parenttag.trim() !== ""
    );
  }

  async setDetails(): Promise<void> {
    const tagPrompt = `
            Here is a single transaction record:

            ${this.raw_str}

            From this record, extract the following details and return them in the exact format shown:
            The name should be a concise version of what the transaction should be
            Choose the parent tags from this list: ${this.allparenttags}
            Choose the best parent tag for this particular transaction
            name: <item name>
            cost: <item price>
            index: <index of the transaction or the parent tag>
            parenttag: <broader category from the parent tag list given>
        `;

    const completion: OpenAICompletionResponse = await this.runOpenAI(
      tagPrompt
    );

    const content = completion.choices[0].message.content;

    const lines = content.trim().split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();

      if (trimmedLine.startsWith("name:")) {
        this.name = line.split(":", 2)[1].trim();
      } else if (trimmedLine.startsWith("cost:")) {
        const priceStr = line.split(":", 2)[1].trim();
        this.cost = parseFloat(priceStr) || null;
      } else if (trimmedLine.startsWith("index:")) {
        this.index = line.split(":", 2)[1].trim();
      } else if (trimmedLine.startsWith("parenttag:")) {
        this.parenttag = line.split(":", 2)[1].trim();
      }
    }
  }

  async runOpenAI(prompt: string): Promise<OpenAICompletionResponse> {
    const envConfig: EnvConfig = process.env as unknown as EnvConfig;
    const apiKey = envConfig.OPENAI_KEY || "";
    if (!apiKey) {
      throw new Error("Missing OPENAI_KEY environment variable");
    }

    const response: AxiosResponse<OpenAICompletionResponse> = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }
}

// Define the Document class
export class Document {
  document: CSVRow[] | null;
  items: Item[];
  alltags: string[] | null;
  allparenttags: string[] | null;
  rawData: string | null;
  pdf: boolean = false;

  constructor(
    document: CSVRow[] | [] = [],
    items: Item[] = [],
    alltags: string[] | null = null,
    allparenttags: string[] | null = null,
    rawData: string | null = null,
    pdf: boolean = false
  ) {
    this.document = document;
    this.items = items;
    this.alltags = alltags;
    this.allparenttags = allparenttags;
    this.rawData = rawData;
    this.pdf = pdf;
  }

  async convertPdfToItems(): Promise<CSVRow[]> {
    const tagPrompt = `
        Convert the following raw credit card statement data into a valid JSON array. Don't add any token like '''json or anything like that
        Extract the following details and return them in the exact format shown

        1. **Name**: The name should be a concise version of what the transaction should be
        1. **Date**: The transaction date in the format 'MM/DD/YYYY'.
        2. **Raw Transaction**: The raw transaction as it appears in the statement. 
        3. **cost**: The transaction amount. Use a positive number for charges and a negative number for credits.
        4. **index**: The index of the transaction or the parent tag
        5. **parenttag**: Choose the parent tags from this list: ${this.allparenttags}. The broader category from the parent tag list given. Choose the best parent tag for each transaction separately.
        
        ### Output Format:

        [
            {"name": <item name>
            "date": <transaction date>
            "cost": <item price>
            "raw_str": <raw transaction>
            "index": <index of the transaction or the parent tag>
            "parenttag": <broader category from the parent tag list given>}
        ]
    `;

    try {
      const completion: OpenAICompletionResponse = await this.runOpenAI(
        tagPrompt
      );
      const content = completion.choices[0].message.content.trim();

      const lines = content.trim().split("\n");
      let temp_transaction: Item;

      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();

        temp_transaction = new Item();

        if (trimmedLine.startsWith("name:")) {
          temp_transaction.name = line.split(":", 2)[1].trim();
        } else if (trimmedLine.startsWith("cost:")) {
          const priceStr = line.split(":", 2)[1].trim();
          temp_transaction.cost = parseFloat(priceStr) || null;
        } else if (trimmedLine.startsWith("index:")) {
          temp_transaction.index = line.split(":", 2)[1].trim();
        } else if (trimmedLine.startsWith("parenttag:")) {
          temp_transaction.parenttag = line.split(":", 2)[1].trim();
        }
      }

      // Validate and parse the JSON output
      let transactions: CSVRow[];
      try {
        transactions = JSON.parse(content);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Invalid JSON response: ${error.message}`);
        } else {
          throw new Error("Invalid JSON response");
        }
      }

      this.document = transactions;

      return transactions;
    } catch (error) {
      console.error("Error converting PDF to CSV row:", error);
      throw error;
    }
  }

  async convertDocToAllItems(): Promise<void> {
    if (this.pdf) {
      console.log("Converting PDF to CSV row");
      await this.convertPdfToCSVRow();
    }

    if (!this.document) {
      throw new Error("Document is null");
    }

    // Instead of sending individually, send all at once to OpenAI?
    for (const row of this.document) {
      const rawStr = JSON.stringify(row);
      const tempItem = new Item(
        null,
        null,
        null,
        null,
        rawStr,
        this.alltags,
        this.allparenttags
      );
      await tempItem.setDetails();
      if (tempItem.isValid()) {
        this.items.push(tempItem);
        console.log(tempItem);
      }
    }
  }

  convertData(): HierarchicalData {
    const output = { nodes: [] as OutputNode[] };
    const parentTagsMap: { [key: string]: number } = {};
    const parentChildMap: { [key: number]: number[] } = {};
    let currentIndex = 0;

    // Add root "Expenses" node
    output.nodes.push({ name: "Expenses", index: currentIndex });
    currentIndex++;

    for (const item of this.items) {
      if (item.parenttag && !(item.parenttag in parentTagsMap)) {
        parentTagsMap[item.parenttag] = currentIndex;
        output.nodes.push({ name: item.parenttag, index: currentIndex });
        parentChildMap[currentIndex] = [];
        currentIndex++;
      }

      const transactionIndex = currentIndex;
      output.nodes.push({
        name: item.name ?? "Untitled",
        cost: item.cost ?? 1,
        index: transactionIndex,
      });

      const parentIndex = parentTagsMap[item.parenttag!];
      if (!parentChildMap[parentIndex]) {
        parentChildMap[parentIndex] = [];
      }
      parentChildMap[parentIndex].push(transactionIndex);

      currentIndex++;
    }

    const tempFilePath = path.join("/tmp", "output.json");

    fs.writeFileSync(tempFilePath, JSON.stringify(output, null, 4));
    // fs.writeFileSync(
    //   "parent_child_map.json",
    //   JSON.stringify(parentChildMap, null, 4)
    // );

    console.log("output", output);
    console.log("parentChildMap", parentChildMap);

    // console.log(
    //   "Data successfully written to 'output.json' and 'parent_child_map.json'"
    // );

    return { output, parentChildMap };
  }

  async runOpenAI(prompt: string): Promise<OpenAICompletionResponse> {
    const envConfig: EnvConfig = process.env as unknown as EnvConfig;
    const apiKey = envConfig.OPENAI_KEY || "";
    if (!apiKey) {
      throw new Error("Missing OPENAI_KEY environment variable");
    }

    const response: AxiosResponse<OpenAICompletionResponse> = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }
}
