// Import necessary modules
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import * as csv from "csv-parser";
import axios from "axios";
import { parentTags } from "@/data/testData";

// Load environment variables
dotenv.config();

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

    const completion = await this.runOpenAI(tagPrompt);
    const content = completion.data.choices[0].message.content;

    const lines = content.trim().split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().startsWith("name:")) {
        this.name = trimmedLine.split(":", 2)[1].trim();
      } else if (trimmedLine.toLowerCase().startsWith("cost:")) {
        const priceStr = trimmedLine.split(":", 2)[1].trim();
        this.cost = parseFloat(priceStr) || null;
      } else if (trimmedLine.toLowerCase().startsWith("index:")) {
        this.index = trimmedLine.split(":", 2)[1].trim();
      } else if (trimmedLine.toLowerCase().startsWith("parenttag:")) {
        this.parenttag = trimmedLine.split(":", 2)[1].trim();
      }
    }
  }

  async runOpenAI(prompt: string): Promise<any> {
    const apiKey = process.env.OPENAI_KEY;
    const response = await axios.post(
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

    return response;
  }
}

// Define the Document class
export class Document {
  document: any[];
  items: Item[];
  alltags: string[] | null;
  allparenttags: string[] | null;

  constructor(
    document: any[],
    alltags: string[] | null = null,
    allparenttags: string[] | null = null
  ) {
    this.document = document;
    this.items = [];
    this.alltags = alltags;
    this.allparenttags = allparenttags;
  }

  async convertDocToItems(): Promise<void> {
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

  convertData(): { output: any; parentChildMap: any } {
    const output = { nodes: [] as any[] };
    const parentTags: { [key: string]: number } = {};
    const parentChildMap: { [key: number]: number[] } = {};
    let currentIndex = 0;

    output.nodes.push({ name: "Expenses", index: currentIndex });
    currentIndex++;

    for (const item of this.items) {
      if (item.parenttag && !(item.parenttag in parentTags)) {
        parentTags[item.parenttag] = currentIndex;
        output.nodes.push({ name: item.parenttag, index: currentIndex });
        parentChildMap[currentIndex] = [];
        currentIndex++;
      }

      const transactionIndex = currentIndex;
      output.nodes.push({
        name: item.name,
        cost: item.cost,
        index: transactionIndex,
      });
      parentChildMap[parentTags[item.parenttag!]].push(transactionIndex);
      currentIndex++;
    }

    fs.writeFileSync("output.json", JSON.stringify(output, null, 4));
    fs.writeFileSync(
      "parent_child_map.json",
      JSON.stringify(parentChildMap, null, 4)
    );

    console.log(
      "Data successfully written to 'output.json' and 'parent_child_map.json'"
    );

    return { output, parentChildMap };
  }
}

// Main function
async function main() {
  const csvFilePath = path.resolve(__dirname, "activity.csv");

  const allparenttags = parentTags

  const document: any[] = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      document.push(row);
    })
    .on("end", async () => {
      const doc = new Document(document, allparenttags);
      await doc.convertDocToItems();
      const hierarchicalData = doc.convertData();
      console.log(hierarchicalData);
    });
}

// main();
