"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import TreeMapChart from "./TreeMapChart";
import { calculateLinks } from "@/components/processLinks";
import InputModal from "./editNodes";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  SankeyNode,
  SankeyData,
  SnakeyChartComponentProps,
  SankeyLink,
} from "@/app/types/types";

type Map = Record<number, number[]>;
import { uploadTransactionsInBatch } from "@/components/sendDataFirebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import UploadedFilesPanel from "./UploadedFilesPanel";
import SmartSearch from "./SmartSearch";
import TransactionTable from "./TransactionTable";
import { FiBarChart2, FiGrid } from "react-icons/fi";

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
  const parentColors = useMemo(
    () => [
      "#80A1BA",
      "#91C4C3",
      "#B4DEBD",
      "#FFE5B4",
      "#6B8BA4",
      "#7AAFAD",
      "#9AC9A4",
      "#F5ECC8",
    ],
    []
  );
  const [viewMode, setViewMode] = useState<"treemap" | "table">("treemap");

  // Categories to exclude from TreeMap (but keep in Table and Insights)
  const EXCLUDED_CATEGORIES = ["Mobile Phone", "Credit Card Payment"];

  // Meta totals from server (e.g., excluded credit card payments)
  const [metaTotals, setMetaTotals] = useState<{
    creditCardPaymentsTotal?: number;
  } | null>(null);

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

      if (!user?.email || !month) {
        console.log("User email or month is not available");
        setIsLoading(false);
        return;
      }

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
            date: snapshotDoc.data().date,
            location: snapshotDoc.data().location,
            file_source: snapshotDoc.data().file_source,
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

        // Fetch meta totals (e.g., credit card payments total)
        try {
          const metaRef = doc(nodesCollectionRef, "meta");
          const metaSnap = await getDoc(metaRef);
          if (metaSnap.exists()) {
            setMetaTotals(
              metaSnap.data() as { creditCardPaymentsTotal?: number }
            );
          } else {
            setMetaTotals(null);
          }
        } catch (e) {
          console.warn("Unable to load meta totals:", e);
          setMetaTotals(null);
        }

        if (!isCancelled) {
          setDataValue({ nodes: calculatedNodes, links: enhancedLinks });
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

  // To update the data in Firebase
  const sendDataToFirebase = async () => {
    console.log("uploading data to firebase");
    try {
      // Send the parent-child map to Firebase
      const parentChildMap = updateParentChildMap();

      const batchData = [];

      // Prepare batch upload data for Firebase (skip root node at index 0)
      dataValue.nodes.forEach((node) => {
        // Skip root node (Expenses)
        if (node.index === 0) return;

        const isLeaf =
          !parentChildMap.hasOwnProperty(node.index) && node.index !== 0;
        const nowIso = new Date().toISOString();
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
          // Parent tags should always have current date; leaves default to now if missing
          date: isLeaf ? node.date ?? nowIso : nowIso,
          location: node.location ?? "None",
          file_source: node.file_source ?? "Unknown",
          bank: node.bank ?? "Unknown Bank",
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
   * Handle editing a transaction from TreeMap
   */
  const handleEditTransaction = (nodeIndex: number) => {
    const clickedNode = dataValue.nodes.find((n) => n.index === nodeIndex);
    if (!clickedNode) return;

    setNodeIndex(nodeIndex);
    setNode(clickedNode);

    const parentLink = dataValue.links.find(
      (link) => link.target === nodeIndex
    );
    if (parentLink) {
      setParentIndex(parentLink.source);
      setIsModalOpen(true);
    }
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
      // Map graph indices to array positions
      const nodePos = updatedNodes.findIndex((n) => n.index === nodeIndex);
      const parentPos = updatedNodes.findIndex((n) => n.index === parentIndex);
      if (nodePos === -1 || parentPos === -1) {
        console.warn("Could not locate node or parent by index", {
          nodeIndex,
          parentIndex,
        });
        return prevData;
      }

      let newParentIndex = parentIndex; // graph index value for the parent

      // Check if the new parent name already exists (case-insensitive)
      const normalizedNewName = newParentName.trim().toLowerCase();
      const existingParentPos = updatedNodes.findIndex(
        (n) =>
          !n.isleaf && (n.name ?? "").trim().toLowerCase() === normalizedNewName
      );

      // If parent doesn't exist, create it
      if (existingParentPos === -1) {
        // Find max index to ensure uniqueness
        const indices = updatedNodes
          .map((n) => n.index)
          .filter((idx) => typeof idx === "number" && !isNaN(idx));
        const maxIndex = indices.length > 0 ? Math.max(...indices) : 0;
        const newParentNode: SankeyNode = {
          name: newParentName,
          value: updatedNodes[nodePos].cost || 0,
          isleaf: false,
          visible: true,
          index: maxIndex + 1,
        };
        updatedNodes.push(newParentNode);
        newParentIndex = newParentNode.index;
      } else {
        newParentIndex = updatedNodes[existingParentPos].index;
      }

      // Update the node's cost/value
      if (updatedNodes[nodePos].cost !== newPrice) {
        updatedNodes[nodePos] = {
          ...updatedNodes[nodePos],
          cost: newPrice,
          value: newPrice,
        };
      }

      // If the user actually changed the parent (not just the price)
      if (newParentIndex !== parentIndex) {
        // Build links from the old data for updating the parent-child map
        const updatedLinks = [...prevData.links];
        // Subtract the node's value from the old parent
        const prevNode = prevData.nodes.find((n) => n.index === nodeIndex);
        const prevCost = prevNode?.cost ?? 0;
        (updatedNodes as { value: number }[])[parentPos].value -= prevCost;

        // Update parent-child relationships in the map
        const updatedMap = updateParentChildMap(updatedLinks);

        // Add the node to the new parent (avoid duplicates)
        if (!updatedMap[newParentIndex]) {
          updatedMap[newParentIndex] = [];
        }
        if (!updatedMap[newParentIndex].includes(nodeIndex)) {
          updatedMap[newParentIndex].push(nodeIndex);
        }

        // Remove the node from the old parent
        if (updatedMap[parentIndex]) {
          updatedMap[parentIndex] = updatedMap[parentIndex].filter(
            (val) => val !== nodeIndex
          );
          // If the old parent has no children left, remove it from the map
          if (updatedMap[parentIndex].length === 0) {
            delete updatedMap[parentIndex];
          }
        }

        // Recalculate ALL links from the updated map - this handles everything including root->parent links
        const recalculatedData = calculateLinks(updatedNodes, updatedMap);
        return { nodes: recalculatedData.nodes, links: recalculatedData.links };
      }

      // No parent change, just cost
      const updatedMap = updateParentChildMap();
      const recalculatedData = calculateLinks(updatedNodes, updatedMap);
      return { nodes: recalculatedData.nodes, links: recalculatedData.links };
    });
  };

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

  const quickStats = useMemo(() => {
    const leafNodes = dataValue.nodes.filter((n) => n.isleaf && n.cost);
    const totalTransactionCost = leafNodes.reduce(
      (sum, n) => sum + (n.cost || 0),
      0
    );
    const avgTransaction =
      leafNodes.length > 0 ? totalTransactionCost / leafNodes.length : 0;

    return {
      avgTransaction,
      totalTransactions: leafNodes.length,
    };
  }, [dataValue.nodes]);

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

  // Unique set of parent category names (children of root only)
  const parentOptions = useMemo(() => {
    const rootLinks = dataValue.links.filter((link) => link.source === 0);
    const names = rootLinks
      .map((link) => dataValue.nodes.find((n) => n.index === link.target)?.name)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names)).sort();
  }, [dataValue.links, dataValue.nodes]);

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

  // Smart insights without AI
  const insights = useMemo(() => {
    const leafNodes = dataValue.nodes.filter((n) => n.isleaf && n.cost);
    if (leafNodes.length === 0) return [];

    const insights: Array<{
      type: "info" | "warning" | "success" | "tip";
      title: string;
      description: string;
      icon: string;
    }> = [];

    // Excluded Credit Card Payments total (from server meta)
    if (
      metaTotals?.creditCardPaymentsTotal &&
      metaTotals.creditCardPaymentsTotal > 0
    ) {
      insights.push({
        type: "info",
        title: "Credit Card Payments (excluded)",
        description: `You paid ${formatCurrency(
          metaTotals.creditCardPaymentsTotal
        )} toward credit cards this month. This is excluded from charts and totals.`,
        icon: "💳",
      });
    }

    // Top spending category
    if (categorySummary.length > 0) {
      const topCategory = categorySummary[0];
      const percentage = (topCategory.value / totalSpend) * 100;

      if (percentage > 40) {
        insights.push({
          type: "warning",
          title: "High Concentration",
          description: `${topCategory.name} accounts for ${percentage.toFixed(
            1
          )}% ($${topCategory.value.toFixed(
            2
          )}) of your total spending. Consider diversifying or reviewing these expenses.`,
          icon: "⚠️",
        });
      } else if (percentage > 30) {
        insights.push({
          type: "info",
          title: "Top Category",
          description: `${
            topCategory.name
          } is your largest expense at ${percentage.toFixed(
            1
          )}% ($${topCategory.value.toFixed(2)}) of total spending.`,
          icon: "📊",
        });
      }
    }

    // Average transaction analysis
    const avgTransaction = totalSpend / leafNodes.length;
    const highValueTransactions = leafNodes.filter(
      (n) => (n.cost || 0) > avgTransaction * 2
    );

    if (highValueTransactions.length > 0) {
      const totalHigh = highValueTransactions.reduce(
        (sum, n) => sum + (n.cost || 0),
        0
      );
      insights.push({
        type: "info",
        title: "Large Transactions",
        description: `${highValueTransactions.length} transaction${
          highValueTransactions.length > 1 ? "s" : ""
        } above $${(avgTransaction * 2).toFixed(
          2
        )} totaling $${totalHigh.toFixed(
          2
        )}. Review these for optimization opportunities.`,
        icon: "💰",
      });
    }

    // Small frequent transactions
    const smallTransactions = leafNodes.filter((n) => (n.cost || 0) < 10);
    if (smallTransactions.length > 5) {
      const totalSmall = smallTransactions.reduce(
        (sum, n) => sum + (n.cost || 0),
        0
      );
      insights.push({
        type: "tip",
        title: "Small Purchases Add Up",
        description: `${
          smallTransactions.length
        } transactions under $10 total $${totalSmall.toFixed(
          2
        )}. These small expenses accumulate over time.`,
        icon: "☕",
      });
    }

    // Payment sources diversity
    const uniqueSources = new Set(
      leafNodes.map((n) => n.file_source).filter(Boolean)
    );
    if (uniqueSources.size > 3) {
      insights.push({
        type: "info",
        title: "Multiple Payment Sources",
        description: `Using ${uniqueSources.size} different payment sources. Consolidating could simplify tracking and maximize rewards.`,
        icon: "💳",
      });
    }

    // Spending diversity (good sign)
    if (
      categorySummary.length >= 5 &&
      categorySummary[0].value / totalSpend < 0.35
    ) {
      insights.push({
        type: "success",
        title: "Well-Balanced Spending",
        description: `Your expenses are well-distributed across ${categorySummary.length} categories, showing balanced financial habits.`,
        icon: "✅",
      });
    }

    // Average per category
    const avgPerCategory = totalSpend / categorySummary.length;
    insights.push({
      type: "info",
      title: "Category Average",
      description: `Average spending per category is $${avgPerCategory.toFixed(
        2
      )}. Total tracked across ${categorySummary.length} categories.`,
      icon: "📈",
    });

    return insights;
  }, [dataValue.nodes, totalSpend, categorySummary]);

  return (
    <div className="relative min-h-screen overflow-x-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              ← Back to Home
            </button>
            <button
              type="button"
              onClick={() => router.push("/trends")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-gradient-to-r from-[#91C4C3] to-[#B4DEBD] px-4 py-2 text-sm font-medium text-slate-900 transition hover:from-[#7AAFAD] hover:to-[#9AC9A4]"
            >
              📈 View Trends
            </button>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Editing Month
            </p>
            <p className="text-lg font-semibold text-white">
              {month.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Navigation */}
            <div className="flex rounded-full border border-slate-700/70 bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setViewMode("treemap")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  viewMode === "treemap"
                    ? "bg-[#80A1BA] text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FiBarChart2 size={16} />
                TreeMap
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  viewMode === "table"
                    ? "bg-[#80A1BA] text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FiGrid size={16} />
                Table
              </button>
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
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-4">
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
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Avg transaction
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {quickStats ? formatCurrency(quickStats.avgTransaction) : "$0"}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Across {transactionCount} transactions
            </p>
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

        {/* Smart Search */}
        {chartReady && (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">
                Search Transactions
              </h3>
            </div>
            <SmartSearch
              nodes={dataValue.nodes}
              onSelectTransaction={handleEditTransaction}
            />
          </div>
        )}

        {/* Main Content Area */}
        {chartReady ? (
          <>
            {viewMode === "treemap" && (
              <>
                <TreeMapChart
                  key={`treemap-${dataValue.nodes.length}-${dataValue.links.length}`}
                  nodes={dataValue.nodes}
                  links={dataValue.links}
                  onEditTransaction={handleEditTransaction}
                  insights={insights}
                  excludedCategories={EXCLUDED_CATEGORIES}
                />

                {/* Helper Text */}
                <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-200 leading-relaxed">
                    💡 <strong>Tip:</strong> Click on any category box to see
                    all its transactions in a beautiful panel. Each transaction
                    can be edited with AI validation to catch errors
                    automatically.
                  </p>
                </div>
              </>
            )}

            {viewMode === "table" && (
              <>
                <TransactionTable
                  nodes={dataValue.nodes}
                  links={dataValue.links}
                  onEditTransaction={handleEditTransaction}
                />

                {/* Helper Text */}
                <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-200 leading-relaxed">
                    📋 <strong>Table View:</strong> Browse all transactions in
                    an Excel-style format. Use search and filters to find
                    specific transactions, or export to CSV.
                  </p>
                </div>
              </>
            )}
          </>
        ) : isLoading ? (
          <div className="flex h-[500px] items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/40">
            <div className="flex flex-col items-center gap-6 text-center">
              {/* Enhanced Loading Spinner */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-600 border-t-[#80A1BA] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-slate-400 border-t-[#91C4C3] rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border border-slate-300 border-t-[#B4DEBD] rounded-full animate-spin"></div>
                </div>
              </div>

              {/* Loading Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Processing Your Data
                </h3>
                <p className="text-slate-400 text-sm">
                  AI is analyzing and categorizing your transactions...
                </p>
              </div>

              {/* Animated Dots */}
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#80A1BA] rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-[#91C4C3] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-[#B4DEBD] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>

              {/* Progress Steps */}
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#80A1BA] rounded-full"></div>
                  <span>Fetching transaction data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#91C4C3] rounded-full animate-pulse"></div>
                  <span>AI categorization in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <span>Building visualization</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[500px] items-center justify-center rounded-3xl border border-slate-800/60 bg-slate-900/40 text-center text-slate-300">
            {infoMessage ?? "No data available yet."}
          </div>
        )}

        {/* Uploaded Files Panel */}
        {chartReady && session?.user?.email && month && (
          <UploadedFilesPanel userEmail={session.user.email} month={month} />
        )}
      </main>

      {isModalOpen &&
        parentIndex !== null &&
        nodeIndex !== null &&
        clickedNode !== null && (
          <InputModal
            clickedNode={clickedNode}
            initialParentName={
              dataValue.nodes.find((n) => n.index === parentIndex)?.name || ""
            }
            initialPrice={(
              dataValue.nodes.find((n) => n.index === nodeIndex)?.value ??
              dataValue.nodes.find((n) => n.index === nodeIndex)?.cost ??
              0
            ).toString()}
            onSubmit={handleModalSubmit}
            onClose={() => {
              setIsModalOpen(false);
            }}
            parentOptions={parentOptions}
          />
        )}
    </div>
  );
};

export default SankeyChartComponent;
