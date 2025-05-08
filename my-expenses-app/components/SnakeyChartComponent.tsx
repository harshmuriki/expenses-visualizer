"use client";

import React, { useState, useEffect } from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import { MyCustomNode } from "./MyCustomNode";
import { calculateLinks } from "@/components/processLinks";
import InputModal from "./editNodes";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  SankeyNode,
  SankeyData,
  SnakeyChartComponentProps,
  Map,
} from "@/app/types/types";
import { uploadTransactionsInBatch } from "@/components/sendDataFirebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
// @ts-ignore: If you don't have @types/d3 installed, this will suppress the error.
import * as d3 from "d3";

const SankeyChartComponent: React.FC<SnakeyChartComponentProps> = ({
  refresh,
}) => {
  const [dataValue, setDataValue] = useState<SankeyData>({
    nodes: [],
    links: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState<number | null>(null);
  const [nodeIndex, setNodeIndex] = useState<number | null>(null);
  const [clickedNode, setNode] = useState<SankeyNode | null>(null);
  const [userAdjustedWidth, setUserAdjustedWidth] = useState(1000);
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);
  const MAX_RETRIES = 5; // Maximum number of retries
  const RETRY_DELAY = 3000; // Delay between retries in milliseconds (5 seconds)
  const parentColors = d3.schemeSet2;
  const [sankeyKey, setSankeyKey] = useState(0); // Add a key for forcing re-render

  useEffect(() => {
    if (session) {
      setUser(session?.user || null);
    }
  }, [session]);

  const searchParams = useSearchParams();
  let month = searchParams?.get("month") || "";

  if (month === "") {
    month = "feb";
    console.warn("No month specified. Using default month.", month);
  }

  /**
   * Fetches data (nodes + parentChildMap) from Firestore,
   * then calculates and sets the Sankey links.
   */
  useEffect(() => {
    const fetchData = async (retries = 0) => {
      if (session?.user?.email === null) {
        console.warn(
          `Attempt ${retries + 1}: User email is not set. Retrying...`
        );
        if (retries < MAX_RETRIES) {
          setTimeout(() => fetchData(retries + 1), RETRY_DELAY); // Retry after delay
        } else {
          console.error("Max retries reached. User email is still not set.");
        }
        return;
      }
      try {
        // Fetch nodes
        if (!user?.email) {
          console.error("User email is not set.");
          return;
        }
        const userDocRef = doc(db, "users", user.email);
        const nodesCollectionRef = collection(userDocRef, month);
        const nodesSnapshot = await getDocs(nodesCollectionRef);
        const nodes: SankeyNode[] = nodesSnapshot.docs
          .filter((doc) => doc.id !== "parentChildMap") // Exclude 'parentChildMap'
          .map((doc) => ({
            name: doc.data().transaction,
            cost: doc.data().cost || 100,
            index: doc.data().index,
            isleaf: doc.data().isleaf,
            value: doc.data().cost || 100,
            visible: doc.data().visible,
          }))
          .sort((a, b) => a.index - b.index);

        // Fetch parentChildMap
        // const nodesCollectionRef = collection(userDocRef, month);
        const mapDocRef = doc(nodesCollectionRef, "parentChildMap");
        const mapSnapshot = await getDoc(mapDocRef);

        // 1) Get array of keys as numbers
        const keys: number[] = mapSnapshot.exists()
          ? Object.keys(mapSnapshot.data()).map((key) => parseInt(key))
          : [];

        const parentChildMapArr: number[][] = mapSnapshot.exists()
          ? Object.values(mapSnapshot.data()).map(
              (values) => values as number[]
            )
          : [];

        const parentChildMap: Map = keys.reduce((acc: Map, key, index) => {
          acc[key] = parentChildMapArr[index];
          return acc;
        }, {});
        // Calculate links from the nodes + parentChildMap
        const { nodes: calculatedNodes, links: calculatedLinks } =
          calculateLinks(nodes, parentChildMap);

        setDataValue({ nodes: calculatedNodes, links: calculatedLinks });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, user?.email, session]);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth, 2500);
      setUserAdjustedWidth(newWidth);
    };

    // Set initial width based on window size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * Dynamically builds a parent->children map based on existing links.
   */
  const updateParentChildMap = (linksArg = dataValue.links) => {
    const newMap: Record<number, number[]> = {};
    linksArg.forEach((link) => {
      if (link.source !== 0) {
        if (!newMap[link.source]) {
          newMap[link.source] = [];
        }
        newMap[link.source].push(link.target);
      }
    });
    return newMap;
  };

  /**
   * Recalculates links after nodes or parent-child relationships change,
   * applying strokeWidth scaling based on relative link values.
   */
  const recalculateLinks = () => {
    const updatedParentChildMap = updateParentChildMap();
    const newData = calculateLinks(dataValue.nodes, updatedParentChildMap);
    // Tweak these for visual scaling:
    const baseWidth = 2; // Minimum link width
    const maxWidth = 100; // Maximum link width
    const maxLinkValue = Math.max(...newData.links.map((link) => link.value));
    const coloredLinks = newData.links.map((link) => {
      // Scale strokeWidth based on link's value
      const strokeWidth = maxLinkValue
        ? Math.max(baseWidth, (link.value / maxLinkValue) * maxWidth)
        : baseWidth;
      return { ...link, strokeWidth };
    });
    console.log(
      "Recalculating links. Nodes:",
      newData.nodes,
      "Links:",
      coloredLinks
    );
    setDataValue({ ...newData, links: coloredLinks });
  };

  // To update the data in Firebase
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendDataToFirebase = async () => {
    console.log("uploading data to firebase");
    try {
      // Send the parent-child map to Firebase
      const parentChildMap = updateParentChildMap();

      const batchData = [];

      // Prepare batch upload data for Firebase
      dataValue.nodes.forEach((node) => {
        const isLeaf =
          !parentChildMap.hasOwnProperty(node.index) && node.index !== 0;
        batchData.push({
          useremail: user?.email?.toString() || "",
          month: month,
          transaction: node.name,
          index: node.index,
          cost: node.cost || 0,
          isleaf: isLeaf,
          isMap: false,
          key: null,
          values: null,
          visible: true,
        });
      });

      for (const [key, values] of Object.entries(parentChildMap)) {
        batchData.push({
          useremail: user?.email?.toString() || "",
          month,
          transaction: null,
          index: null,
          cost: null,
          isleaf: null,
          isMap: true,
          key,
          values,
          visible: true,
        });
      }
      await uploadTransactionsInBatch(batchData);

      console.log("Data saved to Firebase successfully!");
      alert("Data uploaded successfully!");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
    }
  };

  /**
   * When a node is clicked, open the modal if it is a leaf node.
   * (Right now, only leaf nodes are handled for editing.)
   */
  const handleNodeClick = (nodeId: string) => {
    setDataValue((prevData) => {
      const clickedIndex = prevData.nodes.findIndex((n) => n.name === nodeId);
      if (clickedIndex === -1) return prevData;

      const clickedNode = prevData.nodes[clickedIndex];
      setNodeIndex(clickedIndex);
      setNode(clickedNode);

      if (clickedNode.isleaf) {
        const parentLink = prevData.links.find(
          (link) => link.target === clickedIndex
        );
        if (parentLink) {
          setParentIndex(parentLink.source);
          setIsModalOpen(true);
        }
      }
      return prevData;
    });

    // Give time for setState to finish, then recalculate
    setTimeout(() => {
      recalculateLinks();
    }, 500);
  };

  /**
   * Handle form submission from the modal:
   * - Possibly create a new parent node or reuse an existing node
   * - Update the cost/value on the leaf node
   * - Update the parent's cost
   * - Update parentChildMap, recalculate links
   */
  const handleModalSubmit = (newParentName: string, newPrice: number) => {
    if (parentIndex === null || nodeIndex === null) return;

    setDataValue((prevData) => {
      const updatedNodes = [...prevData.nodes];
      let newParentIndex = parentIndex;

      // Check if the new parent name already exists
      const existingParentIndex = updatedNodes.findIndex(
        (n) => n.name === newParentName
      );

      // If parent doesn't exist, create it
      if (existingParentIndex === -1) {
        const newParentNode: SankeyNode = {
          name: newParentName,
          value: updatedNodes[nodeIndex].cost || 0,
          isleaf: false,
          visible: true,
          index: updatedNodes.length,
        };
        updatedNodes.push(newParentNode);
        newParentIndex = updatedNodes.length - 1;
      } else {
        newParentIndex = existingParentIndex;
      }

      // Update the node's cost/value
      if (updatedNodes[nodeIndex].cost !== newPrice) {
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          cost: newPrice,
          value: newPrice,
        };
      }
      const editedNode = updatedNodes[nodeIndex];
      console.log("Edited node:", {
        index: nodeIndex,
        name: editedNode.name,
        cost: editedNode.cost,
        value: editedNode.value,
      });

      // Build links from the old data
      let updatedLinks = [...prevData.links];

      // If the user actually changed the parent (not just the price)
      if (newParentIndex !== parentIndex) {
        // Subtract the node's value from the old parent
        // updatedNodes?[parentIndex].value -= prevData.nodes[nodeIndex].cost ?? 0;
        (updatedNodes as { value: number }[])[parentIndex].value -=
          prevData.nodes[nodeIndex].cost ?? 0;

        // Reassign the leaf to the new parent
        updatedLinks = updatedLinks.map((link) =>
          link.target === nodeIndex ? { ...link, source: newParentIndex } : link
        );

        // If we created a brand-new parent node, add a link from root (index 0)
        if (existingParentIndex === -1) {
          updatedLinks.push({
            source: 0,
            target: newParentIndex,
            value: updatedNodes[nodeIndex].cost ?? 0,
          });
        }

        // Update parent-child relationships
        const updatedMap = updateParentChildMap(updatedLinks);
        if (!updatedMap[newParentIndex]) {
          updatedMap[newParentIndex] = [];
        }
        // Add the node to the new parent
        updatedMap[newParentIndex].push(nodeIndex);

        // Remove the node from the old parent
        updatedMap[parentIndex] = updatedMap[parentIndex].filter(
          (val) => val !== nodeIndex
        );

        // If the old parent has no children left, remove that parent link from root
        if (updatedMap[parentIndex]?.length === 0) {
          delete updatedMap[parentIndex];
        }

        // Recalculate links with the updated map
        const recalculatedData = calculateLinks(updatedNodes, updatedMap);
        // Force Sankey re-render by incrementing sankeyKey
        setSankeyKey((k) => k + 1);
        return { nodes: [...updatedNodes], links: [...recalculatedData.links] };
      }

      // No parent change, just cost
      const updatedMap = updateParentChildMap();
      console.log("Updated parentChildMap:", updatedMap);
      const recalculatedData = calculateLinks(updatedNodes, updatedMap);
      // Force Sankey re-render by incrementing sankeyKey
      setSankeyKey((k) => k + 1);
      return { nodes: [...updatedNodes], links: [...recalculatedData.links] };
    });
  };

  // Chart dimensions
  const numberOfNodes = dataValue.nodes.length;
  const baseWidth = numberOfNodes * 100;
  const adjustedWidth = baseWidth + numberOfNodes;
  const adjustedHeight = numberOfNodes * 50 + 200; // A little padding
  const margin = {
    left: Math.min(200, numberOfNodes * 20),
    right: Math.min(200, numberOfNodes * 20),
    top: 100,
    bottom: 100,
  };

  // Unique set of parent node names (for the dropdown in the modal)
  const parentOptions = Array.from(
    new Set(
      dataValue.links.map((link) => {
        const sourceIndex = link.source;
        return dataValue.nodes[sourceIndex]?.name ?? "";
      })
    )
  );

  // Helper to find the top-level parent for a given node index
  function findTopLevelParent(nodeIndex: number, links: any[]): number {
    let current = nodeIndex;
    let parent = links.find((l: any) => l.target === current)?.source;
    while (parent !== undefined && parent !== 0) {
      current = parent;
      parent = links.find((l: any) => l.target === current)?.source;
    }
    return parent === 0 ? current : nodeIndex;
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#181f2a",
        overflowX: "scroll",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to right, #232946, #181f2a)",
          padding: "10px 20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        {/* Left Section: Back to Home Button */}
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4fd1c5",
            color: "#181f2a",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Back to Home
        </button>
        {/* Center: Month Label */}
        <span
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Editing Month: {month}
        </span>
        {/* Right Section: Sync to Cloud Button */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={sendDataToFirebase}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00ffd0",
              color: "#181f2a",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              marginLeft: "10px",
            }}
          >
            Sync to Cloud
          </button>
        </div>
      </div>

      {dataValue.nodes.length > 0 && dataValue.links.length > 0 ? (
        <>
          <ResponsiveContainer
            width={userAdjustedWidth}
            height={adjustedHeight}
          >
            <Sankey
              key={sankeyKey}
              width={adjustedWidth}
              height={adjustedHeight}
              data={{ nodes: dataValue.nodes, links: dataValue.links }}
              node={(nodeProps) => (
                <MyCustomNode
                  {...nodeProps}
                  onNodeClick={(nodeId) => handleNodeClick(nodeId)}
                  allNodes={dataValue.nodes}
                  colorThreshold={10}
                />
              )}
              nodePadding={60}
              nodeWidth={30}
              margin={margin}
              link={(linkProps) => {
                const {
                  sourceX,
                  sourceY,
                  targetX,
                  targetY,
                  sourceControlX,
                  targetControlX,
                  payload,
                } = linkProps;
                const sourceIndex = payload.source.index;
                const targetIndex = payload.target.index;
                let linkStrokeWidth = 8;
                const matchingLink = dataValue.links.find(
                  (l) => l.source === sourceIndex && l.target === targetIndex
                );
                if (matchingLink) {
                  linkStrokeWidth = matchingLink.strokeWidth;
                }
                // Assign color by top-level parent
                const topParent = findTopLevelParent(
                  sourceIndex,
                  dataValue.links
                );
                const colorIdx = topParent % parentColors.length;
                const linkColor = parentColors[colorIdx];
                const path = `M${sourceX},${sourceY}C${sourceControlX},${sourceY},${targetControlX},${targetY},${targetX},${targetY}`;
                return (
                  <g key={`link-group-${sourceIndex}-${targetIndex}`}>
                    {/* Main path only, remove debug line */}
                    <path
                      d={path}
                      stroke={linkColor}
                      strokeWidth={linkStrokeWidth}
                      strokeOpacity={1}
                      fill="none"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{
                        transition:
                          "stroke-width 0.4s, stroke 0.4s, stroke-opacity 0.4s",
                      }}
                    />
                  </g>
                );
              }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>

          {isModalOpen &&
            parentIndex !== null &&
            nodeIndex !== null &&
            clickedNode !== null && (
              <InputModal
                clickedNode={clickedNode}
                initialParentName={dataValue.nodes[parentIndex]?.name}
                initialPrice={
                  dataValue.nodes[nodeIndex]?.value?.toString() || "0"
                }
                onSubmit={handleModalSubmit}
                onClose={() => setIsModalOpen(false)}
                parentOptions={parentOptions}
              />
            )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="p-4 rounded-md bg-red-100 text-red-700 text-center">
            Data loading... 😀
          </div>
        </div>
      )}
    </div>
  );
};

export default SankeyChartComponent;
