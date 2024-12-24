"use client";

import React, { useState, useEffect } from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import { MyCustomNode, Node } from "./MyCustomNode";
import {
  data0,
  parentChildMap_data0,
  // testdatamini,
  calculateLinks,
  // parentChildMap_testdatamini,
} from "@/data/testData";
import InputModal from "./editNodes";

const SankeyChartComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState<number | null>(null);
  const [node, setNode] = useState<Node | null>(null);
  const [nodeIndex, setNodeIndex] = useState<number | null>(null);
  const data_test = calculateLinks(data0.nodes, parentChildMap_data0);
  const [dataValue, setDataValue] = useState(data_test);
  const [numberOfNodes, setNumberOfNodes] = useState<number>(
    dataValue.nodes.length
  );
  const baseWidth = numberOfNodes * 40; // or 40 for big Wider base width
  const baseHeight = numberOfNodes;
  const adjustedWidth = baseWidth + numberOfNodes * 1; // Add 100 units per node
  const adjustedHeight = baseHeight + numberOfNodes * 50; // Add 50 units per node

  // Sort nodes by parent before rendering
  const sortedNodes = [...dataValue.nodes].sort((a, b) => {
    const parentA = dataValue.links.find(
      (link) => link.target === a.index
    )?.source;
    const parentB = dataValue.links.find(
      (link) => link.target === b.index
    )?.source;
    return (parentA || 0) - (parentB || 0);
  });

  useEffect(() => {
    setNumberOfNodes(dataValue.nodes.length);
  }, [dataValue]);

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
    // console.log("new map", updatedap);
    const newData = calculateLinks(dataValue.nodes, updatedap);
    setDataValue(newData);
  };

  const margin = {
    left: Math.min(200, numberOfNodes * 20),
    right: Math.min(200, numberOfNodes * 20),
    top: 100,
    bottom: 100,
  };

  const parentOptions = Array.from(
    new Set(dataValue.links.map((link) => dataValue.nodes[link.source].name))
  );

  const handleNodeClick = (nodeId: string) => {
    setDataValue((prevData) => {
      // Find the index of the clicked node
      const nodeIndex = prevData.nodes.findIndex(
        (node) => node.name === nodeId
      );
      setNodeIndex(nodeIndex);
      setNode(prevData.nodes[nodeIndex]);

      const isLeafNode = dataValue.nodes[nodeIndex].isleaf;

      if (isLeafNode) {
        const parentLink = prevData.links.find(
          (link) => link.target === nodeIndex
        );

        if (parentLink) {
          setParentIndex(parentLink.source);
          setNodeIndex(nodeIndex);
          setIsModalOpen(true);
        }
        // if (false) {
        //   //(parentLink) {
        //   const parentIndex = parentLink.source;
        //   // // Prompt the user to enter a new name for the parent node
        //   const newParentName = prompt(
        //     "Enter a new name for the parent node:",
        //     prevData.nodes[parentIndex].name
        //   );

        //   if (newParentName) {
        //     // If the parent name already exists, then add it directly to that node
        //     const existingParentIndex = prevData.nodes.findIndex(
        //       (n) => n.name === newParentName
        //     );
        //     const updatedNodes = [...prevData.nodes];
        //     let newParentIndex;

        //     if (existingParentIndex !== -1) {
        //       // If the parent name already exists, use the existing node
        //       newParentIndex = existingParentIndex;
        //     } else {
        //       // If the parent name doesn't exist
        //       const newParentNode = {
        //         name: newParentName,
        //         value: dataValue.nodes[nodeIndex].cost || 0, // Initialize with a default value
        //         isleaf: false,
        //         visible: true,
        //       };

        //       // updatedNodes = [...prevData.nodes, newParentNode];
        //       updatedNodes.push(newParentNode);
        //       newParentIndex = updatedNodes.length - 1;
        //     }

        //     // Update the parent's value by adding the leaf node's value
        //     updatedNodes[parentIndex].value -=
        //       prevData.nodes[nodeIndex].cost ?? 0;
        //     // Update the parent node's name
        //     const updatedLinks = prevData.links.map((link) =>
        //       link.target === nodeIndex
        //         ? { ...link, source: newParentIndex }
        //         : link
        //     );

        //     // Add a link from the root to the new parent node if it's newly created
        //     if (existingParentIndex === -1) {
        //       updatedLinks.push({
        //         source: 0, // Assuming 0 is the root node index
        //         target: newParentIndex,
        //         value: dataValue.nodes[nodeIndex].cost || 100,
        //       });
        //     }
        //     // Update the dataValue with the new nodes and links
        //     return { nodes: updatedNodes, links: updatedLinks };
        //   }
        //   // }
        // }
        // else {
        // Parent nodes to collapse them
        // ! Not working
      }

      // If not a leaf node, return the data unchanged
      return prevData;
    });
  };

  const handleModalSubmit = (newParentName: string, newPrice: number) => {
    if (parentIndex !== null && nodeIndex !== null) {
      // Update parent link
      setDataValue((prevData) => {
        const updatedNodes = [...prevData.nodes];
        let newParentIndex = parentIndex;
        // Check if the new parent name already exists
        const existingParentIndex = prevData.nodes.findIndex(
          (n) => n.name === newParentName
        );
        if (existingParentIndex !== -1) {
          // Use the existing node as the new parent
          newParentIndex = existingParentIndex;
        } else {
          // Create a new parent node
          const newParentNode = {
            name: newParentName,
            value: dataValue.nodes[nodeIndex].cost || 0,
            isleaf: false,
            visible: true,
          };
          updatedNodes.push(newParentNode);
          newParentIndex = updatedNodes.length - 1;
        }

        let updatedData = calculateLinks(updatedNodes, updateParentChildMap());

        //--
        // Update the node's cost
        if (updatedNodes[nodeIndex].cost !== newPrice) {
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            cost: newPrice,
            value: newPrice,
          };

          updatedData = calculateLinks(updatedNodes, updateParentChildMap());
        }

        // Update parent only if necessary and if the newParent name is not the
        // same as the old parent name
        if (newParentIndex !== parentIndex) {
          // Update the parent's value by subtracting the leaf node's value
          updatedNodes[parentIndex].value -=
            prevData.nodes[nodeIndex].cost ?? 0;

          // Update the links
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
              value: dataValue.nodes[nodeIndex].cost || -1,
            });
          }
          console.log("new price", newPrice);

          // need to add a new node that we created, if created in the map
          // Add the new node to the parent-child map
          const updatedParentChildMap = updateParentChildMap();
          if (!updatedParentChildMap[newParentIndex]) {
            updatedParentChildMap[newParentIndex] = [];
          }
          // Add the node to the new parent
          updatedParentChildMap[newParentIndex].push(nodeIndex);

          // remove the node from the old parent
          updatedParentChildMap[parentIndex] = updatedParentChildMap[
            parentIndex
          ].filter((value) => value !== nodeIndex);

          // If the parent has no more children, remove the node and the link from 0 -> oldparent
          if (updatedParentChildMap[parentIndex].length === 0) {
            // Remove the link from the root to the old parent
            delete updatedParentChildMap[parentIndex];
          }
          // Recalculate links with the updated map
          updatedData = calculateLinks(updatedNodes, updatedParentChildMap);
          // console.log("New data is:", updatedNodes, updatedData.links);
          // return { nodes: updatedNodes, links: updatedData.links };
        }

        return { nodes: updatedNodes, links: updatedData.links };
      });
    }
  };

  // console.log("fl", filteredLinks);
  console.log("all", dataValue);

  // const handleInputBlur = () => {
  //   if (editingNode.index !== -1 && editingNode.value !== null) {
  //     const newValue = parseFloat(editingNode.value);
  //     if (!isNaN(newValue)) {
  //       setDataValue((prevData) => {
  //         const updatedLinks = prevData.links.map((link) => {
  //           if (link.target === editingNode.index) {
  //             return { ...link, value: newValue };
  //           }
  //           return link;
  //         });
  //         // Propagate changes to parent nodes
  //         const updatedNodes = prevData.nodes.map((node, index) => {
  //           // Calculate the new value for each node based on incoming links
  //           const incomingLinks = updatedLinks.filter(
  //             (link) => link.target === index
  //           );
  //           if (incomingLinks.length > 0) {
  //             const newValue = incomingLinks.reduce(
  //               (sum, link) => sum + link.value,
  //               0
  //             );
  //             return { ...node, value: newValue };
  //           }
  //           return node;
  //         });
  //         return { ...prevData, nodes: updatedNodes, links: updatedLinks };
  //       });
  //     }
  //   }
  //   setEditingNode({ index: -1, value: null });
  // };

  return (
    <div style={{ width: "100%", overflowX: "scroll", position: "relative" }}>
      <ResponsiveContainer width={baseWidth} height={adjustedHeight}>
        <Sankey
          width={adjustedWidth}
          height={adjustedHeight}
          data={{ ...dataValue, nodes: sortedNodes }}
          node={(nodeProps) => (
            <MyCustomNode
              {...nodeProps}
              onNodeClick={(nodeId) => handleNodeClick(nodeId)}
              allNodes={dataValue.nodes}
            />
          )}
          nodePadding={50}
          margin={margin}
          link={{ stroke: "#77c878" }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
      {isModalOpen &&
        parentIndex !== null &&
        nodeIndex !== null &&
        node !== null && (
          <InputModal
            node={node}
            initialParentName={dataValue.nodes[parentIndex].name}
            initialPrice={dataValue.nodes[nodeIndex].value?.toString()}
            onSubmit={handleModalSubmit}
            onClose={() => setIsModalOpen(false)}
            parentOptions={parentOptions}
          />
        )}
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
