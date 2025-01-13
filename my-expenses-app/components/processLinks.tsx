import { Map, SankeyNode, SankeyLink } from "@/app/types/types";
import { fixedColors } from "@/components/variables";

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
      parentSum += Math.abs(value);
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
