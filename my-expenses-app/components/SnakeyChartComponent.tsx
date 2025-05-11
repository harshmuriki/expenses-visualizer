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
  }, [refresh, month, user?.email, session]);

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

  /**
   * Recalculate all parent node values as the sum of their children's costs.
   */
  function recalculateParentValues(nodes: SankeyNode[], parentChildMap: Map) {
    const updatedNodes = [...nodes];
    Object.entries(parentChildMap).forEach(([parentIdx, children]) => {
      const parentIndex = parseInt(parentIdx, 10);
      const sum = (children as number[]).reduce((acc, childIdx) => {
        const child = updatedNodes[childIdx];
        return acc + (child?.cost || 0);
      }, 0);
      if (updatedNodes[parentIndex]) {
        updatedNodes[parentIndex].value = sum;
        updatedNodes[parentIndex].cost = sum;
      }
    });
    return updatedNodes;
  }

  /**
   * Recalculates links after nodes or parent-child relationships change,
   * applying strokeWidth scaling based on relative link values.
   */
  const recalculateLinks = () => {
    const updatedParentChildMap = updateParentChildMap();
    const newData = calculateLinks(dataValue.nodes, updatedParentChildMap);
    const maxLinkValue = Math.max(...newData.links.map((link) => link.value));
    const coloredLinks = newData.links.map((link) => {
      // Scale strokeWidth based on link's value
      const baseWidth = 3;
      const maxWidth = 75; // tweak as needed
      const strokeWidth = maxLinkValue
        ? Math.max(baseWidth, (link.value / maxLinkValue) * maxWidth)
        : baseWidth;

      return { ...link, strokeWidth };
    });
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
  const handleModalSubmit = (newParentString: string, newPrice: number) => {
    if (parentIndex === null || nodeIndex === null) return;

    // Try to extract index from "Parent Name [index]"
    const match = newParentString.match(/\[(\d+)\]$/);
    let newParentIndex: number | null = null;
    let isNewParent = false;
    const newParentName = newParentString;

    if (match) {
      newParentIndex = parseInt(match[1], 10);
    } else {
      // No index found, treat as new parent
      isNewParent = true;
    }

    setDataValue((prevData) => {
      const updatedNodes = [...prevData.nodes];
      let actualNewParentIndex = newParentIndex;

      if (isNewParent) {
        // Create new parent node
        const newParentNode: SankeyNode = {
          name: newParentName,
          value: updatedNodes[nodeIndex].cost || 0,
          isleaf: false,
          visible: true,
          index: updatedNodes.length,
        };
        updatedNodes.push(newParentNode);
        actualNewParentIndex = updatedNodes.length - 1;
      }

      // Update the node's cost/value
      if (updatedNodes[nodeIndex].cost !== newPrice) {
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          cost: newPrice,
          value: newPrice,
        };
      }

      // Update parent-child relationships directly
      // Build parentChildMap from current links, then update
      const updatedMap = updateParentChildMap();
      // Remove nodeIndex from all parents
      Object.entries(updatedMap).forEach(([parentIdx, children]) => {
        const parentKey = parseInt(parentIdx, 10);
        updatedMap[parentKey] = (children as number[]).filter(
          (val: number) => val !== nodeIndex
        );
      });
      // Add nodeIndex to the new parent
      if (actualNewParentIndex === null) return prevData; // Defensive
      if (!updatedMap[actualNewParentIndex]) {
        updatedMap[actualNewParentIndex] = [];
      }
      updatedMap[actualNewParentIndex].push(nodeIndex);
      // Clean up any empty arrays
      Object.entries(updatedMap).forEach(([k, v]) => {
        const keyNum = parseInt(k, 10);
        if (Array.isArray(v) && v.length === 0) {
          delete updatedMap[keyNum];
        }
      });

      // Recalculate parent values
      const recalculatedNodes = recalculateParentValues(
        updatedNodes,
        updatedMap
      );
      // Recalculate links with the updated map
      const recalculatedData = calculateLinks(recalculatedNodes, updatedMap);
      return { nodes: recalculatedNodes, links: recalculatedData.links };
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
        const node = dataValue.nodes[sourceIndex];
        return node ? `${node.name} [${node.index}]` : "";
      })
    )
  );

  return (
    <div style={{ width: "100%", overflowX: "scroll", position: "relative" }}>
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
          background: "linear-gradient(to right, #4b5563, #6b7280)", // Soft gray gradient
          padding: "10px 20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)", // Subtle shadow
        }}
      >
        {/* Left Section: Back to Home Button */}
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007AFF",
            color: "white",
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
            color: "white",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Editing Month: {month}
        </span>

        {/* Right Section: Buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={recalculateLinks}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Recalculate Links
          </button>
          {/* <button
            onClick={sendDataToFirebase}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Save Data to Firebase
          </button> */}
        </div>
      </div>

      {dataValue.nodes.length > 0 && dataValue.links.length > 0 ? (
        <>
          <ResponsiveContainer
            width={userAdjustedWidth}
            height={adjustedHeight}
          >
            <Sankey
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

                // Default link color and width
                let linkColor = "#8884d8";
                let linkStrokeWidth = 2;

                // Match the link in our dataValue to get custom styling
                const matchingLink = dataValue.links.find(
                  (l) => l.source === sourceIndex && l.target === targetIndex
                );

                if (matchingLink) {
                  linkColor = matchingLink.color || linkColor;
                  linkStrokeWidth = matchingLink.strokeWidth || 2;
                }

                const path = `
                  M${sourceX},${sourceY}
                  C${sourceControlX},${sourceY}
                  ${targetControlX},${targetY}
                  ${targetX},${targetY}
                `;

                return (
                  <path
                    key={`link-${sourceIndex}-${targetIndex}`}
                    d={path}
                    stroke={linkColor}
                    strokeWidth={linkStrokeWidth}
                    strokeOpacity={0.2}
                    fill="none"
                  />
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
                initialParentName={`${dataValue.nodes[parentIndex]?.name} [${dataValue.nodes[parentIndex]?.index}]`}
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
