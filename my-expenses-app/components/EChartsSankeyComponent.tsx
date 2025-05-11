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
    color: string;
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
  parentChildMap: Record<string, number[]>
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

    // Build unique node names
    const nodes: EChartNode[] = nodesData.nodes.map((n) => ({
      name: `${n.name} [${n.index}]`,
    }));

    const links: EChartLink[] = [];
    for (const [parentIdx, children] of Object.entries(parentChildMap)) {
      if (!children || !Array.isArray(children)) continue;

      const parentName = getNodeNameByIndex(nodesData, Number(parentIdx));
      if (!parentName) continue;

      for (const childIdx of children as number[]) {
        const childNode = nodesData.nodes.find((n) => n.index === childIdx);
        if (!childNode) continue;

        links.push({
          source: parentName,
          target: getNodeNameByIndex(nodesData, childIdx),
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
      nodes.forEach((node) => {
        if (nodeColorMap[node.name]) {
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

          const value = children
            .map((childIdx) => {
              const childNode = nodesData.nodes.find(
                (n) => n.index === childIdx
              );
              return childNode?.cost || 1;
            })
            .reduce((a, b) => a + b, 0);

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
  const [sankeyData, setSankeyData] = useState(() =>
    buildSankeyData(nodesData, parentChildMap)
  );
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  );

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

  // Update chart when sankeyData changes
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // Dispose of any existing chart instance
      const existingChart = echarts.getInstanceByDom(chartRef.current);
      if (existingChart) {
        existingChart.dispose();
      }

      // Create new chart
      const myChart = echarts.init(chartRef.current);
      setChartInstance(myChart);

      const option: EChartsOption = {
        title: {
          text: "Sankey Diagram",
          left: "center",
          textStyle: { color: "#fff" },
        },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
        },
        series: [
          {
            type: "sankey",
            data: sankeyData.nodes,
            links: sankeyData.links,
            emphasis: {
              focus: "adjacency",
            },
            lineStyle: {
              color: "source",
              opacity: 0.6,
              curveness: 0.5,
            },
            label: {
              color: "#fff",
              fontWeight: "bold",
              formatter: (params: any) => {
                const cost = sankeyData.nodeCostMap[params.name];
                return `${displayName(params.name)} (${cost})`;
              },
            },
          },
        ],
      };

      myChart.setOption(option);

      const handleResize = () => {
        if (myChart && !myChart.isDisposed()) {
          myChart.resize();
        }
      };

      window.addEventListener("resize", handleResize);

      // Add click event for editing
      myChart.off("click");
      myChart.on("click", (params: any) => {
        try {
          // Only allow editing for leaf nodes (no children)
          const nodeName = params.name;
          const idx = Number(nodeName.match(/\[(\d+)\]/)?.[1]);
          // If node is not a parent in parentChildMap, it's a leaf
          if (!parentChildMap[String(idx)]) {
            setModalNode({ ...params, idx });
            setModalValue((sankeyData.nodeCostMap[nodeName] || 0).toString());
            // Find current parent
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

      return () => {
        if (myChart && !myChart.isDisposed()) {
          myChart.dispose();
        }
        window.removeEventListener("resize", handleResize);
      };
    } catch (error) {
      console.error("Error initializing chart:", error);
    }
  }, [sankeyData, parentChildMap]);

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

      // console.log(
      //   "Updating with new parentChildMap:",
      //   JSON.stringify(safeParentChildMap, null, 2)
      // );

      // First close the modal to avoid UI issues
      setModalOpen(false);

      // Update the state in a safer way
      const updatedNodes = { ...nodesData, nodes: safeNodes };
      setNodesData(updatedNodes);
      setParentChildMap(safeParentChildMap);

      // Rebuild Sankey data with new structure - wrap in try/catch for safety
      try {
        const newSankeyData = buildSankeyData(updatedNodes, safeParentChildMap);
        console.log("Successfully built new sankey data");
        setSankeyData(newSankeyData);

        // Force redraw of the chart after a brief delay
        setTimeout(() => {
          if (
            chartRef.current &&
            chartInstance &&
            !chartInstance.isDisposed()
          ) {
            try {
              chartInstance.setOption({}, true);
              console.log("Chart successfully redrawn");
            } catch (chartError) {
              console.error("Error updating chart:", chartError);

              // If chart update fails, try re-initializing the chart
              try {
                chartInstance.dispose();
                const newChart = echarts.init(chartRef.current);
                setChartInstance(newChart);

                const option: EChartsOption = {
                  title: {
                    text: "Sankey Diagram",
                    left: "center",
                    textStyle: { color: "#fff" },
                  },
                  tooltip: {
                    trigger: "item",
                    triggerOn: "mousemove",
                  },
                  series: [
                    {
                      type: "sankey",
                      data: newSankeyData.nodes,
                      links: newSankeyData.links,
                      emphasis: {
                        focus: "adjacency",
                      },
                      lineStyle: {
                        color: "source",
                        opacity: 0.6,
                        curveness: 0.5,
                      },
                      label: {
                        color: "#fff",
                        fontWeight: "bold",
                        formatter: (params: any) => {
                          const cost = newSankeyData.nodeCostMap[params.name];
                          return `${displayName(params.name)} (${cost})`;
                        },
                      },
                    },
                  ],
                };

                newChart.setOption(option);
                console.log("Chart successfully re-initialized");
              } catch (reinitError) {
                console.error("Error re-initializing chart:", reinitError);
              }
            }
          }
        }, 100);
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
          width: "90vw",
          height: "80vh",
          background: "#181f2a",
          borderRadius: 12,
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
