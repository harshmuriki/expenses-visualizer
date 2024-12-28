import { Map, SankeyNode, SankeyLink } from "@/app/types/types";
import { fixedColors } from "@/components/variables";

export const data0 = {
  nodes: [
    { name: "Expenses", index: 0 }, //0

    // Education - parent tag
    { name: "Education", index: 1 }, //1

    // transactions
    { name: "Penn Engineering Online", cost: 92.43, index: 2 }, //2 - $92.43
    { name: "GA Tech Marketplace", cost: 105.0, index: 3 }, //3 - $105.0
    { name: "Princeton Application Fee", cost: 75.0, index: 4 }, //4 - $75.0
    { name: "UCB Graduate Division", cost: 155.0, index: 5 }, //5 - $155.0

    // Health - parent tag
    { name: "Health", index: 6 }, //6

    // transactions
    { name: "CVS Pharmacy Purchase", cost: 2.93, index: 7 }, //7 - $2.93

    // Shopping - parent tag
    { name: "Shopping", index: 8 }, //8

    // transactions
    { name: "Mobile Payment", cost: 831.52, index: 9 }, //9 - $831.52
    { name: "Amazon Purchase", cost: 5.43, index: 10 }, //10 - $5.43
    { name: "Target Purchase", cost: 35.97, index: 11 }, //11 - $35.97
    { name: "Mobile Payment 2", cost: 368.18, index: 12 }, //12 - $368.18
    { name: "Amazon Purchase 2", cost: 12.11, index: 13 }, //13 - $12.11

    // Transportation - parent tag
    { name: "Transportation", index: 14 }, //14

    // transactions
    { name: "Lyft Ride 1", cost: 7.0, index: 15 }, //15 - $7.0
    { name: "Lyft Ride 2", cost: 22.99, index: 16 }, //16 - $22.99
    { name: "Lyft Ride 3", cost: 20.99, index: 17 }, //17 - $20.99
    { name: "Vehicle Rental 1", cost: 37.35, index: 18 }, //18 - $37.35
    { name: "Enterprise Rental", cost: 43.32, index: 19 }, //19 - $43.32
    { name: "Vehicle Rental 2", cost: 390.3, index: 20 }, //20 - $390.3
    { name: "Toll Payment", cost: 26.1, index: 21 }, //21 - $26.1
    { name: "Lakes Gas", cost: 3.01, index: 22 }, //22 - $3.01
    { name: "Valero Fuel Purchase", cost: 5.38, index: 23 }, //23 - $5.38
    { name: "Bird App Ride", cost: 4.3, index: 24 }, //24 - $4.3

    // Food & Dining - parent tag
    { name: "Food & Dining", index: 25 }, //25

    // transactions
    { name: "Matcha Cafe", cost: 6.41, index: 26 }, //26 - $6.41
    { name: "Grocery Purchase 1", cost: 13.51, index: 27 }, //27 - $13.51
    { name: "Publix Grocery Purchase 1", cost: 7.61, index: 28 }, //28 - $7.61
    { name: "Sahirah Kebab", cost: 16.34, index: 29 }, //29 - $16.34
    { name: "AplPay TST PONKO", cost: 26.76, index: 30 }, //30 - $26.76
    { name: "Publix Groceries 1", cost: 16.29, index: 31 }, //31 - $16.29
    { name: "IPIC Atlanta", cost: 20.85, index: 32 }, //32 - $20.85
    { name: "AplPay TECH DINING", cost: 14.15, index: 33 }, //33 - $14.15
    { name: "Moe's Southwest Grill", cost: 10.33, index: 34 }, //34 - $10.33
    { name: "Grocery Purchase 2", cost: 34.7, index: 35 }, //35 - $34.7
    { name: "Bella Mia Restaurant", cost: 2.92, index: 36 }, //36 - $2.92
    { name: "Chick-fil-A 1", cost: 12.07, index: 37 }, //37 - $12.07
    { name: "Fast Food Meal", cost: 5.4, index: 38 }, //38 - $5.4
    { name: "Chick-fil-A 2", cost: 6.48, index: 39 }, //39 - $6.48
    { name: "Publix Groceries 2", cost: 22.12, index: 40 }, //40 - $22.12
    { name: "FADO Irish Restaurant", cost: 21.05, index: 41 }, //41 - $21.05
    { name: "WINGNUTS", cost: 16.88, index: 42 }, //42 - $16.88
    { name: "Moge Tee Snack", cost: 7.08, index: 43 }, //43 - $7.08
  ],
};

export const parentChildMap_data0 = {
  1: [2, 3, 4, 5], // Education -> Penn Engineering Online, GA Tech Marketplace, etc.
  6: [7], // Health -> CVS Pharmacy Purchase
  8: [9, 10, 11, 12, 13], // Shopping -> Mobile Payment, Amazon Purchase, etc.
  14: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24], // Transportation -> Lyft Ride 1, Vehicle Rental, etc.
  25: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43], // Food & Dining -> Matcha Cafe, Grocery Purchase, etc.
};

export const testdatamini = {
  nodes: [
    { name: "Expenses", index: 0 }, //0

    // Education - parent tag
    { name: "Education", index: 1 }, //1

    // tags
    { name: "Penn Engineering Online", cost: 92.43, index: 2 }, //2 - $92.43
    { name: "GA Tech Marketplace", cost: 105.0, index: 3 }, //3 - $105.0
    { name: "Princeton Application Fee", cost: 75.0, index: 4 }, //4 - $75.0
    { name: "UCB Graduate Division", cost: 155.0, index: 5 }, //5 - $155.0

    // Health - parent tag
    { name: "Health", index: 6 }, //6

    // tags
    { name: "CVS Pharmacy Purchase", cost: 2.93, index: 7 }, //7 - $2.93

    // Shopping - parent tag
    { name: "Shopping", index: 8 }, //8

    // tags
    { name: "Mobile Payment", cost: 831.52, index: 9 }, //9 - $831.52
    { name: "Amazon Purchase", cost: 5.43, index: 10 }, //10 - $5.43
  ],
};

export const parentChildMap_testdatamini = {
  // Parent != 0
  // Parent: [child1, child2, ...]
  1: [2, 3, 4, 5], // Education -> Penn Engineering Online
  6: [7], // Shopping -> Mobile Payment, Amazon Purchase, etc.
  8: [9, 10],
};

export const data1 = {
  nodes: [
    {
      name: "Expenses",
      index: 0,
    },
    {
      name: "Food & Dining",
      index: 1,
    },
    {
      name: "AplPay Marrakech Exp",
      cost: 9.74,
      index: 2,
    },
    {
      name: "Transportation",
      index: 3,
    },
    {
      name: "SEPTA Transportation",
      cost: 15.0,
      index: 4,
    },
    {
      name: "Shopping",
      index: 5,
    },
    {
      name: "AMAZON.COM Purchase",
      cost: 5.84,
      index: 6,
    },
    {
      name: "AplPay AJM BUSINESS",
      cost: 6.24,
      index: 7,
    },
    {
      name: "AplPay AO SUPPLIER CASTORIA",
      cost: 18.72,
      index: 8,
    },
    {
      name: "Joe's Pizza",
      cost: 4.5,
      index: 9,
    },
    {
      name: "AplPay L' ARTE DEL G",
      cost: 7.89,
      index: 10,
    },
    {
      name: "Lyft Ride",
      cost: 10.78,
      index: 11,
    },
    {
      name: "Lyft Ride",
      cost: 12.73,
      index: 12,
    },
    {
      name: "AplPay NYCT PAYGO",
      cost: 2.9,
      index: 13,
    },
    {
      name: "AplPay NYCT PAYGO",
      cost: 2.9,
      index: 14,
    },
    {
      name: "Local Transportation",
      cost: 2.9,
      index: 15,
    },
    {
      name: "AplPay NYCT PAYGO",
      cost: 2.9,
      index: 16,
    },
    {
      name: "Cheesecake Factory",
      cost: 45.53,
      index: 17,
    },
    {
      name: "Entertainment & Recreation",
      index: 18,
    },
    {
      name: "AplPay BIRD APP",
      cost: 1.08,
      index: 19,
    },
    {
      name: "BIRD APP",
      cost: 2.15,
      index: 20,
    },
    {
      name: "Bird Ride",
      cost: 6.52,
      index: 21,
    },
  ],
};

export const data1_map = {
  "1": [2, 7, 8, 9, 10, 17],
  "3": [4, 11, 12, 13, 14, 15, 16, 21],
  "5": [6],
  "18": [19, 20],
};

export const calculateLinks = (nodes: SankeyNode[], map: Map) => {
  const links: SankeyLink[] = [];
  const parentValues: Record<number, number> = {}; // Define the type for parentValues
  //   const parentIndices = new Set(Object.keys(map).map(Number));
  let colorIndex = 0; // Initialize a color index counter

  for (const [parentIndex, childIndices] of Object.entries(map)) {
    const colorval = fixedColors[colorIndex % fixedColors.length]; // Get color from fixedColors
    const parent = parseInt(parentIndex, 10);
    let parentSum = 0;
    // Process child nodes
    const childIndicesArray = Array.isArray(childIndices)
      ? childIndices
      : Object.values(childIndices);

    // console.log("parents", parent, childIndices);

    for (const childIdx of childIndicesArray) {
      const node = nodes.find((n) => n.index === childIdx);
      const value = node ? node.cost || 0 : 0;
      parentSum += value;
      // Link parent -> child

      const parent = parseInt(parentIndex, 10); // Ensure parent is a number
      const child = parseInt(String(childIdx), 10); // Ensure child is a number

      links.push({
        source: parent,
        target: child,
        value: parseFloat(value.toFixed(1)),
        color: colorval,
        strokeWidth: Math.max(5, value / 100),
      });
    }
    // Store total value for the parent
    parentValues[parent] = parseFloat(parentSum.toFixed(1));
    // Link root -> parent
    links.push({
      source: 0,
      target: parent,
      color: colorval,
      value: parseFloat(parentSum.toFixed(1)),
    });

    colorIndex++;
  }
  // Update node values based on calculated parent values
  //   const updatedNodes = nodes.map((node, index) => ({
  //     ...node,
  //     value: parentValues[index] || node.cost || 0,
  //     visible: index == 0 || parentIndices.has(index) ? true : null, // Set visibility
  //     isleaf: index == 0 || parentIndices.has(index) ? false : true,
  //   }));
  return { nodes: nodes, links: links };
};
