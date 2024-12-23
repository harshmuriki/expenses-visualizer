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
import InputModal from "./editNodes";

const SankeyChartComponent = () => {
  const data_test = calculateLinks(
    testdatamini.nodes,
    parentChildMap_testdatamini
  );

  // console.log(data_test);
  // Calculate the number of nodes
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataValue, setDataValue] = useState(data_test);
  const numberOfNodes = dataValue.nodes.length;
  const [editingNode, setEditingNode] = useState<{
    index: number;
    value: string | null;
  }>({ index: -1, value: null });

  const updateParentChildMap = () => {
    const newMap: Record<number, number[]> = {};
    dataValue.links.forEach((link) => {
      if (link.source !== 0) {
        if (!newMap[link.source]) {
          newMap[link.source] = [];
        }
        newMap[link.source].push(link.target);
      }
    });
    return newMap;
  };

  const recalculateLinks = () => {
    const updatedap = updateParentChildMap();
    console.log("new map", updatedap);
    const newData = calculateLinks(dataValue.nodes, updatedap);
    setDataValue(newData);
  };

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

  const handleNodeClick = (
    nodeId: string,
    event: React.MouseEvent<SVGElement>
  ) => {
    setDataValue((prevData) => {
      // Find the index of the clicked node
      const nodeIndex = prevData.nodes.findIndex(
        (node) => node.name === nodeId
      );
      const isLeafNode = dataValue.nodes[nodeIndex].isleaf;
      // setIsLeafNode(isLeafNode);
      if (isLeafNode) {
        setEditingNode({
          index: nodeIndex,
          value: dataValue.nodes[nodeIndex].value?.toString() || "",
        });

        const parentLink = prevData.links.find(
          (link) => link.target === nodeIndex
        );

        if (parentLink) {
          const parentIndex = parentLink.source;
          // Prompt the user to enter a new name for the parent node
          const newParentName = prompt(
            "Enter a new name for the parent node:",
            prevData.nodes[parentIndex].name
          );

          if (newParentName) {
            // If the parent name already exists, then add it directly to that node
            const existingParentIndex = prevData.nodes.findIndex(
              (n) => n.name === newParentName
            );
            const updatedNodes = [...prevData.nodes];
            let newParentIndex;

            if (existingParentIndex !== -1) {
              // If the parent name already exists, use the existing node
              newParentIndex = existingParentIndex;
            } else {
              // If the parent name doesn't exist
              const newParentNode = {
                name: newParentName,
                value: dataValue.nodes[nodeIndex].cost, // Initialize with a default value
                isleaf: false,
                visible: true,
              };

              // updatedNodes = [...prevData.nodes, newParentNode];
              updatedNodes.push(newParentNode);
              newParentIndex = updatedNodes.length - 1;
            }

            // Update the parent's value by adding the leaf node's value
            updatedNodes[parentIndex].value -= prevData.nodes[nodeIndex].cost;
            // Update the parent node's name
            const updatedLinks = prevData.links.map((link) =>
              link.target === nodeIndex
                ? { ...link, source: newParentIndex }
                : link
            );

            // Add a link from the root to the new parent node if it's newly created
            if (existingParentIndex === -1) {
              updatedLinks.push({
                source: 0, // Assuming 0 is the root node index
                target: newParentIndex,
                value: dataValue.nodes[nodeIndex].cost || 100,
              });
            }
            // Update the dataValue with the new nodes and links
            return { nodes: updatedNodes, links: updatedLinks };
          }
        }
      } else {
        // Parent nodes to collapse them
        // ! Not working
        console.log("val", dataValue.nodes[nodeIndex].visible);

        // Set the node's visibility to false
        // const updatedNodes = prevData.nodes.map((n, index) =>
        //   index === nodeIndex ? { ...n, visible: !n.visible } : n
        // );
        // console.log("val updated", updatedNodes[nodeIndex].visible);

        const childIndices = prevData.links
          .filter((link) => link.source === nodeIndex)
          .map((link) => link.target);

        console.log("childIndices", childIndices);

        if (childIndices.length > 0) {
          const updatedNodes = prevData.nodes.filter(
            (_, index) => index === nodeIndex || !childIndices.includes(index)
          );

          console.log("updatedNodes", updatedNodes);
          const updatedLinks = prevData.links.filter(
            (link) =>
              link.source !== nodeIndex && !childIndices.includes(link.target)
          );
          console.log("updatedLinks", updatedLinks);
          console.log("Child nodes and links removed for:", nodeId);
          // Update the dataValue with the new nodes and links
          // return { ...prevData, nodes: updatedNodes, links: updatedLinks };
        }
      }

      // If not a leaf node, return the data unchanged
      return prevData;
    });
  };

  // console.log("fl", filteredLinks);
  console.log("all", dataValue);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      // Reset the editingNode state to hide the input
      setEditingNode({ index: -1, value: null });
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
            position: "fixed",
            bottom: "10px",
            right: "10px",
            zIndex: 1000,
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "black",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        />
      )}
      <ResponsiveContainer width={baseWidth} height={adjustedHeight}>
        <Sankey
          width={adjustedWidth}
          height={adjustedHeight}
          data={dataValue}
          node={(nodeProps) => (
            <MyCustomNode
              {...nodeProps}
              onNodeClick={(nodeId, event) => handleNodeClick(nodeId, event)}
              allNodes={dataValue.nodes}
            />
          )}
          nodePadding={50}
          margin={margin}
          link={{ stroke: "#77c878" }}
          sort={false}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
      <button
        onClick={recalculateLinks}
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Recalculate Links
      </button>
    </div>
  );
};

export default SankeyChartComponent;
