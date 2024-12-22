"use client";

import React, { useState } from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import MyCustomNode from "./MyCustomNode";
import { data0, testdatamini, calculateLinks, parentChildMap_testdatamini } from "@/data/testData";

const SankeyChartComponent = () => {
  const data_test = calculateLinks(testdatamini.nodes, parentChildMap_testdatamini);
  console.log(data_test);
  // Calculate the number of nodes
  const [dataValue, setDataValue] = useState(data_test);
  const numberOfNodes = dataValue.nodes.length;

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
      // Check if the node is a leaf node (no outgoing links)
      const isLeafNode = !prevData.links.some(
        (link) => link.source === nodeIndex
      );
      if (isLeafNode) {
        // Update all links connected to this leaf node
        const updatedLinks = prevData.links.map((link) => {
          if (link.target === nodeIndex) {
            return { ...link, value: link.value + 10 }; // Increment the link's value
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
        console.log(
          "Updated Nodes and Links for Leaf Node:",
          updatedNodes,
          updatedLinks
        ); // Debugging line
        return { ...prevData, nodes: updatedNodes, links: updatedLinks };
      }
      // If not a leaf node, return the data unchanged
      return prevData;
    });
  };

  return (
    <div
      style={{
        width: "100%",
        overflowX: "scroll", // Enable horizontal scrolling
      }}
    >
      <ResponsiveContainer width={baseWidth} height={adjustedHeight}>
        <Sankey
          width={adjustedWidth}
          height={adjustedHeight}
          data={dataValue}
          node={(nodeProps) => (
            <MyCustomNode {...nodeProps} onNodeClick={handleNodeClick} />
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
