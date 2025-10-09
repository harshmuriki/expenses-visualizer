"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as echarts from "echarts/core";
import { TitleComponent, TooltipComponent } from "echarts/components";
import { SankeyChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import nodesDataRaw from "../output.json";
import parentChildMapRaw from "../parent_child_map.json";
import InputModal from "./editNodes";

echarts.use([TitleComponent, TooltipComponent, SankeyChart, CanvasRenderer]);

interface EChartLink {
  source: string;
  target: string;
  value: number;
}

interface NodeData {
  nodes: Array<{
    name: string;
    index: number;
    cost?: number;
  }>;
}

interface FixedNodeOrder {
  [nodeName: string]: number;
}

// Helper to get unique name by index
const getNodeNameByIndex = (nodesData: NodeData, idx: number) => {
  const node = nodesData.nodes.find((n) => n.index === idx);
  return node ? `${node.name} [${node.index}]` : "";
};

// Helper to get display name (strip [index])
const displayName = (name: string) => name.replace(/ \[\d+\]$/, "");

// Define the nodeStyle function that was missing
const nodeStyle = (node: any, isParent: boolean, isCollapsed: boolean) => {
  // Basic style
  const style: {
    opacity: number;
    borderWidth: number;
    borderColor: string;
    shadowBlur?: number;
    shadowColor?: string;
  } = {
    opacity: 0.9,
    borderWidth: isParent ? 2 : 0,
    borderColor: "#ffffff",
  };

  // Special styling for collapsible nodes
  if (isParent) {
    style.opacity = isCollapsed ? 0.7 : 0.9;
    style.borderWidth = 2;
    // Add visual indicator that this node is interactive
    style.shadowBlur = 5;
    style.shadowColor = isCollapsed ? "#f6ad55" : "#63b3ed";
  }

  return style;
};

function buildSankeyData(
  nodesData: NodeData,
  parentChildMap: Record<string, number[]>,
  collapsedNodes: number[]
) {
  try {
    // Validate input data
    if (
      !nodesData ||
      !nodesData.nodes ||
      !Array.isArray(nodesData.nodes) ||
      !parentChildMap
    ) {
      console.error("Invalid input data to buildSankeyData", {
        nodesData,
        parentChildMap,
      });
      // Return minimal valid data structure
      return {
        nodes: [{ name: "Error [0]" }],
        links: [],
        nodeCostMap: { "Error [0]": 0 },
      };
    }

    // Calculate the total value for each parent node upfront
    // This helps us sort parents consistently by their value
    const calculateParentValues = () => {
      const parentValues: Record<number, number> = {};

      // Calculate the value for each parent based on the sum of their children
      Object.entries(parentChildMap).forEach(([parentIdx, children]) => {
        if (!children || !Array.isArray(children) || children.length === 0) {
          return;
        }

        const parentIndex = Number(parentIdx);
        let totalValue = 0;

        children.forEach((childIdx) => {
          const childNode = nodesData.nodes.find((n) => n.index === childIdx);
          totalValue += childNode?.cost || 0;
        });

        parentValues[parentIndex] = totalValue;
      });

      return parentValues;
    };

    const parentValues = calculateParentValues();

    // Get all nodes that should be hidden (direct and indirect children of collapsed nodes)
    const getNodesToHide = () => {
      const nodesToHide = new Set<number>();

      // Function to recursively add all children of a collapsed node
      const addChildrenRecursively = (parentIdx: number) => {
        const children = parentChildMap[String(parentIdx)];
        if (children && Array.isArray(children)) {
          children.forEach((childIdx) => {
            nodesToHide.add(childIdx);
            // If this child is also a parent, add its children too
            if (parentChildMap[String(childIdx)]) {
              addChildrenRecursively(childIdx);
            }
          });
        }
      };

      // Process all collapsed nodes
      collapsedNodes.forEach((collapsedIdx) => {
        addChildrenRecursively(collapsedIdx);
      });

      return nodesToHide;
    };

    const nodesToHide = getNodesToHide();

    // Build unique node names - with simple styling, excluding hidden nodes
    const nodes: {
      name: string;
      itemStyle?: {
        color?: string;
        opacity?: number;
        borderColor?: string;
        borderWidth?: number;
        cursor?: string;
      };
      sumCost?: number;
      parentIndex?: number; // For sorting purposes
    }[] = nodesData.nodes
      .filter((n) => !nodesToHide.has(n.index)) // Filter out hidden nodes
      .map((n) => {
        // Create basic node
        const node = {
          name: `${n.name} [${n.index}]`,
          parentIndex: n.index, // Store the index for sorting later
        };

        // We'll set colors later
        return node;
      });

    const links: EChartLink[] = [];

    // Process links - skip children of collapsed nodes
    for (const [parentIdx, children] of Object.entries(parentChildMap)) {
      if (!children || !Array.isArray(children)) continue;

      const parentIndex = Number(parentIdx);
      const parentName = getNodeNameByIndex(nodesData, parentIndex);
      if (!parentName) continue;

      // Skip if this parent is hidden (child of a collapsed node)
      if (nodesToHide.has(parentIndex)) continue;

      for (const childIdx of children as number[]) {
        const childNode = nodesData.nodes.find((n) => n.index === childIdx);
        if (!childNode) continue;

        // Skip if this child is hidden
        if (nodesToHide.has(childIdx)) continue;

        const childName = getNodeNameByIndex(nodesData, childIdx);

        // If the child is a collapsed parent, still connect it to its parent
        // but don't process its children (they're already skipped)
        if (collapsedNodes.includes(childIdx)) {
          links.push({
            source: parentName,
            target: childName,
            value: childNode.cost || 1, // Use the child's cost as the link value
          });
          continue;
        }

        // Skip showing children links if parent is collapsed
        // (this is redundant now since we filter out children of collapsed nodes,
        // but keeping for safety)
        if (collapsedNodes.includes(parentIndex)) continue;

        links.push({
          source: parentName,
          target: childName,
          value: childNode.cost || 1,
        });
      }

      // Add explicit handling for Expenses' direct children
      if (parentIndex === 0) {
        // Expenses is the parent
        for (const childIdx of children as number[]) {
          const childNode = nodesData.nodes.find((n) => n.index === childIdx);
          if (!childNode) continue;

          const childName = getNodeNameByIndex(nodesData, childIdx);

          // Always create link from Expenses to its direct children
          links.push({
            source: parentName,
            target: childName,
            value: childNode.cost || 1,
          });
        }
      }
    }

    // Ensure 'Expenses' is the leftmost root node
    const expensesNode = nodes.find((n) => n.name.startsWith("Expenses"));
    if (expensesNode) {
      nodes.splice(nodes.indexOf(expensesNode), 1);
      nodes.unshift(expensesNode);
    }

    // Sort the top-level parent nodes (direct children of Expenses) by their value in descending order
    // First, identify top-level parents
    const topLevelParentIndices = new Set<number>();
    Object.entries(parentChildMap).forEach(([parentIdx, children]) => {
      const parentIndex = Number(parentIdx);
      // If it's not the root and has children
      if (parentIndex !== 0 && children && children.length > 0) {
        // Check if it's a direct child of Expenses (index 0)
        const expensesChildren = parentChildMap["0"] || [];
        if (expensesChildren.includes(parentIndex)) {
          topLevelParentIndices.add(parentIndex);
        }
      }
    });

    // Force a stable sort for parent nodes
    nodes.sort((a, b) => {
      const idxA = Number(a.name.match(/\[(\d+)\]/)?.[1]);
      const idxB = Number(b.name.match(/\[(\d+)\]/)?.[1]);

      // Always keep Expenses (index 0) first
      if (idxA === 0) return -1;
      if (idxB === 0) return 1;

      // If both are top-level parents, sort by value descending
      if (topLevelParentIndices.has(idxA) && topLevelParentIndices.has(idxB)) {
        return (parentValues[idxB] || 0) - (parentValues[idxA] || 0);
      }

      // If only one is a top-level parent, give it priority
      if (topLevelParentIndices.has(idxA)) return -1;
      if (topLevelParentIndices.has(idxB)) return 1;

      // Otherwise, maintain original order for stability
      return idxA - idxB;
    });

    // Need to reposition expenses node after the sort (should be first)
    const expensesIdx = nodes.findIndex((n) => n.name.startsWith("Expenses"));
    if (expensesIdx > 0) {
      const expenses = nodes.splice(expensesIdx, 1)[0];
      nodes.unshift(expenses);
    }

    // Assign a unique color to each parent node (direct child of 'Expenses')
    const parentColors = [
      "#fbb4ae",
      "#b3cde3",
      "#ccebc5",
      "#decbe4",
      "#fed9a6",
      "#ffffcc",
      "#e5d8bd",
      "#fddaec",
      "#f2f2f2",
    ];

    try {
      const parentNodeNames = links
        .filter((l) => l.source === getNodeNameByIndex(nodesData, 0))
        .map((l) => l.target);

      const nodeColorMap: Record<string, string> = {};
      parentNodeNames.forEach((name, idx) => {
        nodeColorMap[name] = parentColors[idx % parentColors.length];
      });

      // Apply colors to nodes
      nodes.forEach((node) => {
        // Extract index from node name
        const idx = Number(node.name.match(/\[(\d+)\]/)?.[1]);
        const isParent =
          parentChildMap[String(idx)] &&
          Array.isArray(parentChildMap[String(idx)]) &&
          parentChildMap[String(idx)].length > 0;
        const isCollapsed = collapsedNodes.includes(idx);

        // Use the node styling function
        node.itemStyle = {
          color: nodeColorMap[node.name] || "#888888",
          ...nodeStyle(node, isParent, isCollapsed),
        };

        // Add cursor style to make it obvious these can be clicked
        if (isParent) {
          node.itemStyle.cursor = "pointer";
        }
      });
    } catch (colorError) {
      console.error("Error assigning colors:", colorError);
    }

    // Find all parent and child indices
    const parentIndices = Object.keys(parentChildMap).map(Number);
    const childIndices = Object.values(parentChildMap)
      .filter((arr) => Array.isArray(arr))
      .flat() as number[];

    // Find all top-level parents (not a child of anyone, and not Expenses itself)
    const topLevelParents = parentIndices.filter(
      (idx) => !childIndices.includes(idx) && idx !== 0
    );

    // For each top-level parent, add a link from Expenses if not already present
    try {
      const expensesName = getNodeNameByIndex(nodesData, 0);
      topLevelParents.forEach((parentIdx) => {
        // Skip if this parent is hidden
        if (nodesToHide.has(parentIdx)) return;

        const parentName = getNodeNameByIndex(nodesData, parentIdx);
        if (!parentName) return;

        const alreadyLinked = links.some(
          (l) => l.source === expensesName && l.target === parentName
        );

        if (!alreadyLinked) {
          const children = parentChildMap[String(parentIdx)] as number[];
          if (!children || !Array.isArray(children)) return;

          let value;

          // For collapsed nodes, calculate a value based on their own cost
          if (collapsedNodes.includes(parentIdx)) {
            // Find the node's own cost, if available
            const parentNode = nodesData.nodes.find(
              (n) => n.index === parentIdx
            );
            value =
              parentNode?.cost ||
              // Otherwise calculate from children
              children
                .map((childIdx) => {
                  const childNode = nodesData.nodes.find(
                    (n) => n.index === childIdx
                  );
                  return childNode?.cost || 1;
                })
                .reduce((a, b) => a + b, 0);
          } else {
            // Normal calculation for expanded nodes
            value = children
              .map((childIdx) => {
                const childNode = nodesData.nodes.find(
                  (n) => n.index === childIdx
                );
                return childNode?.cost || 1;
              })
              .reduce((a, b) => a + b, 0);
          }

          links.push({
            source: expensesName,
            target: parentName,
            value,
          });
        }
      });
    } catch (linkError) {
      console.error("Error creating top-level links:", linkError);
    }

    // Attach cost/sumCost to each node
    const nodeCostMap: Record<string, number> = {};

    try {
      nodes.forEach((node) => {
        const idx = Number(node.name.match(/\[(\d+)\]/)?.[1]);
        if (isNaN(idx)) return;

        const orig = nodesData.nodes.find((n) => n.index === idx);
        if (!orig) return;

        if (parentChildMap[String(idx)]) {
          const children = parentChildMap[String(idx)] as number[];
          if (!children || !Array.isArray(children)) {
            node.sumCost = orig.cost || 0;
            nodeCostMap[node.name] = orig.cost || 0;
            return;
          }

          const sum = children
            .map((childIdx) => {
              const child = nodesData.nodes.find((n) => n.index === childIdx);
              return child?.cost || 0;
            })
            .reduce((a, b) => a + b, 0);

          node.sumCost = sum;
          nodeCostMap[node.name] = sum;
        } else {
          node.sumCost = orig.cost || 0;
          nodeCostMap[node.name] = orig.cost || 0;
        }

        // Remove the temporary parentIndex property as it's not needed for ECharts
        delete node.parentIndex;
      });
    } catch (costError) {
      console.error("Error calculating node costs:", costError);
    }

    // Calculate and attach total cost for the root node ("Expenses")
    try {
      const rootIdx = 0;
      const rootNode = nodes.find((n) => n.name.startsWith("Expenses"));
      if (rootNode) {
        // Find all direct children of Expenses
        const children = Object.entries(parentChildMap)
          .filter(([parentIdx]) => Number(parentIdx) === rootIdx)
          .flatMap(([, childArr]) => childArr as number[]);

        const sum = children
          .map((childIdx) => {
            const child = nodesData.nodes.find((n) => n.index === childIdx);
            // If the child is a parent, use its sumCost, else use its cost
            if (parentChildMap[String(childIdx)]) {
              return nodeCostMap[`${child?.name} [${child?.index}]`] || 0;
            }
            return child?.cost || 0;
          })
          .reduce((a, b) => a + b, 0);

        rootNode.sumCost = sum;
        nodeCostMap[rootNode.name] = sum;
      }
    } catch (rootError) {
      console.error("Error calculating root node cost:", rootError);
    }

    return { nodes, links, nodeCostMap };
  } catch (error) {
    console.error("Error in buildSankeyData:", error);
    // Return minimal valid data structure
    return {
      nodes: [{ name: "Error [0]" }],
      links: [],
      nodeCostMap: { "Error [0]": 0 },
    };
  }
}

interface ModalNodeType {
  name: string;
  idx: number;
}

const EChartsSankeyComponent: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const fixedNodeOrderRef = useRef<FixedNodeOrder>({});
  const [nodesData, setNodesData] = useState<NodeData>(() =>
    JSON.parse(JSON.stringify(nodesDataRaw))
  );
  const [parentChildMap, setParentChildMap] = useState<
    Record<string, number[]>
  >(() => JSON.parse(JSON.stringify(parentChildMapRaw)));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNode, setModalNode] = useState<ModalNodeType | null>(null);
  const [modalValue, setModalValue] = useState<string>("");
  const [modalParent, setModalParent] = useState<string>("");
  const [modalParentOptions, setModalParentOptions] = useState<string[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<number[]>([]);
  // Memoize sankey data calculation to prevent unnecessary recalculations
  const [sankeyData, setSankeyData] = useState(() =>
    buildSankeyData(nodesData, parentChildMap, collapsedNodes)
  );

  // Helper to get all possible parent options (only parents and Expenses)
  const getAllParentOptions = useCallback(
    (excludeIdx: number) => {
      // Get indices of all nodes that are parents (have children)
      const parentIndices = Object.keys(parentChildMap).map(Number);

      // Create options for all parent nodes and the root "Expenses" node
      const options = nodesData.nodes
        .filter(
          (n) =>
            // Include if it's a parent (in parentIndices) or the root (index 0)
            (parentIndices.includes(n.index) || n.index === 0) &&
            // Exclude the node itself
            n.index !== excludeIdx
        )
        .map((n) => `${n.name} [${n.index}]`);

      console.log(
        `Generated ${options.length} parent options for node ${excludeIdx}:`,
        options
      );
      return options;
    },
    [parentChildMap, nodesData]
  );

  // Initialize the fixed node order on first render
  useEffect(() => {
    // Initialize fixed order for top-level parent nodes (direct children of Expenses)
    if (Object.keys(fixedNodeOrderRef.current).length === 0) {
      const expensesChildren = parentChildMap["0"] || [];
      if (expensesChildren && expensesChildren.length > 0) {
        console.log("Initializing fixed node order for top-level parents");

        // Calculate initial values for parents for sorting
        const parentValues: Record<number, number> = {};
        expensesChildren.forEach((childIdx) => {
          const children = parentChildMap[String(childIdx)];
          if (!children || !Array.isArray(children)) return;

          // Calculate sum of this parent's children costs
          const sum = children.reduce((total, idx) => {
            const node = nodesData.nodes.find((n) => n.index === idx);
            return total + (node?.cost || 0);
          }, 0);

          parentValues[childIdx] = sum;
        });

        // Sort parents by value (descending)
        const sortedParents = [...expensesChildren].sort(
          (a, b) => (parentValues[b] || 0) - (parentValues[a] || 0)
        );

        // Create a map of node name to fixed order index
        sortedParents.forEach((idx, order) => {
          const node = nodesData.nodes.find((n) => n.index === idx);
          if (node) {
            const nodeName = `${node.name} [${node.index}]`;
            fixedNodeOrderRef.current[nodeName] = order;
            console.log(`Assigned fixed order ${order} to node ${nodeName}`);
          }
        });
      }
    }
  }, [nodesData, parentChildMap]);

  // Initialize chart only once with performance optimizations
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // Clean up any existing instance to avoid memory leaks
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }

      // Create a new chart instance with performance-focused options
      chartInstanceRef.current = echarts.init(chartRef.current, null, {
        renderer: "canvas", // Canvas is faster than SVG for large datasets
        useDirtyRect: true, // Enable incremental rendering for better performance
      });

      // More efficient resize handler
      const handleResize = () => {
        if (
          chartInstanceRef.current &&
          !chartInstanceRef.current.isDisposed()
        ) {
          const minWidth = Math.max(window.innerWidth, 1500);
          if (chartRef.current) {
            chartRef.current.style.width = `${minWidth}px`;
            chartRef.current.style.height = `calc(100vh - 80px)`;
            chartInstanceRef.current.resize();
          }
        }
      };

      // Throttle resize events for better performance
      let resizeTimeout: NodeJS.Timeout;
      const throttledResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
      };

      window.addEventListener("resize", throttledResize);

      // Initial size setting
      handleResize();

      return () => {
        window.removeEventListener("resize", throttledResize);
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose();
          chartInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
  }, []);

  // Update chart data with better performance
  useEffect(() => {
    if (!chartRef.current || !chartInstanceRef.current) return;

    try {
      // Ensure the chart has proper dimensions before updating
      const minWidth = Math.max(window.innerWidth, 1500);
      if (chartRef.current) {
        chartRef.current.style.width = `${minWidth}px`;
        chartRef.current.style.height = `calc(100vh - 80px)`;
      }

      // Force a resize before updating options to ensure the chart area is properly sized
      chartInstanceRef.current.resize();

      // Create explicit node layout constraints to enforce fixed order
      const levels: Record<string, string[]> = {
        "0": [], // Level 0 (first column)
        "1": [], // Level 1 (second column)
        "2": [], // Level 2 (third column)
      };

      // Create custom node order based on our fixed order reference
      const nodeOrder: Record<string, number> = {};

      // Place nodes in their appropriate levels
      sankeyData.nodes.forEach((node) => {
        const idx = Number(node.name.match(/\[(\d+)\]/)?.[1]);
        if (idx === 0) {
          // Root node (Expenses) always goes in first column at top
          levels["0"].push(node.name);
          nodeOrder[node.name] = 0;
        } else {
          // Find this node's parent
          let parentLevel = null;
          for (const [parentIdx, children] of Object.entries(parentChildMap)) {
            if ((children as number[]).includes(idx)) {
              parentLevel = parentIdx === "0" ? "1" : "2";
              break;
            }
          }

          // If it's a direct child of Expenses, use our fixed order
          if (parentLevel === "1" && node.name in fixedNodeOrderRef.current) {
            levels["1"].push(node.name);
            nodeOrder[node.name] = fixedNodeOrderRef.current[node.name] + 1; // +1 because 0 is reserved for Expenses
          }
          // Otherwise place in appropriate level
          else if (parentLevel) {
            levels[parentLevel].push(node.name);
            // Just use any order for non top-level parents
            nodeOrder[node.name] = levels[parentLevel].length;
          }
        }
      });

      const option = {
        animation: false, // Disable animation for initial load for faster rendering
        progressive: 500, // Enable progressive rendering for large datasets
        progressiveThreshold: 1000,
        title: {
          text: "Sankey Diagram",
          left: "center",
          textStyle: { color: "#fff" },
        },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: (params: { dataType: string; name: string }) => {
            const { dataType, name } = params;
            if (dataType === "node") {
              const idx = Number(name.match(/\[(\d+)\]/)?.[1]);
              const cost = sankeyData.nodeCostMap[name];
              const displayText = displayName(name);

              // Check if this is a parent node
              const isParent =
                parentChildMap[String(idx)] &&
                Array.isArray(parentChildMap[String(idx)]) &&
                parentChildMap[String(idx)].length > 0;

              if (isParent) {
                const isCollapsed = collapsedNodes.includes(idx);

                // Get child count for parent nodes
                const childCount = parentChildMap[String(idx)]?.length || 0;

                return `<div style="padding: 8px; max-width: 250px;">
                  <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${displayText}</div>
                  <div>Total: ${cost}</div>
                  <div>Children: ${childCount}</div>
                  <div style="margin-top: 12px; padding: 8px; background: ${
                    isCollapsed ? "#4a5568" : "#2d3748"
                  }; 
                              border-radius: 4px; cursor: pointer; text-align: center; font-weight: bold;">
                    ${
                      isCollapsed
                        ? "📦 Click to expand children"
                        : "📂 Click to collapse children"
                    }
                  </div>
                </div>`;
              }

              return `<div style="padding: 8px;">
                <div style="font-weight: bold; font-size: 14px;">${displayText}</div>
                <div>Amount: ${cost}</div>
              </div>`;
            }
            return "";
          },
        },
        grid: {
          containLabel: true,
          left: "5%",
          right: "5%",
          top: "5%",
          bottom: "5%",
          height: "auto",
        },
        series: [
          {
            type: "sankey",
            data: sankeyData.nodes,
            links: sankeyData.links,
            emphasis: {
              focus: "adjacency",
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(255, 255, 255, 0.5)",
              },
              label: {
                fontWeight: "bold",
                fontSize: 16,
              },
            },
            nodeWidth: 24,
            nodeGap: 30,
            layoutIterations: 32, // Reduced iterations for faster initial layout
            orient: "horizontal",
            lineStyle: {
              color: "source",
              opacity: 0.6,
              curveness: 0.7,
            },
            levels: [
              { depth: 0, itemStyle: { color: null } },
              { depth: 1, itemStyle: { color: null } },
              { depth: 2, itemStyle: { color: null } },
            ],
            layoutConstraint: {
              nodeGap: 30,
              nodeWidth: 24,
              nodePosition: Object.keys(nodeOrder).map((nodeName) => {
                return {
                  name: nodeName,
                  value: nodeOrder[nodeName] * 1.5,
                };
              }),
            },
            label: {
              color: "#fff",
              fontWeight: "bold",
              fontSize: 14,
              formatter: (params: { name: string }) => {
                const cost = sankeyData.nodeCostMap[params.name];
                const displayText = displayName(params.name);
                const idx = Number(params.name.match(/\[(\d+)\]/)?.[1]);

                // Check if this is a parent node
                const isParent =
                  parentChildMap[String(idx)] &&
                  Array.isArray(parentChildMap[String(idx)]) &&
                  parentChildMap[String(idx)].length > 0;

                if (isParent) {
                  const isCollapsed = collapsedNodes.includes(idx);
                  const childCount = parentChildMap[String(idx)]?.length || 0;

                  // Make collapsible nodes more obvious with better icons and formatting
                  return `${displayText} (${cost}) ${
                    isCollapsed
                      ? "📦" // A box icon for collapsed state
                      : "📂" // An open folder for expanded state
                  } [${childCount}]`;
                }

                return `${displayText} (${cost})`;
              },
            },
            draggable: true,
          },
        ],
        layout: {
          rankdir: "LR",
          nodesep: 50,
          ranksep: 150,
          align: "justify", //options: "center", "justify", "left", "right"
        },
      };

      // If chart is still valid, update it with performance optimizations
      if (!chartInstanceRef.current.isDisposed()) {
        chartInstanceRef.current.setOption(option, {
          notMerge: false,
          replaceMerge: ["series"],
          lazyUpdate: true, // Enable lazy update for better performance
        });

        // Re-attach click event
        chartInstanceRef.current.off("click");
        chartInstanceRef.current.on("click", (params: { name: string }) => {
          try {
            const nodeName = params.name;
            const idx = Number(nodeName.match(/\[(\d+)\]/)?.[1]);
            const isParent =
              parentChildMap[String(idx)] &&
              Array.isArray(parentChildMap[String(idx)]) &&
              parentChildMap[String(idx)].length > 0;
            if (isParent) {
              setCollapsedNodes((prev) => {
                if (prev.includes(idx)) {
                  return prev.filter((id) => id !== idx);
                } else {
                  return [...prev, idx];
                }
              });
            } else if (!parentChildMap[String(idx)]) {
              setModalNode({ name: nodeName, idx });
              setModalValue((sankeyData.nodeCostMap[nodeName] || 0).toString());
              let currentParent = "";
              for (const [parentIdx, children] of Object.entries(
                parentChildMap
              )) {
                if ((children as number[]).includes(idx)) {
                  currentParent = getNodeNameByIndex(
                    nodesData,
                    Number(parentIdx)
                  );
                  break;
                }
              }
              const options = getAllParentOptions(idx);
              if (!options.includes("Create New Parent"))
                options.push("Create New Parent");
              setModalParent(currentParent);
              setModalParentOptions(options);
              setModalOpen(true);
            }
          } catch (error) {
            console.error("Error handling chart click:", error);
          }
        });

        // Enable animation after initial load for a better UX
        setTimeout(() => {
          chartInstanceRef.current?.setOption({ animation: true });
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating chart:", error);
    }
  }, [
    sankeyData,
    parentChildMap,
    collapsedNodes,
    getAllParentOptions,
    nodesData,
  ]);

  // Update sankeyData when collapsedNodes state changes (re-add this effect)
  useEffect(() => {
    // Rebuild sankey data with current collapsed nodes
    const newSankeyData = buildSankeyData(
      nodesData,
      parentChildMap,
      collapsedNodes
    );
    setSankeyData(newSankeyData);
  }, [collapsedNodes, nodesData, parentChildMap]);

  // Add this enhanced helper function for direct parent lookup with multiple strategies
  const findParentByDisplayName = (name: string) => {
    if (!name) return null;
    console.log(`Searching for parent with display name: "${name}"`);

    const normalizedName = name.toLowerCase().trim();

    // Strategy 1: Check for exact index in the name
    const indexMatch = name.match(/\[(\d+)\]$/);
    if (indexMatch) {
      const idx = Number(indexMatch[1]);
      const parent = nodesData.nodes.find((n) => n.index === idx);
      if (parent) {
        console.log(`Found parent by exact index [${idx}]: ${parent.name}`);
        return parent;
      }
    }

    // Strategy 2: Special handling for Fast Food
    if (normalizedName === "fast food") {
      // First try exact match for "Fast Food"
      const fastFoodNode = nodesData.nodes.find(
        (n) => n.name.toLowerCase() === "fast food"
      );

      if (fastFoodNode) {
        console.log(
          `Found Fast Food parent by exact name: ${fastFoodNode.name} [${fastFoodNode.index}]`
        );
        return fastFoodNode;
      }

      // Then try to find food-related parent nodes
      for (const [parentIdx] of Object.entries(parentChildMap)) {
        const parentNodeIdx = Number(parentIdx);
        const parent = nodesData.nodes.find((n) => n.index === parentNodeIdx);

        if (
          parent &&
          (parent.name.toLowerCase().includes("food") ||
            parent.name.toLowerCase().includes("restaurant"))
        ) {
          console.log(
            `Found Fast Food related parent: ${parent.name} [${parent.index}]`
          );
          return parent;
        }
      }
    }

    // Strategy 3: Exact name match of any parent
    for (const [parentIdx] of Object.entries(parentChildMap)) {
      const parentNodeIdx = Number(parentIdx);
      const parent = nodesData.nodes.find((n) => n.index === parentNodeIdx);

      if (parent && parent.name.toLowerCase() === normalizedName) {
        console.log(
          `Found parent by exact name: ${parent.name} [${parent.index}]`
        );
        return parent;
      }
    }

    // Strategy 4: Substring match for any parent
    for (const [parentIdx] of Object.entries(parentChildMap)) {
      const parentNodeIdx = Number(parentIdx);
      const parent = nodesData.nodes.find((n) => n.index === parentNodeIdx);

      if (parent && parent.name.toLowerCase().includes(normalizedName)) {
        console.log(
          `Found parent by substring match: ${parent.name} [${parent.index}]`
        );
        return parent;
      }
    }

    // Strategy 5: Check if any parent name contains words from the search
    const words = normalizedName.split(/\s+/).filter((w) => w.length > 2);
    if (words.length > 0) {
      for (const [parentIdx] of Object.entries(parentChildMap)) {
        const parentNodeIdx = Number(parentIdx);
        const parent = nodesData.nodes.find((n) => n.index === parentNodeIdx);

        if (parent) {
          for (const word of words) {
            if (parent.name.toLowerCase().includes(word)) {
              console.log(
                `Found parent by word match "${word}": ${parent.name} [${parent.index}]`
              );
              return parent;
            }
          }
        }
      }
    }

    // Strategy 6: If all else fails, default to Expenses (root)
    const rootNode = nodesData.nodes.find((n) => n.index === 0);
    if (rootNode) {
      console.log(
        `Defaulting to root node: ${rootNode.name} [${rootNode.index}]`
      );
      return rootNode;
    }

    console.log(`No matching parent found for "${name}"`);
    return null;
  };

  // Handle modal submit (change value and/or parent)
  const handleModalSubmit = (newParentName: string, newPrice: number) => {
    try {
      if (!modalNode) return;
      const idx = modalNode.idx;

      console.log("======= PARENT CHANGE OPERATION =======");
      console.log(
        `Attempting to move node ${idx} from current parent to: "${newParentName}"`
      );

      // Find current parent index
      let currentParentIdx = null;
      for (const [parentIdx, children] of Object.entries(parentChildMap)) {
        if ((children as number[]).includes(idx)) {
          currentParentIdx = Number(parentIdx);
          break;
        }
      }

      console.log(
        `Moving node ${idx} from parent ${currentParentIdx} to ${newParentName}`
      );

      // Create a safe copy of the data before modifications
      let safeNodes = JSON.parse(JSON.stringify(nodesData.nodes));
      const safeParentChildMap = JSON.parse(JSON.stringify(parentChildMap));

      let newParentIdx = null;

      // Close modal first to avoid UI issues during processing
      setModalOpen(false);

      // If newParentName is 'Create New Parent', create a new parent node
      if (newParentName === "Create New Parent") {
        let realName = prompt(
          "Enter a name for the new parent node:",
          "New Parent"
        );
        if (!realName) realName = "New Parent";
        const newIdx =
          Math.max(...safeNodes.map((n: { index: number }) => n.index)) + 1;
        const newParentNode = {
          name: realName,
          index: newIdx,
          cost: newPrice,
        };
        safeNodes.push(newParentNode);
        newParentIdx = newIdx;

        // The expensesName reference is correct, but we don't have direct access to links here
        // Instead, we'll handle this in the buildSankeyData function when we rebuild
        const expensesName = getNodeNameByIndex(nodesData, 0);
        const newParentName = `${realName} [${newIdx}]`;

        // No need to manually add links here as they'll be created during buildSankeyData
      } else {
        // Use our improved parent lookup function
        const parentNode = findParentByDisplayName(newParentName);

        if (parentNode) {
          newParentIdx = parentNode.index;
          console.log(
            `Found parent node: ${parentNode.name} [${newParentIdx}]`
          );
        } else {
          console.error(
            `Could not find parent node for name: ${newParentName}`
          );
          alert(
            `Could not find a parent node matching "${newParentName}". The operation will be cancelled.`
          );
          return;
        }
      }

      console.log(`New parent index determined: ${newParentIdx}`);

      if (newParentIdx !== null) {
        // Remember if we're removing a node from a parent
        let willRemoveParent = false;
        let parentToRemove = null;

        // Check if current parent will become empty
        if (currentParentIdx !== null && currentParentIdx !== 0) {
          // Skip removal for root node
          const currentChildren = safeParentChildMap[
            String(currentParentIdx)
          ] as number[];
          if (
            currentChildren &&
            currentChildren.length === 1 &&
            currentChildren[0] === idx
          ) {
            willRemoveParent = true;
            parentToRemove = currentParentIdx;
            console.log(
              `Parent ${currentParentIdx} will be removed as it will have no children left`
            );
          }
        }

        // Update node cost first
        for (let i = 0; i < safeNodes.length; i++) {
          if (safeNodes[i].index === idx) {
            safeNodes[i].cost = newPrice;
            break;
          }
        }

        // Remove node from all existing parents
        for (const [parentIdx, children] of Object.entries(
          safeParentChildMap
        )) {
          safeParentChildMap[parentIdx] = (children as number[]).filter(
            (c) => c !== idx
          );
        }

        // Add node to new parent
        if (!safeParentChildMap[String(newParentIdx)]) {
          safeParentChildMap[String(newParentIdx)] = [];
        }

        if (!safeParentChildMap[String(newParentIdx)].includes(idx)) {
          safeParentChildMap[String(newParentIdx)].push(idx);
        }

        // Clean up any empty arrays
        Object.keys(safeParentChildMap).forEach((k) => {
          if (
            Array.isArray(safeParentChildMap[k]) &&
            safeParentChildMap[k].length === 0
          ) {
            // Remove from fixed node order if exists
            const parentNode = nodesData.nodes.find(
              (n) => n.index === Number(k)
            );
            if (parentNode) {
              const nodeName = `${parentNode.name} [${k}]`;
              delete fixedNodeOrderRef.current[nodeName];
            }
            delete safeParentChildMap[k];
          }
        });

        // After parent cleanup, update fixed node order for remaining top-level parents
        const currentTopLevelParents = (parentChildMap["0"] || []).filter(
          (idx) => safeParentChildMap[String(idx)]?.length > 0
        );

        currentTopLevelParents.forEach((idx, order) => {
          const node = nodesData.nodes.find((n) => n.index === idx);
          if (node) {
            const nodeName = `${node.name} [${node.index}]`;
            if (!(nodeName in fixedNodeOrderRef.current)) {
              fixedNodeOrderRef.current[nodeName] = Object.keys(
                fixedNodeOrderRef.current
              ).length;
            }
          }
        });
      } else {
        console.error("Failed to determine a new parent index");
        alert(
          "Could not find a valid parent. The operation will be cancelled."
        );
        return;
      }

      // Before updating state
      // If we're adding a new top-level parent, add it to our fixed order
      if (newParentName === "Create New Parent") {
        const newParentIdx = Math.max(
          ...safeNodes.map((n: { index: number }) => n.index)
        );

        // Check if it will be a direct child of Expenses
        const rootChildren = safeParentChildMap["0"] || [];
        if (rootChildren.includes(newParentIdx)) {
          // Find the maximum order and add this new node after it
          const maxOrder = Object.values(fixedNodeOrderRef.current).reduce(
            (max, order) => Math.max(max, order),
            0
          );

          // Create a node name that matches what will be generated
          let realName = "New Parent"; // default fallback
          const newNode = safeNodes.find(
            (n: { index: number }) => n.index === newParentIdx
          );
          if (newNode) {
            realName = newNode.name;
          }

          const newNodeName = `${realName} [${newParentIdx}]`;
          fixedNodeOrderRef.current[newNodeName] = maxOrder + 1;
          console.log(
            `Added new parent to fixed order: ${newNodeName} at position ${
              maxOrder + 1
            }`
          );
        }
      }

      // Update the state in a controlled sequence to avoid blank screen
      // First update the data models
      const updatedNodes = { ...nodesData, nodes: safeNodes };
      setNodesData(updatedNodes);
      setParentChildMap(safeParentChildMap);

      // Rebuild Sankey data with new structure
      try {
        const newSankeyData = buildSankeyData(
          updatedNodes,
          safeParentChildMap,
          collapsedNodes
        );
        console.log("Successfully built new sankey data");
        setSankeyData(newSankeyData);
      } catch (sankeyError) {
        console.error("Error building sankey data:", sankeyError);
        alert("An error occurred while updating the chart. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleModalSubmit:", error);
      alert(
        "An error occurred while processing your request. Please try again."
      );
    }
  };

  return (
    <>
      <div
        ref={chartRef}
        id="main"
        style={{
          width: "max(100vw, 1500px)",
          height: "calc(100vh - 80px)",
          background: "#181f2a",
          borderRadius: "0px",
          minWidth: "100%",
          paddingBottom: "20px",
          willChange: "transform", // Hint to browser to use GPU acceleration
          contain: "content", // Improve rendering performance
        }}
      />
      {modalOpen && modalNode && (
        <InputModal
          clickedNode={{
            name: displayName(modalNode.name),
            index: modalNode.idx,
            visible: true,
            isleaf: true,
          }}
          initialParentName={displayName(modalParent)}
          initialPrice={modalValue}
          onSubmit={handleModalSubmit}
          onClose={() => setModalOpen(false)}
          parentOptions={modalParentOptions.map(displayName)}
        />
      )}
    </>
  );
};

export default EChartsSankeyComponent;
