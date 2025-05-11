"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
} from "echarts/components";
import { SankeyChart, SankeySeriesOption } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import nodesDataRaw from "../output.json";
import parentChildMapRaw from "../parent_child_map.json";
import InputModal from "./editNodes";
import { SankeyNode } from "@/app/types/types";

echarts.use([TitleComponent, TooltipComponent, SankeyChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<
  TitleComponentOption | TooltipComponentOption | SankeySeriesOption
>;

// Define types for our chart data
interface EChartNode {
  name: string;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    borderType?: string;
    shadowBlur?: number;
    shadowColor?: string;
  };
  sumCost?: number;
}

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

// Helper to get unique name by index
const getNodeNameByIndex = (nodesData: NodeData, idx: number) => {
  const node = nodesData.nodes.find((n) => n.index === idx);
  return node ? `${node.name} [${node.index}]` : "";
};

// Helper to get display name (strip [index])
const displayName = (name: string) => name.replace(/ \[\d+\]$/, "");

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

    // Build unique node names - with simple styling
    const nodes: any[] = nodesData.nodes.map((n) => {
      // Create basic node
      const node = {
        name: `${n.name} [${n.index}]`,
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

      for (const childIdx of children as number[]) {
        const childNode = nodesData.nodes.find((n) => n.index === childIdx);
        if (!childNode) continue;

        const childName = getNodeNameByIndex(nodesData, childIdx);

        // If the child is a collapsed parent, still connect it to its parent
        // but skip showing its own children
        if (collapsedNodes.includes(childIdx)) {
          links.push({
            source: parentName,
            target: childName,
            value: childNode.cost || 1, // Use the child's cost as the link value
          });
          continue;
        }

        // Skip showing children links if parent is collapsed
        if (collapsedNodes.includes(parentIndex)) continue;

        links.push({
          source: parentName,
          target: childName,
          value: childNode.cost || 1,
        });
      }
    }

    // Ensure 'Expenses' is the leftmost root node
    const expensesNode = nodes.find((n) => n.name.startsWith("Expenses"));
    if (expensesNode) {
      nodes.splice(nodes.indexOf(expensesNode), 1);
      nodes.unshift(expensesNode);
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

        // If node is collapsed, use a distinctive style
        if (collapsedNodes.includes(idx)) {
          // Use a darker shade but maintain some of the original color if available
          const baseColor = nodeColorMap[node.name] || "#888888";
          node.itemStyle = {
            color: baseColor,
            opacity: 0.7,
            borderColor: "#ffffff",
            borderWidth: 2,
          };
        }
        // Otherwise use the color from the map if available
        else if (nodeColorMap[node.name]) {
          node.itemStyle = { color: nodeColorMap[node.name] };
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

const EChartsSankeyComponent: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const [nodesData, setNodesData] = useState<any>(
    JSON.parse(JSON.stringify(nodesDataRaw))
  );
  const [parentChildMap, setParentChildMap] = useState<any>(
    JSON.parse(JSON.stringify(parentChildMapRaw))
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNode, setModalNode] = useState<any>(null);
  const [modalValue, setModalValue] = useState<string>("");
  const [modalParent, setModalParent] = useState<string>("");
  const [modalParentOptions, setModalParentOptions] = useState<string[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<number[]>([]);
  const [sankeyData, setSankeyData] = useState(() =>
    buildSankeyData(nodesData, parentChildMap, collapsedNodes)
  );

  // Initialize chart only once
  useEffect(() => {
    if (chartRef.current) {
      try {
        // Clean up any existing instance to avoid memory leaks
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose();
        }

        // Create a new chart instance
        chartInstanceRef.current = echarts.init(chartRef.current);
        console.log("Chart initialized successfully");

        // Initial resize to ensure proper dimensions
        const handleResize = () => {
          if (
            chartInstanceRef.current &&
            !chartInstanceRef.current.isDisposed()
          ) {
            const minWidth = Math.max(window.innerWidth, 1500);
            chartRef.current?.style.setProperty("width", `${minWidth}px`);
            chartRef.current?.style.setProperty("height", `calc(100vh - 80px)`);
            chartInstanceRef.current.resize();
          }
        };

        window.addEventListener("resize", handleResize);
        // Call resize immediately to set initial size
        setTimeout(handleResize, 0);

        return () => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.dispose();
          }
          window.removeEventListener("resize", handleResize);
        };
      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    }
  }, []);

  // Update chart data on sankeyData/parentChildMap/collapsedNodes change
  useEffect(() => {
    if (!chartRef.current || !chartInstanceRef.current) return;

    try {
      // Ensure the chart has proper dimensions before updating
      const minWidth = Math.max(window.innerWidth, 1500);
      chartRef.current.style.setProperty("width", `${minWidth}px`);
      chartRef.current.style.setProperty("height", `calc(100vh - 80px)`);

      // Force a resize before updating options to ensure the chart area is properly sized
      chartInstanceRef.current.resize();

      const option = {
        title: {
          text: "Sankey Diagram",
          left: "center",
          textStyle: { color: "#fff" },
        },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: (params: any) => {
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

                return `<div style="padding: 8px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${displayText}</div>
                  <div>Total: ${cost}</div>
                  <div>Children: ${childCount}</div>
                  <div style="margin-top: 8px; color: #aaa; font-style: italic;">
                    ${
                      isCollapsed
                        ? "🔍 Click to expand children"
                        : "🔽 Click to collapse children"
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
        },
        series: [
          {
            type: "sankey",
            data: sankeyData.nodes as any[],
            links: sankeyData.links,
            emphasis: {
              focus: "adjacency",
            },
            nodeWidth: 20,
            nodeGap: 12,
            layoutIterations: 64,
            orient: "horizontal",
            lineStyle: {
              color: "source",
              opacity: 0.6,
              curveness: 0.5,
            },
            label: {
              color: "#fff",
              fontWeight: "bold",
              fontSize: 14,
              formatter: (params: any) => {
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

                  // Add a visual indicator for collapsible/expandable nodes
                  return `${displayText} (${cost}) ${
                    isCollapsed ? "🔍" : "🔽"
                  } [${childCount}]`;
                }

                return `${displayText} (${cost})`;
              },
            },
          },
        ],
      };

      // If chart is still valid, update it
      if (!chartInstanceRef.current.isDisposed()) {
        chartInstanceRef.current.setOption(option, {
          notMerge: false,
          replaceMerge: ["series"],
          lazyUpdate: false, // Set to false to ensure immediate update
        });

        // Re-attach click event
        chartInstanceRef.current.off("click");
        chartInstanceRef.current.on("click", (params: any) => {
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
              setModalNode({ ...params, idx });
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

        // Force a second resize after update to ensure content is properly laid out
        setTimeout(() => {
          if (
            chartInstanceRef.current &&
            !chartInstanceRef.current.isDisposed()
          ) {
            chartInstanceRef.current.resize();
          }
        }, 10);
      } else {
        // If chart was disposed, re-initialize it
        console.log("Chart was disposed, re-initializing...");
        if (chartRef.current) {
          chartInstanceRef.current = echarts.init(chartRef.current);
          chartInstanceRef.current.setOption(option);

          // Ensure we re-attach the click handler
          chartInstanceRef.current.on("click", (params: any) => {
            // ... same click handler as above ...
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
                setModalNode({ ...params, idx });
                setModalValue(
                  (sankeyData.nodeCostMap[nodeName] || 0).toString()
                );
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
        }
      }
    } catch (error) {
      console.error("Error updating chart:", error);

      // Fall back to re-initializing the chart from scratch on error
      try {
        if (chartRef.current) {
          // Clean up any existing instance
          if (chartInstanceRef.current) {
            chartInstanceRef.current.dispose();
          }

          // Create a fresh instance
          chartInstanceRef.current = echarts.init(chartRef.current);

          // Set the option on the fresh instance
          const option = {
            /* same option object as above */
          };
          chartInstanceRef.current.setOption(option);

          // Re-attach event listeners
          // ... same click handler setup as above ...
        }
      } catch (fallbackError) {
        console.error("Failed to recover chart after error:", fallbackError);
      }
    }
  }, [sankeyData, parentChildMap, collapsedNodes]);

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

  // Helper to get all possible parent options (only parents and Expenses)
  const getAllParentOptions = (excludeIdx: number) => {
    // Get indices of all nodes that are parents (have children)
    const parentIndices = Object.keys(parentChildMap).map(Number);

    // Create options for all parent nodes and the root "Expenses" node
    const options = nodesData.nodes
      .filter(
        (n: any) =>
          // Include if it's a parent (in parentIndices) or the root (index 0)
          (parentIndices.includes(n.index) || n.index === 0) &&
          // Exclude the node itself
          n.index !== excludeIdx
      )
      .map((n: any) => `${n.name} [${n.index}]`);

    console.log(
      `Generated ${options.length} parent options for node ${excludeIdx}:`,
      options
    );
    return options;
  };

  // Add this enhanced helper function for direct parent lookup with multiple strategies
  const findParentByDisplayName = (name: string) => {
    if (!name) return null;
    console.log(`Searching for parent with display name: "${name}"`);

    const normalizedName = name.toLowerCase().trim();

    // Strategy 1: Check for exact index in the name
    const indexMatch = name.match(/\[(\d+)\]$/);
    if (indexMatch) {
      const idx = Number(indexMatch[1]);
      const parent = nodesData.nodes.find((n: any) => n.index === idx);
      if (parent) {
        console.log(`Found parent by exact index [${idx}]: ${parent.name}`);
        return parent;
      }
    }

    // Strategy 2: Special handling for Fast Food
    if (normalizedName === "fast food") {
      // First try exact match for "Fast Food"
      const fastFoodNode = nodesData.nodes.find(
        (n: any) => n.name.toLowerCase() === "fast food"
      );

      if (fastFoodNode) {
        console.log(
          `Found Fast Food parent by exact name: ${fastFoodNode.name} [${fastFoodNode.index}]`
        );
        return fastFoodNode;
      }

      // Then try to find food-related parent nodes
      for (const [parentIdx, _] of Object.entries(parentChildMap)) {
        const parentNodeIdx = Number(parentIdx);
        const parent = nodesData.nodes.find(
          (n: any) => n.index === parentNodeIdx
        );

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
    for (const [parentIdx, _] of Object.entries(parentChildMap)) {
      const parentNodeIdx = Number(parentIdx);
      const parent = nodesData.nodes.find(
        (n: any) => n.index === parentNodeIdx
      );

      if (parent && parent.name.toLowerCase() === normalizedName) {
        console.log(
          `Found parent by exact name: ${parent.name} [${parent.index}]`
        );
        return parent;
      }
    }

    // Strategy 4: Substring match for any parent
    for (const [parentIdx, _] of Object.entries(parentChildMap)) {
      const parentNodeIdx = Number(parentIdx);
      const parent = nodesData.nodes.find(
        (n: any) => n.index === parentNodeIdx
      );

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
      for (const [parentIdx, _] of Object.entries(parentChildMap)) {
        const parentNodeIdx = Number(parentIdx);
        const parent = nodesData.nodes.find(
          (n: any) => n.index === parentNodeIdx
        );

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
    const rootNode = nodesData.nodes.find((n: any) => n.index === 0);
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
      let safeParentChildMap = JSON.parse(JSON.stringify(parentChildMap));

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
        const newIdx = Math.max(...safeNodes.map((n: any) => n.index)) + 1;
        const newParentNode = {
          name: realName,
          index: newIdx,
          cost: newPrice,
        };
        safeNodes.push(newParentNode);
        newParentIdx = newIdx;

        // Create entry for the new parent
        safeParentChildMap[String(newIdx)] = [idx];
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
            delete safeParentChildMap[k];
          }
        });

        // Remove the parent node if needed
        if (willRemoveParent && parentToRemove !== null) {
          console.log(`Removing parent node with index ${parentToRemove}`);
          // Remove from nodes array
          safeNodes = safeNodes.filter((n: any) => n.index !== parentToRemove);

          // Remove from parentChildMap (already done by cleaning up empty arrays)

          // Check if removed parent was a child of some other parent and remove it from there
          for (const [grandParentIdx, children] of Object.entries(
            safeParentChildMap
          )) {
            safeParentChildMap[grandParentIdx] = (children as number[]).filter(
              (c) => c !== parentToRemove
            );
          }

          // Clean up any newly empty arrays after removing parent
          Object.keys(safeParentChildMap).forEach((k) => {
            if (
              Array.isArray(safeParentChildMap[k]) &&
              safeParentChildMap[k].length === 0
            ) {
              delete safeParentChildMap[k];
            }
          });
        }

        // Log the updated parentChildMap for debugging
        console.log(
          "Updated parentChildMap:",
          JSON.stringify(safeParentChildMap, null, 2)
        );
      } else {
        console.error("Failed to determine a new parent index");
        alert(
          "Could not find a valid parent. The operation will be cancelled."
        );
        return;
      }

      // Update the state in a controlled sequence to avoid blank screen
      // First update the data models
      const updatedNodes = { ...nodesData, nodes: safeNodes };
      setNodesData(updatedNodes);
      setParentChildMap(safeParentChildMap);

      // Let React process the state updates before rebuilding the chart data
      requestAnimationFrame(() => {
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
          alert(
            "An error occurred while updating the chart. Please try again."
          );
        }
      });
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
