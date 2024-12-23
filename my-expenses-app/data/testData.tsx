export const data0 = {
  nodes: [
    { name: "Expenses" },

    // Education - parent tag
    { name: "Education" },
    { name: "Penn Engineering Online" },
    { name: "GA Tech Marketplace" },
    { name: "Princeton Application Fee" },
    { name: "UCB Graduate Division" },

    // Health - parent tag
    { name: "Health" },
    { name: "CVS Pharmacy Purchase" },

    // Shopping - parent tag
    { name: "Shopping" },
    { name: "Mobile Payment" },
    { name: "Amazon Purchase" },
    { name: "Target Purchase" },
    { name: "Mobile Payment 2" },
    { name: "Amazon Purchase 2" },

    // Transportation - parent tag
    { name: "Transportation" },
    { name: "Lyft Ride 1" },
    { name: "Lyft Ride 2" },
    { name: "Lyft Ride 3" },
    { name: "Vehicle Rental 1" },
    { name: "Enterprise Rental" },
    { name: "Vehicle Rental 2" },
    { name: "Toll Payment" },
    { name: "Lakes Gas" },
    { name: "Valero Fuel Purchase" },
    { name: "Bird App Ride" },

    // Food & Dining - parent tag
    { name: "Food & Dining" },
    { name: "Matcha Cafe" },
    { name: "Grocery Purchase 1" },
    { name: "Publix Grocery Purchase 1" },
    { name: "Sahirah Kebab" },
    { name: "AplPay TST PONKO" },
    { name: "Publix Groceries 1" },
    { name: "IPIC Atlanta" },
    { name: "AplPay TECH DINING" },
    { name: "Moe's Southwest Grill" },
    { name: "Grocery Purchase 2" },
    { name: "Bella Mia Restaurant" },
    { name: "Chick-fil-A 1" },
    { name: "Fast Food Meal" },
    { name: "Chick-fil-A 2" },
    { name: "Publix Groceries 2" },
    { name: "FADO Irish Restaurant" },
    { name: "WINGNUTS" },
    { name: "Moge Tee Snack" },

    { name: "Income" },

    { name: "Savings" },
  ],
  links: [
    // Income and Savings
    { source: 44, target: 0, value: 2000 }, // Income -> Expenses (total expenses)
    { source: 44, target: 45, value: 200 }, // Income -> Savings

    // Education (total: 427.43)
    { source: 0, target: 1, value: 427.43 }, // Expenses -> Education
    { source: 1, target: 2, value: 92.43 }, // Education -> Penn Engineering Online
    { source: 1, target: 3, value: 105.0 }, // Education -> GA Tech Marketplace
    { source: 1, target: 4, value: 75.0 }, // Education -> Princeton Application Fee
    { source: 1, target: 5, value: 155.0 }, // Education -> UCB Graduate Division

    // Health (total: 2.93)
    { source: 0, target: 6, value: 2.93 }, // Expenses -> Health
    { source: 6, target: 7, value: 2.93 }, // Health -> CVS Pharmacy Purchase

    // Shopping (total: 1253.21)
    { source: 0, target: 8, value: 1253.21 }, // Expenses -> Shopping
    { source: 8, target: 9, value: 831.52 }, // Shopping -> Mobile Payment
    { source: 8, target: 10, value: 5.43 }, // Shopping -> Amazon Purchase
    { source: 8, target: 11, value: 35.97 }, // Shopping -> Target Purchase
    { source: 8, target: 12, value: 368.18 }, // Shopping -> Mobile Payment 2
    { source: 8, target: 13, value: 12.11 }, // Shopping -> Amazon Purchase 2

    // Transportation (total: 399.4)
    { source: 0, target: 14, value: 399.4 }, // Expenses -> Transportation
    { source: 14, target: 15, value: 7.0 }, // Transportation -> Lyft Ride 1
    { source: 14, target: 16, value: 22.99 }, // Transportation -> Lyft Ride 2
    { source: 14, target: 17, value: 20.99 }, // Transportation -> Lyft Ride 3
    { source: 14, target: 18, value: 37.35 }, // Transportation -> Vehicle Rental 1 (made positive)
    { source: 14, target: 19, value: 43.32 }, // Transportation -> Enterprise Rental (made positive)
    { source: 14, target: 20, value: 390.3 }, // Transportation -> Vehicle Rental 2
    { source: 14, target: 21, value: 26.1 }, // Transportation -> Toll Payment
    { source: 14, target: 22, value: 3.01 }, // Transportation -> Lakes Gas
    { source: 14, target: 23, value: 5.38 }, // Transportation -> Valero Fuel Purchase
    { source: 14, target: 24, value: 4.3 }, // Transportation -> Bird App Ride

    // Food & Dining (total: 260.95)
    { source: 0, target: 25, value: 260.95 }, // Expenses -> Food & Dining
    { source: 25, target: 26, value: 6.41 }, // Food & Dining -> Matcha Cafe
    { source: 25, target: 27, value: 13.51 }, // Food & Dining -> Grocery Purchase 1
    { source: 25, target: 28, value: 7.61 }, // Food & Dining -> Publix Grocery Purchase 1
    { source: 25, target: 29, value: 16.34 }, // Food & Dining -> Sahirah Kebab
    { source: 25, target: 30, value: 26.76 }, // Food & Dining -> AplPay TST PONKO
    { source: 25, target: 31, value: 16.29 }, // Food & Dining -> Publix Groceries 1
    { source: 25, target: 32, value: 20.85 }, // Food & Dining -> IPIC Atlanta
    { source: 25, target: 33, value: 14.15 }, // Food & Dining -> AplPay TECH DINING
    { source: 25, target: 34, value: 10.33 }, // Food & Dining -> Moe's Southwest Grill
    { source: 25, target: 35, value: 34.7 }, // Food & Dining -> Grocery Purchase 2
    { source: 25, target: 36, value: 2.92 }, // Food & Dining -> Bella Mia Restaurant
    { source: 25, target: 37, value: 12.07 }, // Food & Dining -> Chick-fil-A 1
    { source: 25, target: 38, value: 5.4 }, // Food & Dining -> Fast Food Meal
    { source: 25, target: 39, value: 6.48 }, // Food & Dining -> Chick-fil-A 2
    { source: 25, target: 40, value: 22.12 }, // Food & Dining -> Publix Groceries 2
    { source: 25, target: 41, value: 21.05 }, // Food & Dining -> FADO Irish Restaurant
    { source: 25, target: 42, value: 16.88 }, // Food & Dining -> WINGNUTS
    { source: 25, target: 43, value: 7.08 }, // Food & Dining -> Moge Tee Snack
  ],
};

export const testdatamini = {
  nodes: [
    { name: "Expenses" }, //0
    // Education - parent tag
    { name: "Education" }, //1

    // tags
    { name: "Penn Engineering Online", cost: 100 }, //2  - $100

    // health - parent tag
    { name: "Health" }, //3

    // tags
    { name: "CVS Pharmacy Purchase", cost: 10 }, //4 - $10
    { name: "Some Hospital", cost: 150 }, //5 - $150

    // Shopping - parent tag
    { name: "Shopping" }, //6

    // tags
    { name: "Mobile Payment", cost: 15 }, //7 - $15
    { name: "Amazon Purchase", cost: 175 }, //8 - $175
    { name: "Target", cost: 70 }, //9 - $70
    { name: "Amazon Purchase 2", cost: 25 }, //10 - $125

    { name: "Food" }, //11
    { name: "Chipotle", cost: 16 }, //12
  ],
};

export const parentChildMap_testdatamini = {
  1: [2], // Education -> Penn Engineering Online
  3: [4, 5], // Health -> CVS Pharmacy Purchase, Some Hospital
  6: [7, 8, 9, 10], // Shopping -> Mobile Payment, Amazon Purchase, etc.
  11: [12],
};

export const calculateLinks = (
  nodes: Array<{ name: string; cost?: number }>,
  map: Record<number, number[]>
) => {
  //   const nodes = testdatamini.nodes; // Access nodes correctly
  const links = [];
  const parentValues: Record<number, number> = {}; // Define the type for parentValues
  const parentIndices = new Set(Object.keys(map).map(Number));
  // Iterate through parent-child relationships
  for (const [parentIndex, childIndices] of Object.entries(map)) {
    const parent = parseInt(parentIndex, 10);
    let parentSum = 0;
    // Process child nodes
    for (const child of childIndices) {
      const value = nodes[child].cost || 0;
      parentSum += value;
      // Link parent -> child
      links.push({ source: parent, target: child, value });
    }
    // Store total value for the parent
    parentValues[parent] = parentSum;
    // Link root -> parent
    links.push({ source: 0, target: parent, value: parentSum });
  }
  // Update node values based on calculated parent values
  const updatedNodes = nodes.map((node, index) => ({
    ...node,
    value: parentValues[index] || node.cost || 0,
    visible: index == 0 || parentIndices.has(index) ? true : null, // Set visibility
    isleaf: index == 0 || parentIndices.has(index) ? false : true,
  }));
  return { nodes: updatedNodes, links: links };
};
