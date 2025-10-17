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
  AggregatorTransaction,
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
  date: string | null;
  location: string | null;
  file_source: string | null;
  bank: string | null;

  constructor(
    name: string | null = null,
    price: number | null = null,
    index: string | number | null = null,
    parenttag: string | null = null,
    raw_str: string | null = null,
    alltags: string[] | null = null,
    allparenttags: string[] | null = null,
    date: string | null = null,
    location: string | null = null,
    file_source: string | null = null,
    bank: string | null = null
  ) {
    this.name = name;
    this.cost = price;
    this.index = index;
    this.parenttag = parenttag;
    this.raw_str = raw_str;
    this.alltags = alltags;
    this.allparenttags = allparenttags;
    this.date = date;
    this.location = location;
    this.file_source = file_source;
    this.bank = bank;
  }

  isValid(): boolean {
    const checks = {
      hasName: typeof this.name === "string" && this.name.trim() !== "",
      hasCost:
        typeof this.cost === "number" && !isNaN(this.cost) && this.cost >= 0,
      hasIndex:
        (typeof this.index === "string" || typeof this.index === "number") &&
        String(this.index).trim() !== "",
      hasParentTag:
        typeof this.parenttag === "string" && this.parenttag.trim() !== "",
    };

    const isValid =
      checks.hasName &&
      checks.hasCost &&
      checks.hasIndex &&
      checks.hasParentTag;

    if (!isValid) {
      console.warn("❌ Validation failed:", {
        name: checks.hasName ? "✓" : `✗ (${typeof this.name}: "${this.name}")`,
        cost: checks.hasCost ? "✓" : `✗ (${typeof this.cost}: ${this.cost})`,
        index: checks.hasIndex
          ? "✓"
          : `✗ (${typeof this.index}: "${this.index}")`,
        parenttag: checks.hasParentTag
          ? "✓"
          : `✗ (${typeof this.parenttag}: "${this.parenttag}")`,
      });
    }

    return isValid;
  }

  async setDetails(): Promise<void> {
    const tagPrompt = `
            Here is a single transaction record:

            ${this.raw_str}

            From this record, extract the following details and return them in the exact format shown:
            The name should be a concise version of what the transaction should be
            Choose the parent tags from this list: ${this.allparenttags}
            Choose the best parent tag for this particular transaction
            Extract the location/merchant address if available
            
            IMPORTANT: You MUST provide all required fields. If a field is not available, use a reasonable default.
            - If no index is provided, use "0"
            - Cost should always be a positive number
            - Always choose a parenttag from the provided list
            
            name: <item name>
            cost: <item price as a number>
            index: <index of the transaction or use 0>
            parenttag: <broader category from the parent tag list given>
            date: <transaction date>
            location: <merchant location/address or "Unknown">

            Note: If the transaction is a credit card payment, the tag should be "Credit Card Payments"
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
        // Remove currency symbols and parse
        const cleanPrice = priceStr.replace(/[$,]/g, "");
        const parsed = parseFloat(cleanPrice);
        this.cost = !isNaN(parsed) ? Math.abs(parsed) : null;
      } else if (trimmedLine.startsWith("index:")) {
        const indexStr = line.split(":", 2)[1].trim();
        this.index = indexStr || "0";
      } else if (trimmedLine.startsWith("parenttag:")) {
        this.parenttag = line.split(":", 2)[1].trim();
      } else if (trimmedLine.startsWith("date:")) {
        this.date = line.split(":", 2)[1].trim();
      } else if (trimmedLine.startsWith("location:")) {
        this.location = line.split(":", 2)[1].trim();
      }
    }

    // Set defaults if still missing
    if (!this.index || String(this.index).trim() === "") {
      this.index = "0";
    }
    if (!this.location || this.location.trim() === "") {
      this.location = "Unknown";
    }
  }

  async runOpenAI(prompt: string): Promise<OpenAICompletionResponse> {
    const envConfig: EnvConfig = process.env as unknown as EnvConfig;
    const apiKey = envConfig.OPENAI_KEY;
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
  fileSource: string | null = null;

  constructor(
    document: CSVRow[] | [] = [],
    items: Item[] = [],
    alltags: string[] | null = null,
    allparenttags: string[] | null = null,
    rawData: string | null = null,
    pdf: boolean = false,
    fileSource: string | null = null
  ) {
    this.document = document;
    this.items = items;
    this.alltags = alltags;
    this.allparenttags = allparenttags;
    this.rawData = rawData;
    this.pdf = pdf;
    this.fileSource = fileSource;
  }

  async convertPdfToCSVRow(): Promise<CSVRow[]> {
    const tagPrompt = `
      Convert the following raw credit card statement data into a valid JSON array. Don't add any token like '''json or anything like that
      Each transaction should be represented as an object with the following fields:
      
      1. **Date**: The transaction date in the format 'MM/DD/YYYY'.
      2. **Description**: A brief description of the transaction as it appears in the statement.
      3. **Amount**: The transaction amount. Use a positive number for charges and a negative number for credits.
      
      ### Output Format:
      [
        { "Date": "12/03/2024", "Description": "UBER *EATS8005928996CA", "Amount": 45.41 },
        { "Date": "12/13/2024", "Description": "LYFT *EATS8005928996CA", "Amount": -12.34 }
      ]
  
      This is the raw data: ${this.rawData}
    `;

    try {
      const completion: OpenAICompletionResponse = await this.runOpenAI(
        tagPrompt
      );
      const content = completion.choices[0].message.content.trim();

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

  async convertDocToItems(): Promise<void> {
    if (this.pdf) {
      console.log("Converting PDF to CSV row");
      await this.convertPdfToCSVRow();
    }

    if (!this.document) {
      throw new Error("Document is null");
    }

    console.log(`📊 Processing ${this.document.length} CSV rows in batch...`);

    // NEW: Batch process all transactions at once
    await this.convertDocToItemsBatch();
  }

  async convertDocToItemsBatch(): Promise<void> {
    if (!this.document) {
      throw new Error("Document is null");
    }

    // Prepare all transactions as a JSON string
    const transactionsData = this.document.map((row, index) => ({
      raw_data: row,
      index: index,
    }));

    const batchPrompt = `
You are processing a batch of financial transactions. Extract details for ALL transactions and return them in JSON format.

Transactions to process:
${JSON.stringify(transactionsData, null, 2)}

For EACH transaction, extract:
- name: concise merchant/transaction name
- price: amount as a positive number (remove $, commas, etc.)
- date: transaction date
- parenttag: category from this list ONLY: ${JSON.stringify(this.allparenttags)}
- index: use the index provided in the input
- location: merchant location or "Unknown"
- file_source: "${this.fileSource || "Unknown"}"
- bank: extract the "Bank" field from the raw_data (this is the financial institution name)

Return a JSON object with a "transactions" array containing ALL ${
      this.document.length
    } transactions.
Each transaction MUST have all required fields.`;

    try {
      console.log("🚀 Sending batch request to OpenAI...");
      const completion = await this.runOpenAIWithSchema(batchPrompt);
      const content = completion.choices[0].message.content;

      // Parse the JSON response
      const result = JSON.parse(content);
      const transactions = result.transactions || [];

      console.log(
        `📥 Received ${transactions.length} transactions from OpenAI`
      );

      let validCount = 0;
      let invalidCount = 0;

      // Process each transaction from the batch response
      for (const txn of transactions) {
        try {
          const item = new Item(
            txn.name,
            Math.abs(parseFloat(txn.price) || 0),
            txn.index || "0",
            txn.parenttag,
            JSON.stringify(txn),
            this.alltags,
            this.allparenttags,
            txn.date || undefined,
            txn.location || "Unknown",
            txn.file_source || this.fileSource || undefined,
            txn.bank || "Unknown Bank"
          );

          if (item.isValid()) {
            this.items.push(item);
            validCount++;
          } else {
            invalidCount++;
            console.warn(`⚠️ Invalid transaction from batch:`, {
              name: item.name,
              cost: item.cost,
              parenttag: item.parenttag,
            });
          }
        } catch (error) {
          invalidCount++;
          console.error(`❌ Error processing batch transaction:`, error);
        }
      }

      console.log(
        `✅ Batch processing complete: ${validCount} valid, ${invalidCount} invalid out of ${transactions.length} received (expected ${this.document.length})`
      );

      if (transactions.length < this.document.length) {
        console.warn(
          `⚠️ WARNING: OpenAI returned fewer transactions (${transactions.length}) than input (${this.document.length})`
        );
      }
    } catch (error) {
      console.error(
        "❌ Batch processing failed, falling back to individual processing:",
        error
      );
      // Fallback to individual processing if batch fails
      await this.convertDocToItemsIndividual();
    }
  }

  async convertDocToItemsIndividual(): Promise<void> {
    if (!this.document) return;

    console.log(
      `📊 Processing ${this.document.length} CSV rows individually...`
    );
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < this.document.length; i++) {
      const row = this.document[i];
      const rawStr = JSON.stringify(row);

      try {
        const tempItem = new Item(
          null,
          null,
          null,
          null,
          rawStr,
          this.alltags,
          this.allparenttags,
          null,
          null,
          this.fileSource
        );
        await tempItem.setDetails();

        if (tempItem.isValid()) {
          this.items.push(tempItem);
          validCount++;
          console.log(`✅ [${i + 1}/${this.document.length}] Valid:`, tempItem);
        } else {
          invalidCount++;
          console.warn(
            `⚠️ [${i + 1}/${this.document.length}] Invalid transaction:`,
            {
              name: tempItem.name,
              cost: tempItem.cost,
              parenttag: tempItem.parenttag,
              index: tempItem.index,
              raw: rawStr.substring(0, 100),
            }
          );
        }
      } catch (error) {
        invalidCount++;
        console.error(
          `❌ [${i + 1}/${this.document.length}] Error processing row:`,
          error
        );
        console.error(`Raw data:`, rawStr.substring(0, 200));
      }
    }

    console.log(
      `✅ Conversion complete: ${validCount} valid, ${invalidCount} invalid/failed out of ${this.document.length} total`
    );
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
        date: item.date || undefined,
        location: item.location || undefined,
        file_source: item.file_source || undefined,
        bank: item.bank || undefined,
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
    const apiKey = envConfig.OPENAI_KEY;
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

  async runOpenAIWithSchema(prompt: string): Promise<OpenAICompletionResponse> {
    const envConfig: EnvConfig = process.env as unknown as EnvConfig;
    const apiKey = envConfig.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_KEY environment variable");
    }

    const response: AxiosResponse<OpenAICompletionResponse> = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "transactions_list",
            strict: true,
            schema: {
              type: "object",
              properties: {
                transactions: {
                  type: "array",
                  description: "A list of transactions.",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "The name of the transaction.",
                      },
                      price: {
                        type: "number",
                        description: "The cost or price of the transaction.",
                      },
                      date: {
                        type: "string",
                        description: "The date of the transaction.",
                      },
                      parenttag: {
                        type: "string",
                        description: "The parent tag from the provided list.",
                      },
                      index: {
                        type: "number",
                        description: "The index of the transaction.",
                      },
                      location: {
                        type: "string",
                        description: "The location or merchant address.",
                      },
                      file_source: {
                        type: "string",
                        description: "The source file or bank name.",
                      },
                      bank: {
                        type: "string",
                        description:
                          "The bank or financial institution name from the Bank field.",
                      },
                    },
                    required: [
                      "name",
                      "price",
                      "date",
                      "parenttag",
                      "index",
                      "location",
                      "file_source",
                      "bank",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["transactions"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.3,
        max_tokens: 4096,
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

  static fromCategorizedTransactions(
    transactions: AggregatorTransaction[]
  ): Document {
    const doc = new Document();
    doc.items = transactions.map((transaction, index) => {
      const parentTag = Array.isArray(transaction.category)
        ? transaction.category[transaction.category.length - 1] ||
          transaction.category[0]
        : "Uncategorized";
      return new Item(
        transaction.name ||
          transaction.merchant_name ||
          `Transaction ${index + 1}`,
        Math.abs(Number(transaction.amount ?? 0)),
        transaction.transaction_id || index + 1,
        parentTag || "Uncategorized",
        JSON.stringify(transaction),
        Array.isArray(transaction.category) ? transaction.category : null,
        Array.isArray(transaction.category) ? transaction.category : null,
        transaction.date,
        transaction.merchant_name || transaction.name,
        "plaid" // File source for Plaid transactions
      );
    });
    return doc;
  }
}

export const buildSankeyFromCategorizedTransactions = (
  transactions: AggregatorTransaction[]
): HierarchicalData => {
  const document = Document.fromCategorizedTransactions(transactions);
  return document.convertData();
};
