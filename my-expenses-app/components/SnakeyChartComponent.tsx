"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
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
  SankeyLink,
} from "@/app/types/types";
import { uploadTransactionsInBatch } from "@/components/sendDataFirebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
// ts-expect-error: If you don't have @types/d3 installed, this will suppress the error.
import * as d3 from "d3";

type SankeyTooltipPayload = {
  source: { index: number };
  target: { index: number };
  value: number;
};

const SankeyChartComponent: React.FC<SnakeyChartComponentProps> = ({}) => {
  const [dataValue, setDataValue] = useState<SankeyData>({
    nodes: [],
    links: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState<number | null>(null);
  const [nodeIndex, setNodeIndex] = useState<number | null>(null);
  const [clickedNode, setNode] = useState<SankeyNode | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);
  const [availableWidth, setAvailableWidth] = useState<number>(1200);
  const parentColors = d3.schemeSet2;
  const [sankeyKey, setSankeyKey] = useState(0); // Add a key for forcing re-render
  const enhanceLinks = useCallback((links: SankeyLink[]) => {
    if (links.length === 0) {
      return links;
    }

    const maxLinkValue = links.reduce(
      (max, link) => (link.value > max ? link.value : max),
      0
    );
    const baseWidth = 6;
    const maxWidth = 72;

    return links.map((link) => {
      const normalizedWidth = maxLinkValue
        ? Math.max(
            baseWidth,
            Math.min(maxWidth, (link.value / maxLinkValue) * maxWidth)
          )
        : baseWidth;

      return {
        ...link,
        strokeWidth: normalizedWidth,
      };
    });
  }, []);

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
    if (!user?.email) {
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setInfoMessage(null);

      try {
        const userDocRef = doc(db, "users", user.email);
        const nodesCollectionRef = collection(userDocRef, month);
        const nodesSnapshot = await getDocs(nodesCollectionRef);
        const nodes: SankeyNode[] = nodesSnapshot.docs
          .filter((snapshotDoc) => snapshotDoc.id !== "parentChildMap")
          .map((snapshotDoc) => ({
            name: snapshotDoc.data().transaction,
            cost: snapshotDoc.data().cost || 0,
            index: snapshotDoc.data().index,
            isleaf: snapshotDoc.data().isleaf,
            value: snapshotDoc.data().cost || 0,
            visible: snapshotDoc.data().visible,
          }))
          .sort((a, b) => a.index - b.index);

        const mapDocRef = doc(nodesCollectionRef, "parentChildMap");
        const mapSnapshot = await getDoc(mapDocRef);

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

        const { nodes: calculatedNodes, links: calculatedLinks } =
          calculateLinks(nodes, parentChildMap);
        const enhancedLinks = enhanceLinks(calculatedLinks);

        if (!isCancelled) {
          setDataValue({ nodes: calculatedNodes, links: enhancedLinks });
          setSankeyKey((k) => k + 1);
          setLastUpdated(new Date());

          if (enhancedLinks.length === 0) {
            setInfoMessage(
              "No data available for this month yet. Upload transactions to get started."
            );
          }
        }
      } catch (fetchError) {
        if (!isCancelled) {
          console.error("Error fetching data:", fetchError);
          setError(
            "We couldn't load your expenses right now. Please try again shortly."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [month, user?.email, enhanceLinks]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateWidth = () => {
      const width =
        chartWrapperRef.current?.clientWidth ?? window.innerWidth ?? 1200;
      setAvailableWidth(Math.max(width, 320));
    };

    updateWidth();

    let resizeObserver: ResizeObserver | null = null;

    if ("ResizeObserver" in window && chartWrapperRef.current) {
      resizeObserver = new ResizeObserver(() => updateWidth());
      resizeObserver.observe(chartWrapperRef.current);
    } else {
      window.addEventListener("resize", updateWidth);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateWidth);
      }
    };
  }, []);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  );

  const formatCurrency = useCallback(
    (value?: number) => currencyFormatter.format(Math.max(0, value ?? 0)),
    [currencyFormatter]
  );

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
    const coloredLinks = enhanceLinks(newData.links);
    setDataValue({ ...newData, links: coloredLinks });
  };

  // To update the data in Firebase
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
  const chartMinWidth = Math.max(numberOfNodes * 140, 960);
  const chartWidth = Math.max(chartMinWidth, availableWidth);
  const adjustedHeight = Math.max(360, numberOfNodes * 52 + 260);
  const margin = {
    left: Math.min(200, numberOfNodes * 20),
    right: Math.min(200, numberOfNodes * 20),
    top: 100,
    bottom: 100,
  };
  const chartHeight = adjustedHeight;
  const chartReady = dataValue.nodes.length > 0 && dataValue.links.length > 0;
  const syncDisabled = isLoading || !chartReady;

  const totalSpend = useMemo(() => {
    if (dataValue.links.length === 0) {
      const rootNode = dataValue.nodes.find((node) => node.index === 0);
      return rootNode?.cost ?? 0;
    }

    return dataValue.links
      .filter((link) => link.source === 0)
      .reduce((sum, link) => sum + link.value, 0);
  }, [dataValue.links, dataValue.nodes]);

  const transactionCount = useMemo(
    () => dataValue.nodes.filter((node) => node.isleaf).length,
    [dataValue.nodes]
  );

  const categorySummary = useMemo(
    () =>
      dataValue.links
        .filter((link) => link.source === 0)
        .map((link) => {
          const categoryNode = dataValue.nodes.find(
            (node) => node.index === link.target
          );
          const color =
            link.color ??
            parentColors[link.target % parentColors.length] ??
            "#4fd1c5";
          return {
            name: categoryNode?.name ?? `Category ${link.target}`,
            value: link.value,
            color,
          };
        })
        .sort((a, b) => b.value - a.value),
    [dataValue.links, dataValue.nodes, parentColors]
  );

  const renderTooltip = useCallback(
    ({ active, payload }: TooltipProps<ValueType, NameType>) => {
      if (!active || !payload || payload.length === 0) {
        return null;
      }

      const tooltipData = payload[0]?.payload as
        | SankeyTooltipPayload
        | undefined;
      if (!tooltipData) {
        return null;
      }

      const sourceNode = dataValue.nodes.find(
        (node) => node.index === tooltipData.source
      );
      const targetNode = dataValue.nodes.find(
        (node) => node.index === tooltipData.target
      );
      const share = totalSpend
        ? Math.round((tooltipData.value / totalSpend) * 100)
        : 0;

      return (
        <div className="rounded-md border border-slate-700 bg-slate-900/90 p-3 text-sm text-slate-100 shadow-lg">
          <p className="font-semibold">
            {sourceNode?.name ?? "Total"} → {targetNode?.name ?? "Item"}
          </p>
          <p className="mt-1 text-slate-300">
            {formatCurrency(tooltipData.value)}
          </p>
          {share > 0 && (
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
              {share}% of tracked spend
            </p>
          )}
        </div>
      );
    },
    [dataValue.nodes, formatCurrency, totalSpend]
  );

  // Unique set of parent node names (for the dropdown in the modal)
  const parentOptions = Array.from(
    new Set(
      dataValue.links.map((link) => {
        const sourceIndex = link.source;
        return dataValue.nodes[sourceIndex]?.name ?? "";
      })
    )
  );

  const formattedTotalSpend = useMemo(
    () => formatCurrency(totalSpend),
    [formatCurrency, totalSpend]
  );
  const formattedTransactionCount = useMemo(
    () => compactFormatter.format(Math.max(0, transactionCount)),
    [compactFormatter, transactionCount]
  );
  const topCategories = useMemo(
    () => categorySummary.slice(0, 4),
    [categorySummary]
  );
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }
    return lastUpdated.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [lastUpdated]);

  // Helper to find the top-level parent for a given node index
    function findTopLevelParent(nodeIndex: number, links: SankeyLink[]): number {
      let current = nodeIndex;
      let parent = links.find((link) => link.target === current)?.source;
      while (parent !== undefined && parent !== 0) {
        current = parent;
        parent = links.find((link) => link.target === current)?.source;
      }
      return parent === 0 ? current : nodeIndex;
    }

  return (
    <div className="relative min-h-screen overflow-x-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
          >
            ← Back to Home
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Editing Month
            </p>
            <p className="text-lg font-semibold text-white">
              {month.toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={sendDataToFirebase}
            disabled={syncDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-600/40 disabled:text-emerald-200/70"
          >
            {syncDisabled && isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-transparent" />
                Loading…
              </>
            ) : (
              "Sync to Cloud"
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total tracked spend
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formattedTotalSpend}
            </p>
            {lastUpdatedText && (
              <p className="mt-3 text-xs text-slate-400">
                Updated {lastUpdatedText}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Active categories
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {categorySummary.length}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              {formattedTransactionCount} leaf transactions
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Top categories
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topCategories.length > 0 ? (
                topCategories.map((category) => (
                  <span
                    key={category.name}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-100"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  Upload data to reveal category insights.
                </span>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {infoMessage && !error && !isLoading && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 text-sm text-slate-200">
            {infoMessage}
          </div>
        )}

        <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-4 shadow-2xl shadow-slate-950/40">
          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-400/40 border-t-transparent" />
                <span className="text-sm">Loading your Sankey view…</span>
              </div>
            </div>
          ) : chartReady ? (
            <div
              ref={chartWrapperRef}
              className="w-full"
              style={{ minWidth: chartMinWidth }}
            >
              <ResponsiveContainer width="100%" height={chartHeight}>
                <Sankey
                  key={sankeyKey}
                  width={chartWidth}
                  height={chartHeight}
                  data={{ nodes: dataValue.nodes, links: dataValue.links }}
                  node={(nodeProps) => (
                    <MyCustomNode
                      {...nodeProps}
                      onNodeClick={(nodeId) => handleNodeClick(nodeId)}
                      allNodes={dataValue.nodes}
                      links={dataValue.links}
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
                    const matchingLink = dataValue.links.find(
                      (l) => l.source === sourceIndex && l.target === targetIndex
                    );
                    const linkStrokeWidth = matchingLink?.strokeWidth ?? 8;
                    const topParent = findTopLevelParent(
                      sourceIndex,
                      dataValue.links
                    );
                    const colorIdx = topParent % parentColors.length;
                    const linkColor = parentColors[colorIdx];
                    const path = `M${sourceX},${sourceY}C${sourceControlX},${sourceY},${targetControlX},${targetY},${targetX},${targetY}`;
                    return (
                      <g key={`link-group-${sourceIndex}-${targetIndex}`}>
                        <path
                          d={path}
                          stroke={linkColor}
                          strokeWidth={linkStrokeWidth}
                          strokeOpacity={0.95}
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
                  <Tooltip
                    content={renderTooltip}
                    cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  />
                </Sankey>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[420px] items-center justify-center text-center text-slate-300">
              {infoMessage ?? "No data available yet."}
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
};

export default SankeyChartComponent;
