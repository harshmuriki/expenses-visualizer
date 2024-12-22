"use client";

import React, { useState } from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import MyCustomNode from "./MyCustomNode";
import {
  data0,
  testdatamini,
  calculateLinks,
  parentChildMap_testdatamini,
} from "@/data/testData";

const SankeyChartComponent = () => {
  const data_test = calculateLinks(
    testdatamini.nodes,
    parentChildMap_testdatamini
  );
  // console.log(data_test);
  // Calculate the number of nodes
  const [dataValue, setDataValue] = useState(data_test);
  const numberOfNodes = dataValue.nodes.length;
  const [editingNode, setEditingNode] = useState<{
    index: number;
    value: string | null;
  }>({ index: -1, value: null });

  // Define base dimensions
  // const baseWidth = 500;
  const baseWidth = numberOfNodes * 100; // or 40 for big Wider base width

  const baseHeight = numberOfNodes;

  // Adjust dimensions based on the number of nodes
  const adjustedWidth = baseWidth + numberOfNodes * 1; // Add 100 units per node
  const adjustedHeight = baseHeight + numberOfNodes * 50; // Add 50 units per node

  const margin = {
    left: Math.min(200, numberOfNodes * 20),
    right: Math.min(200, numberOfNodes * 20),
    top: 100,
    bottom: 100,
  };

  const handleNodeClick = (nodeId: string) => {
    setDataValue((prevData) => {
      // Find the index of the clicked node
      const nodeIndex = prevData.nodes.findIndex(
        (node) => node.name === nodeId
      );
      const isLeafNode = !dataValue.links.some(
        (link) => link.source === nodeIndex
      );
      if (isLeafNode) {
        setEditingNode({
          index: nodeIndex,
          value: dataValue.nodes[nodeIndex].value?.toString() || "",
        });
      }

      // If not a leaf node, return the data unchanged
      return prevData;
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingNode((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleInputBlur = () => {
    if (editingNode.index !== -1 && editingNode.value !== null) {
      const newValue = parseFloat(editingNode.value);
      if (!isNaN(newValue)) {
        setDataValue((prevData) => {
          const updatedLinks = prevData.links.map((link) => {
            if (link.target === editingNode.index) {
              return { ...link, value: newValue };
            }
            return link;
          });
          // Propagate changes to parent nodes
          const updatedNodes = prevData.nodes.map((node, index) => {
            // Calculate the new value for each node based on incoming links
            const incomingLinks = updatedLinks.filter(
              (link) => link.target === index
            );
            if (incomingLinks.length > 0) {
              const newValue = incomingLinks.reduce(
                (sum, link) => sum + link.value,
                0
              );
              return { ...node, value: newValue };
            }
            return node;
          });
          return { ...prevData, nodes: updatedNodes, links: updatedLinks };
        });
      }
    }
    setEditingNode({ index: -1, value: null });
  };

  return (
    <div style={{ width: "100%", overflowX: "scroll", position: "relative" }}>
      {editingNode.index !== -1 && (
        <input
          type="text"
          value={editingNode.value || ""}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={editingNode.value?.toString() || "0"} // Convert to string
          style={{
            color: "black",
            position: "fixed", // Use fixed positioning
            bottom: "10px", // Position 10px from the bottom
            right: "10px", // Position 10px from the left
            zIndex: 1000, // Ensure it appears above other elements
          }}
        />
      )}
      <ResponsiveContainer width={baseWidth} height={adjustedHeight}>
        <Sankey
          width={adjustedWidth}
          height={adjustedHeight}
          data={dataValue}
          node={(nodeProps) => (
            <MyCustomNode {...nodeProps} links={dataValue.links} onNodeClick={handleNodeClick} />
          )}
          nodePadding={50}
          margin={margin}
          link={{ stroke: "#77c878" }}
          sort={false}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
};

export default SankeyChartComponent;
