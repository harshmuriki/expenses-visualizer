"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import TreeMapChart from "./TreeMapChart";
import { calculateLinks } from "@/components/processLinks";
import InputModal from "./editNodes";
import AddTransactionModal from "./AddTransactionModal";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  SankeyNode,
  SankeyData,
  SnakeyChartComponentProps,
  SankeyLink,
} from "@/app/types/types";

// Import Material Web Components
if (typeof window !== 'undefined') {
  import('@material/web/button/filled-button.js');
  import('@material/web/button/outlined-button.js');
  import('@material/web/button/text-button.js');
  import('@material/web/button/filled-tonal-button.js');
  import('@material/web/progress/circular-progress.js');
  import('@material/web/fab/fab.js');
}

type Map = Record<number, number[]>;
import { uploadTransactionsInBatch } from "@/components/sendDataFirebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import UploadedFilesPanel from "./UploadedFilesPanel";
import TransactionTable from "./TransactionTable";
import SwipeableTransactionEditor from "./SwipeableTransactionEditor";
import CalendarView from "./CalendarView";
import { FiBarChart2, FiGrid, FiEdit3, FiPlus, FiSettings, FiCalendar, FiLoader, FiHome, FiTrendingUp, FiUpload, FiLogOut } from "react-icons/fi";
import { useTheme } from "@/lib/theme-context";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import StatsCards from "./StatsCards";
import { LLMSettings } from "./LLMSettings";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

const SankeyChartComponent: React.FC<SnakeyChartComponentProps> = ({}) => {
  const { theme, themeName } = useTheme();
  const [dataValue, setDataValue] = useState<SankeyData>({
    nodes: [],
    links: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLLMSettingsOpen, setIsLLMSettingsOpen] = useState(false);
  const [parentIndex, setParentIndex] = useState<number | null>(null);
  const [nodeIndex, setNodeIndex] = useState<number | null>(null);
  const [clickedNode, setNode] = useState<SankeyNode | null>(null);
  const [editingFromCategory, setEditingFromCategory] = useState<number | null>(
    null
  );
  const [returnToCategory, setReturnToCategory] = useState<number | null>(null);
  const [isViewTrendsLoading, setIsViewTrendsLoading] = useState(false);
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
  const [syncNotification, setSyncNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Show notification bubble that auto-dismisses
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setSyncNotification({ message, type });
    setTimeout(() => {
      setSyncNotification(null);
    }, 3000); // Auto-dismiss after 3 seconds
  };

  // Use theme-aware colors for categories
  const parentColors = useMemo(() => theme.categories, [theme]);
  const [viewMode, setViewMode] = useState<"treemap" | "table" | "editor" | "calendar">(
    "treemap"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = document.body;

    if (isModalOpen) {
      body.classList.add("modal-open");
    } else {
      body.classList.remove("modal-open");
    }

    return () => {
      body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  // Prefetch trends page for instant navigation
  useEffect(() => {
    router.prefetch("/trends");
  }, [router]);

  // Categories to exclude from TreeMap (but keep in Table and Insights)
  const EXCLUDED_CATEGORIES = ["Mobile Phone", "Credit Card Payment", "Others"];

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

  // Reset returnToCategory after it's been used
  React.useEffect(() => {
    if (returnToCategory !== null) {
      // Reset after a short delay to allow TreeMapChart to process it
      const timer = setTimeout(() => {
        setReturnToCategory(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [returnToCategory]);

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
            originalName: snapshotDoc.data().transaction, // Store original name for deletion tracking
            cost: snapshotDoc.data().cost || 0,
            index: snapshotDoc.data().index,
            isleaf: snapshotDoc.data().isleaf,
            value: snapshotDoc.data().cost || 0,
            visible: snapshotDoc.data().visible,
            date: snapshotDoc.data().date,
            location: snapshotDoc.data().location,
            bank: snapshotDoc.data().bank,
            raw_str: snapshotDoc.data().raw_str,
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
          // setLastUpdated(new Date());

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

  // const compactFormatter = useMemo(
  //   () =>
  //     new Intl.NumberFormat("en-US", {
  //       notation: "compact",
  //       maximumFractionDigits: 1,
  //     }),
  //   []
  // );

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
    setHasUnsavedChanges(false); // Clear unsaved changes flag
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

        // Ensure all required fields have valid values
        const safeTransactionName = node.name?.trim() || "Unnamed Transaction";
        const safeCost = typeof node.cost === "number" ? node.cost : 0;
        const safeIndex = typeof node.index === "number" ? node.index : 0;

        batchData.push({
          useremail: user?.email?.toString() || "",
          month: month,
          transaction: safeTransactionName,
          originalName: node.originalName, // Include original name for deletion tracking
          index: safeIndex,
          cost: safeCost,
          isleaf: isLeaf,
          isMap: false,
          key: null,
          values: null,
          visible: true,
          // Parent tags should always have current date; leaves default to now if missing
          date: isLeaf ? node.date ?? nowIso : nowIso,
          location: node.location ?? "None",
          bank: node.bank ?? "Unknown Bank",
          raw_str: node.raw_str || "None",
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
      // Debug: Log batch data to identify any remaining undefined values
      console.log("Batch data being sent to Firebase:", batchData.slice(0, 5)); // Log first 5 items for debugging

      await uploadTransactionsInBatch(batchData);

      console.log("Data saved to Firebase successfully!");
      showNotification("✅ Data synced to cloud successfully!", "success");
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      showNotification("❌ Failed to sync data to cloud", "error");
    }
  };

  /**
   * Handle editing a transaction or category from TreeMap
   */
  const handleEditTransaction = (nodeIndex: number) => {
    const clickedNode = dataValue.nodes.find((n) => n.index === nodeIndex);
    if (!clickedNode) {
      console.warn("Transaction not found for index:", nodeIndex);
      return;
    }

    setNodeIndex(nodeIndex);
    setNode(clickedNode);
    setEditingFromCategory(null); // Not editing from category panel

    // If it's a leaf node (transaction), find its parent
    if (clickedNode.isleaf) {
      // First, try to find parent via link
      let parentLink = dataValue.links.find(
        (link) => link.target === nodeIndex
      );
      
      if (parentLink) {
        setParentIndex(parentLink.source);
      } else {
        // If no parent link found, try to find a parent category node by name
        // This can happen if the transaction structure is different
        const categoryName = clickedNode.category;
        if (categoryName) {
          const parentNode = dataValue.nodes.find(
            (n) => !n.isleaf && n.name === categoryName
          );
          if (parentNode) {
            setParentIndex(parentNode.index);
          } else {
            // Last resort: use the first available category node or set to 0
            // This ensures the modal can still open
            const firstCategoryNode = dataValue.nodes.find((n) => !n.isleaf);
            setParentIndex(firstCategoryNode?.index ?? 0);
          }
        } else {
          // If no category name, use first category node or 0
          const firstCategoryNode = dataValue.nodes.find((n) => !n.isleaf);
          setParentIndex(firstCategoryNode?.index ?? 0);
        }
      }
      setIsModalOpen(true);
    } else {
      // If it's a parent node (category), we can edit the category name
      // For categories, we'll set the parentIndex to the category itself
      // and allow editing the category name
      setParentIndex(nodeIndex);
      setIsModalOpen(true);
    }
  };

  /**
   * Handle editing a transaction from within a category panel
   */
  const handleEditFromCategory = (nodeIndex: number, categoryIndex: number) => {
    const clickedNode = dataValue.nodes.find((n) => n.index === nodeIndex);
    if (!clickedNode) {
      console.warn("Clicked node not found for index:", nodeIndex);
      return;
    }

    setNodeIndex(nodeIndex);
    setNode(clickedNode);
    setEditingFromCategory(categoryIndex); // Track that we're editing from category panel

    // Find the parent link for the transaction
    const parentLink = dataValue.links.find(
      (link) => link.target === nodeIndex
    );
    
    if (parentLink) {
      setParentIndex(parentLink.source);
    } else {
      // If no parent link found, try to find parent by category name or use categoryIndex
      const categoryName = clickedNode.category;
      if (categoryName) {
        const parentNode = dataValue.nodes.find(
          (n) => !n.isleaf && n.name === categoryName
        );
        if (parentNode) {
          setParentIndex(parentNode.index);
        } else {
          // Use the categoryIndex if it's a valid node index
          const categoryNode = dataValue.nodes.find((n) => n.index === categoryIndex);
          if (categoryNode) {
            setParentIndex(categoryIndex);
          } else {
            // Last resort: use first category node or 0
            const firstCategoryNode = dataValue.nodes.find((n) => !n.isleaf);
            setParentIndex(firstCategoryNode?.index ?? 0);
          }
        }
      } else {
        // Use categoryIndex if available, otherwise use first category node
        const categoryNode = dataValue.nodes.find((n) => n.index === categoryIndex);
        if (categoryNode) {
          setParentIndex(categoryIndex);
        } else {
          const firstCategoryNode = dataValue.nodes.find((n) => !n.isleaf);
          setParentIndex(firstCategoryNode?.index ?? 0);
        }
      }
    }
    
    setIsModalOpen(true);
  };

  /**
   * Get category name for a transaction
   */
  const getCategoryName = useCallback(
    (nodeIndex: number): string => {
      const parentLink = dataValue.links.find(
        (link) => link.target === nodeIndex
      );
      if (parentLink) {
        const parentNode = dataValue.nodes.find(
          (n) => n.index === parentLink.source
        );
        return parentNode?.name || "Uncategorized";
      }
      return "Uncategorized";
    },
    [dataValue.links, dataValue.nodes]
  );

  /**
   * Handle transaction updates from the swipeable editor
   * Uses the same logic as TreeMap's handleModalSubmit
   */
  const handleTransactionUpdate = (
    nodeIndex: number,
    updates: { name?: string; cost?: number; category?: string }
  ) => {
    setDataValue((prevData) => {
      const updatedNodes = [...prevData.nodes];
      const nodePos = updatedNodes.findIndex((n) => n.index === nodeIndex);

      if (nodePos === -1) {
        console.warn("Could not locate node by index", { nodeIndex });
        return prevData;
      }

      // Get current parent index
      const currentParentLink = prevData.links.find(
        (link) => link.target === nodeIndex
      );
      const currentParentIndex = currentParentLink?.source;

      if (!currentParentIndex) {
        console.warn("Could not find parent for node", { nodeIndex });
        return prevData;
      }

      const parentPos = updatedNodes.findIndex(
        (n) => n.index === currentParentIndex
      );
      if (parentPos === -1) {
        console.warn("Could not locate parent by index", {
          currentParentIndex,
        });
        return prevData;
      }

      // Check if we're editing a category (parent node)
      const clickedNode = updatedNodes[nodePos];
      if (!clickedNode.isleaf) {
        // Editing a category - just update the category name
        updatedNodes[nodePos] = {
          ...updatedNodes[nodePos],
          name: updates.name || updatedNodes[nodePos].name,
        };

        // Recalculate links and return
        const { nodes: calculatedNodes, links: calculatedLinks } =
          calculateLinks(updatedNodes, updateParentChildMap(prevData.links));
        setHasUnsavedChanges(true); // Mark as having unsaved changes
        return {
          nodes: calculatedNodes,
          links: calculatedLinks,
        };
      }

      let newParentIndex = currentParentIndex; // graph index value for the parent
      const newParentName = updates.category || getCategoryName(nodeIndex);

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

      // Update the node's cost/value and name
      const newPrice =
        updates.cost !== undefined
          ? updates.cost
          : updatedNodes[nodePos].cost || 0;

      // Update the transaction name and cost
      const shouldUpdateName =
        updates.name !== undefined &&
        updates.name !== updatedNodes[nodePos].name;
      const shouldUpdateCost = updatedNodes[nodePos].cost !== newPrice;

      if (shouldUpdateName || shouldUpdateCost) {
        updatedNodes[nodePos] = {
          ...updatedNodes[nodePos],
          ...(shouldUpdateName && { name: updates.name }),
          ...(shouldUpdateCost && { cost: newPrice, value: newPrice }),
        };
      }

      // If the user actually changed the parent (not just the price)
      if (newParentIndex !== currentParentIndex) {
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
        if (updatedMap[currentParentIndex]) {
          updatedMap[currentParentIndex] = updatedMap[
            currentParentIndex
          ].filter((val) => val !== nodeIndex);
          // If the old parent has no children left, remove it from the map
          if (updatedMap[currentParentIndex].length === 0) {
            delete updatedMap[currentParentIndex];
          }
        }

        // Recalculate ALL links from the updated map - this handles everything including root->parent links
        const recalculatedData = calculateLinks(updatedNodes, updatedMap);
        setHasUnsavedChanges(true); // Mark as having unsaved changes
        return { nodes: recalculatedData.nodes, links: recalculatedData.links };
      }

      // No parent change, just cost
      const updatedMap = updateParentChildMap();
      const recalculatedData = calculateLinks(updatedNodes, updatedMap);
      setHasUnsavedChanges(true); // Mark as having unsaved changes
      return { nodes: recalculatedData.nodes, links: recalculatedData.links };
    });
  };

  /**
   * Handle form submission from the modal:
   * - Possibly create a new parent node or reuse an existing node
   * - Update the cost/value on the leaf node
   * - Update the parent's cost
   * - Update parentChildMap, recalculate links
   */
  const handleModalSubmit = (
    newParentName: string,
    newPrice: number,
    newTransactionName?: string
  ) => {
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

      // Check if we're editing a category (parent node)
      const clickedNode = updatedNodes[nodePos];
      if (!clickedNode.isleaf) {
        // Editing a category - just update the category name
        updatedNodes[nodePos] = {
          ...updatedNodes[nodePos],
          name: newTransactionName || updatedNodes[nodePos].name,
        };

        // Recalculate links and return
        const { nodes: calculatedNodes, links: calculatedLinks } =
          calculateLinks(updatedNodes, updateParentChildMap(prevData.links));
        setHasUnsavedChanges(true); // Mark as having unsaved changes
        return {
          nodes: calculatedNodes,
          links: calculatedLinks,
        };
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

      // Update the node's cost/value and name
      if (
        updatedNodes[nodePos].cost !== newPrice ||
        (newTransactionName &&
          updatedNodes[nodePos].name !== newTransactionName)
      ) {
        updatedNodes[nodePos] = {
          ...updatedNodes[nodePos],
          cost: newPrice,
          value: newPrice,
          name: newTransactionName || updatedNodes[nodePos].name,
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
        setHasUnsavedChanges(true); // Mark as having unsaved changes
        return { nodes: recalculatedData.nodes, links: recalculatedData.links };
      }

      // No parent change, just cost
      const updatedMap = updateParentChildMap();
      const recalculatedData = calculateLinks(updatedNodes, updatedMap);
      setHasUnsavedChanges(true); // Mark as having unsaved changes
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

  // const transactionCount = useMemo(
  //   () => dataValue.nodes.filter((node) => node.isleaf).length,
  //   [dataValue.nodes]
  // );

  // const quickStats = useMemo(() => {
  //   const leafNodes = dataValue.nodes.filter((n) => n.isleaf && n.cost);
  //   const totalTransactionCost = leafNodes.reduce(
  //     (sum, n) => sum + (n.cost || 0),
  //     0
  //   );
  //   const avgTransaction =
  //     leafNodes.length > 0 ? totalTransactionCost / leafNodes.length : 0;

  //   return {
  //     avgTransaction,
  //     totalTransactions: leafNodes.length,
  //   };
  // }, [dataValue.nodes]);

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

  // Filter out "Others" category for stats and insights (case-insensitive)
  const filteredCategorySummary = useMemo(() => {
    return categorySummary.filter(
      (cat) => !cat.name.toLowerCase().includes("other")
    );
  }, [categorySummary]);

  // Calculate filtered total spending (excluding "Others" category)
  const filteredTotalSpend = useMemo(() => {
    return filteredCategorySummary.reduce((sum, cat) => sum + cat.value, 0);
  }, [filteredCategorySummary]);

  // Unique set of parent category names (children of root only)
  const parentOptions = useMemo(() => {
    const rootLinks = dataValue.links.filter((link) => link.source === 0);
    const names = rootLinks
      .map((link) => dataValue.nodes.find((n) => n.index === link.target)?.name)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names)).sort();
  }, [dataValue.links, dataValue.nodes]);

  /**
   * Handle deleting a transaction locally (doesn't save to Firebase until sync)
   */
  const handleDeleteTransaction = () => {
    if (nodeIndex === null) return;

    setDataValue((prevData) => {
      const updatedNodes = [...prevData.nodes];
      const updatedLinks = [...prevData.links];

      // Find the transaction node
      const transactionNode = updatedNodes.find((n) => n.index === nodeIndex);
      if (!transactionNode || !transactionNode.isleaf) {
        console.warn("Cannot delete: not a leaf node or not found");
        return prevData;
      }

      const transactionCost = transactionNode.cost || 0;

      // Find the parent link
      const parentLink = updatedLinks.find((link) => link.target === nodeIndex);
      if (!parentLink) {
        console.warn("Cannot find parent link for transaction");
        return prevData;
      }

      const parentIndex = parentLink.source;

      // Remove the transaction node
      const filteredNodes = updatedNodes.filter((n) => n.index !== nodeIndex);

      // Remove the link from parent to transaction
      const filteredLinks = updatedLinks.filter((link) => link.target !== nodeIndex);

      // Update parent category cost
      const parentNodePos = filteredNodes.findIndex((n) => n.index === parentIndex);
      if (parentNodePos !== -1) {
        filteredNodes[parentNodePos] = {
          ...filteredNodes[parentNodePos],
          cost: Math.max(0, (filteredNodes[parentNodePos].cost || 0) - transactionCost),
          value: Math.max(0, (filteredNodes[parentNodePos].value || 0) - transactionCost),
        };

        // Update link from root to parent category
        const rootToParentLinkPos = filteredLinks.findIndex(
          (link) => link.source === 0 && link.target === parentIndex
        );
        if (rootToParentLinkPos !== -1) {
          filteredLinks[rootToParentLinkPos] = {
            ...filteredLinks[rootToParentLinkPos],
            value: Math.max(0, filteredLinks[rootToParentLinkPos].value - transactionCost),
          };
        }

        // Check if parent category still has children
        const parentHasChildren = filteredLinks.some((link) => link.source === parentIndex);

        // If parent has no more children, remove it
        if (!parentHasChildren && parentIndex !== 0) {
          // Remove parent node
          const finalNodes = filteredNodes.filter((n) => n.index !== parentIndex);
          // Remove link from root to parent
          const finalLinks = filteredLinks.filter(
            (link) => !(link.source === 0 && link.target === parentIndex)
          );

          // Update root node cost
          const rootNodePos = finalNodes.findIndex((n) => n.index === 0);
          if (rootNodePos !== -1) {
            finalNodes[rootNodePos] = {
              ...finalNodes[rootNodePos],
              cost: Math.max(0, (finalNodes[rootNodePos].cost || 0) - transactionCost),
              value: Math.max(0, (finalNodes[rootNodePos].value || 0) - transactionCost),
            };
          }

          showNotification("✅ Transaction deleted! Click 'Sync to Cloud' to save.", "success");
          setHasUnsavedChanges(true);

          return { nodes: finalNodes, links: enhanceLinks(finalLinks) };
        }
      }

      // Update root node cost
      const rootNodePos = filteredNodes.findIndex((n) => n.index === 0);
      if (rootNodePos !== -1) {
        filteredNodes[rootNodePos] = {
          ...filteredNodes[rootNodePos],
          cost: Math.max(0, (filteredNodes[rootNodePos].cost || 0) - transactionCost),
          value: Math.max(0, (filteredNodes[rootNodePos].value || 0) - transactionCost),
        };
      }

      showNotification("✅ Transaction deleted! Click 'Sync to Cloud' to save.", "success");
      setHasUnsavedChanges(true);

      return { nodes: filteredNodes, links: enhanceLinks(filteredLinks) };
    });

    // Close the modal
    setIsModalOpen(false);
  };

  /**
   * Handle adding a new transaction locally (doesn't save to Firebase until sync)
   */
  const handleAddTransaction = (
    transactionName: string,
    cost: number,
    category: string,
    date?: string,
    location?: string,
    bank?: string
  ) => {
    setDataValue((prevData) => {
      const updatedNodes = [...prevData.nodes];
      const updatedLinks = [...prevData.links];

      // Find or create category node
      const normalizedCategory = category.trim();
      const categoryNode = updatedNodes.find(
        (n) => !n.isleaf && n.name.toLowerCase() === normalizedCategory.toLowerCase()
      );

      let categoryIndex: number;

      if (!categoryNode) {
        // Create new category
        const validIndices = updatedNodes.map((n) => n.index).filter((idx) => typeof idx === "number" && !isNaN(idx));
        const maxIndex = validIndices.length > 0 ? Math.max(...validIndices) : 0;
        categoryIndex = maxIndex + 1;

        const newCategoryNode: SankeyNode = {
          name: normalizedCategory,
          originalName: normalizedCategory,
          index: categoryIndex,
          isleaf: false,
          visible: true,
          cost: cost, // Initial cost from first transaction
          value: cost,
          date: new Date().toISOString(),
          location: "None",
          bank: "Category",
          raw_str: "Category",
        };

        updatedNodes.push(newCategoryNode);

        // Add link from root to new category
        updatedLinks.push({
          source: 0,
          target: categoryIndex,
          value: cost,
        });
      } else {
        categoryIndex = categoryNode.index;

        // Update category cost
        const categoryPos = updatedNodes.findIndex((n) => n.index === categoryIndex);
        if (categoryPos !== -1) {
          updatedNodes[categoryPos] = {
            ...updatedNodes[categoryPos],
            cost: (updatedNodes[categoryPos].cost || 0) + cost,
            value: (updatedNodes[categoryPos].value || 0) + cost,
          };
        }

        // Update link from root to category
        const rootLinkPos = updatedLinks.findIndex(
          (link) => link.source === 0 && link.target === categoryIndex
        );
        if (rootLinkPos !== -1) {
          updatedLinks[rootLinkPos] = {
            ...updatedLinks[rootLinkPos],
            value: updatedLinks[rootLinkPos].value + cost,
          };
        }
      }

      // Create new transaction node
      const validIndices = updatedNodes.map((n) => n.index).filter((idx) => typeof idx === "number" && !isNaN(idx));
      const maxIndex = validIndices.length > 0 ? Math.max(...validIndices) : 0;
      const newTransactionIndex = maxIndex + 1;

      const newTransactionNode: SankeyNode = {
        name: transactionName,
        originalName: transactionName, // Add originalName field
        index: newTransactionIndex,
        cost: cost,
        value: cost,
        isleaf: true,
        visible: true,
        date: date || new Date().toISOString(),
        location: location || "None",
        bank: bank || "Manual Entry",
        raw_str: `Manual entry: ${transactionName}`,
      };

      updatedNodes.push(newTransactionNode);

      // Add link from category to transaction
      updatedLinks.push({
        source: categoryIndex,
        target: newTransactionIndex,
        value: cost,
      });

      // Update root node cost
      const rootNodePos = updatedNodes.findIndex((n) => n.index === 0);
      if (rootNodePos !== -1) {
        updatedNodes[rootNodePos] = {
          ...updatedNodes[rootNodePos],
          cost: (updatedNodes[rootNodePos].cost || 0) + cost,
          value: (updatedNodes[rootNodePos].value || 0) + cost,
        };
      }

      console.log("Added transaction:", {
        transaction: newTransactionNode,
        category: categoryIndex,
        categoryName: normalizedCategory,
        totalNodes: updatedNodes.length,
        totalLinks: updatedLinks.length,
      });

      showNotification("✅ Transaction added! Click 'Sync to Cloud' to save.", "success");
      setHasUnsavedChanges(true); // Mark as having unsaved changes

      return { nodes: updatedNodes, links: enhanceLinks(updatedLinks) };
    });
  };

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

    // Add "Others" category total if it exists
    const othersCategory = categorySummary.find((cat) =>
      cat.name.toLowerCase().includes("other")
    );
    if (othersCategory) {
      const othersPercentage = (othersCategory.value / totalSpend) * 100;
      insights.push({
        type: "info",
        title: "Others Expenses",
        description: `You have $${othersCategory.value.toFixed(
          2
        )} in Others expenses (${othersPercentage.toFixed(
          1
        )}% of total spending). These are not included in the total spending calculations.`,
        icon: "📝",
      });
    }

    // Top spending category
    if (filteredCategorySummary.length > 0) {
      const topCategory = filteredCategorySummary[0];
      const percentage = (topCategory.value / filteredTotalSpend) * 100;

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
    const avgTransaction = filteredTotalSpend / leafNodes.length;
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
    const uniqueSources = new Set(leafNodes.map((n) => n.bank).filter(Boolean));
    if (uniqueSources.size > 3) {
      insights.push({
        type: "info",
        title: "Multiple Banks/Cards",
        description: `Using ${uniqueSources.size} different banks or credit cards. Consolidating could simplify tracking and maximize rewards.`,
        icon: "💳",
      });
    }

    // Spending diversity (good sign)
    if (
      filteredCategorySummary.length >= 5 &&
      filteredCategorySummary[0].value / filteredTotalSpend < 0.35
    ) {
      insights.push({
        type: "success",
        title: "Well-Balanced Spending",
        description: `Your expenses are well-distributed across ${filteredCategorySummary.length} categories, showing balanced financial habits.`,
        icon: "✅",
      });
    }

    // Average per category
    const avgPerCategory = filteredTotalSpend / filteredCategorySummary.length;
    insights.push({
      type: "info",
      title: "Category Average",
      description: `Average spending per category is $${avgPerCategory.toFixed(
        2
      )}. Total tracked across ${filteredCategorySummary.length} categories.`,
      icon: "📈",
    });

    return insights;
  }, [
    dataValue.nodes,
    filteredTotalSpend,
    filteredCategorySummary,
    categorySummary,
    totalSpend,
    formatCurrency,
    metaTotals?.creditCardPaymentsTotal,
  ]);

  const sidebarLinks = [
    {
      label: "Home",
      href: "/",
      icon: <FiHome className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
    },
    {
      label: "TreeMap",
      href: "#",
      icon: <FiBarChart2 className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
      onClick: () => setViewMode("treemap"),
    },
    {
      label: "Calendar",
      href: "#",
      icon: <FiCalendar className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
      onClick: () => setViewMode("calendar"),
    },
    {
      label: "Table",
      href: "#",
      icon: <FiGrid className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
      onClick: () => setViewMode("table"),
    },
    {
      label: "Editor",
      href: "#",
      icon: <FiEdit3 className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
      onClick: () => setViewMode("editor"),
    },
    {
      label: "Trends",
      href: "/trends",
      icon: <FiTrendingUp className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
      onClick: () => {
        setIsViewTrendsLoading(true);
      },
    },
    {
      label: "Upload",
      href: "/",
      icon: <FiUpload className="h-5 w-5 flex-shrink-0" style={{ color: theme.text.primary }} />,
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-primary text-text-primary">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-4" style={{ backgroundColor: theme.background.secondary, borderRight: `1px solid ${theme.border.secondary}` }}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            {sidebarOpen ? (
              <div className="font-normal flex space-x-2 items-center py-2 relative z-20">
                <div className="h-6 w-6 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})` }} />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-sm whitespace-pre"
                  style={{ color: theme.text.primary }}
                >
                  Expenses Tracker
                </motion.span>
              </div>
            ) : (
              <div className="font-normal flex justify-center items-center py-2 relative z-20">
                <div className="h-6 w-6 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})` }} />
              </div>
            )}

            {/* Navigation Links */}
            <div className="mt-4 flex flex-col gap-0.5">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  className={viewMode === link.label.toLowerCase() ? "bg-background-tertiary" : ""}
                  {...(link.onClick && {
                    onClick: (e: React.MouseEvent) => {
                      e.preventDefault();
                      link.onClick?.();
                    },
                  })}
                />
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col gap-1.5 pt-3 border-t" style={{ borderColor: theme.border.secondary }}>
            {/* Settings */}
            <div onClick={() => setIsLLMSettingsOpen(true)} className="cursor-pointer">
              <md-text-button style={{ width: '100%', justifyContent: 'flex-start' }}>
                <FiSettings slot="icon" className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>Settings</span>}
              </md-text-button>
            </div>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ backgroundColor: theme.background.tertiary }}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs"
                  style={{ backgroundColor: theme.primary[500], color: theme.text.inverse }}
                >
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                      {user.name || user.email}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Logout */}
            <div onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer">
              <md-text-button style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--md-sys-color-error)' }}>
                <FiLogOut slot="icon" className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>Logout</span>}
              </md-text-button>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <div className="border-b px-4 py-3 flex items-center justify-between" style={{ backgroundColor: theme.background.secondary, borderColor: theme.border.secondary }}>
          <div className="flex-1">
            {/* Sync Notification */}
            {syncNotification && (
              <div
                className="px-4 py-2 rounded-lg md-typescale-label-large font-medium inline-block border"
                style={{
                  backgroundColor: syncNotification.type === "success"
                    ? 'var(--md-sys-color-tertiary-container)'
                    : 'var(--md-sys-color-error-container)',
                  color: syncNotification.type === "success"
                    ? 'var(--md-sys-color-on-tertiary-container)'
                    : 'var(--md-sys-color-on-error-container)',
                  borderColor: syncNotification.type === "success"
                    ? 'var(--md-sys-color-tertiary)'
                    : 'var(--md-sys-color-error)'
                }}
              >
                {syncNotification.message}
              </div>
            )}
          </div>

          {/* Month Display - Center */}
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: theme.text.tertiary }}>
              Transaction Month
            </p>
            <p className="text-lg font-bold" style={{ color: theme.text.primary }}>
              {month.toUpperCase()}
            </p>
          </div>

          <div className="flex-1"></div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {error && (
          <div
            className="rounded-xl border p-4 md-typescale-body-medium"
            style={{
              backgroundColor: 'var(--md-sys-color-error-container)',
              borderColor: 'var(--md-sys-color-error)',
              color: 'var(--md-sys-color-on-error-container)'
            }}
          >
            {error}
          </div>
        )}

        {infoMessage && !error && !isLoading && (
          <div
            className="rounded-xl border p-4 md-typescale-body-medium"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            {infoMessage}
          </div>
        )}

        {/* Sync Notification Bubble */}
        {syncNotification && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
            <div
              className="rounded-xl px-4 py-3 border md-typescale-body-medium"
              style={{
                backgroundColor: syncNotification.type === "success"
                  ? 'var(--md-sys-color-tertiary-container)'
                  : 'var(--md-sys-color-error-container)',
                color: syncNotification.type === "success"
                  ? 'var(--md-sys-color-on-tertiary-container)'
                  : 'var(--md-sys-color-on-error-container)',
                borderColor: syncNotification.type === "success"
                  ? 'var(--md-sys-color-tertiary)'
                  : 'var(--md-sys-color-error)',
                boxShadow: 'var(--md-sys-elevation-level3)'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {syncNotification.message}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show when chart is ready */}
        {chartReady && (
          <div className="mb-6">
            <StatsCards
              totalSpend={filteredTotalSpend}
              categoryCount={filteredCategorySummary.length}
              topCategory={
                filteredCategorySummary[0] || {
                  name: "N/A",
                  value: 0,
                  color: "#4fd1c5",
                }
              }
              transactionCount={dataValue.nodes.filter((n) => n.isleaf).length}
              avgTransaction={
                dataValue.nodes.filter((n) => n.isleaf).length > 0
                  ? filteredTotalSpend /
                    dataValue.nodes.filter((n) => n.isleaf).length
                  : 0
              }
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
                  onEditFromCategory={handleEditFromCategory}
                  returnToCategory={returnToCategory}
                  insights={insights}
                  excludedCategories={EXCLUDED_CATEGORIES}
                />
              </>
            )}

            {viewMode === "calendar" && (
              <>
                {/* Helper Text */}
                <div
                  className="rounded-xl border p-4 md-typescale-body-medium mb-6"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                    color: 'var(--md-sys-color-on-surface-variant)'
                  }}
                >
                  <p className="leading-relaxed">
                    📅 <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>Calendar View:</strong> See your expenses organized
                    by date. Click on any day to view all transactions for that date.
                    Perfect for tracking daily spending patterns.
                  </p>
                </div>

                <CalendarView
                  nodes={dataValue.nodes}
                  links={dataValue.links}
                  month={month}
                  onEditTransaction={handleEditTransaction}
                />
              </>
            )}

            {viewMode === "table" && (
              <>
                {/* Helper Text */}
                <div
                  className="rounded-xl border p-4 md-typescale-body-medium mb-6"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                    color: 'var(--md-sys-color-on-surface-variant)'
                  }}
                >
                  <p className="leading-relaxed">
                    📋 <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>Table View:</strong> Browse all transactions in
                    an Excel-style format. Use search and filters to find
                    specific transactions, or export to CSV.
                  </p>
                </div>

                <TransactionTable
                  nodes={dataValue.nodes}
                  links={dataValue.links}
                  onEditTransaction={handleEditTransaction}
                />
              </>
            )}

            {viewMode === "editor" && (
              <>
                <SwipeableTransactionEditor
                  nodes={dataValue.nodes}
                  links={dataValue.links}
                  onUpdateTransaction={handleTransactionUpdate}
                />

                {/* Helper Text */}
                <div
                  className="rounded-xl border p-4 md-typescale-body-medium mt-6"
                  style={{
                    backgroundColor: 'var(--md-sys-color-tertiary-container)',
                    borderColor: 'var(--md-sys-color-tertiary)',
                    color: 'var(--md-sys-color-on-tertiary-container)'
                  }}
                >
                  <p className="leading-relaxed">
                    ✏️ <strong>Transaction Editor:</strong> Swipe through your
                    transactions one by one. Edit names, amounts, and categories
                    with a beautiful card-based interface. Perfect for
                    fine-tuning your data.
                  </p>
                </div>
              </>
            )}
          </>
        ) : isLoading ? (
          <div
            className="flex h-[500px] items-center justify-center rounded-3xl border"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)'
            }}
          >
            <div className="flex flex-col items-center gap-6 text-center">
              {/* Material 3 Loading Spinner */}
              <md-circular-progress indeterminate />

              {/* Loading Text */}
              <div className="space-y-2">
                <h3 className="md-typescale-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  Processing Your Data
                </h3>
                <p className="md-typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  AI is analyzing and categorizing your transactions...
                </p>
              </div>

              {/* Animated Dots */}
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--md-sys-color-primary)' }}></div>
                <div
                  className="w-3 h-3 rounded-full animate-bounce"
                  style={{ backgroundColor: 'var(--md-sys-color-secondary)', animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full animate-bounce"
                  style={{ backgroundColor: 'var(--md-sys-color-tertiary)', animationDelay: "0.2s" }}
                ></div>
              </div>

              {/* Progress Steps */}
              <div className="md-typescale-body-small space-y-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--md-sys-color-primary)' }}></div>
                  <span>Fetching transaction data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--md-sys-color-secondary)' }}></div>
                  <span>AI categorization in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--md-sys-color-tertiary)' }}></div>
                  <span>Building visualization</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex h-[500px] items-center justify-center rounded-3xl border text-center md-typescale-body-large"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface-variant)'
            }}
          >
            {infoMessage ?? "No data available yet."}
          </div>
        )}

        {/* Uploaded Files Panel */}
        {chartReady && session?.user?.email && month && (
          <UploadedFilesPanel userEmail={session.user.email} month={month} />
        )}
        </main>

        {/* Floating Action Buttons - Bottom Right */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <md-fab
            onClick={() => setIsAddModalOpen(true)}
            label="Add Transaction"
            size="medium"
          >
            <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </md-fab>

          <md-filled-button
            onClick={sendDataToFirebase}
            disabled={syncDisabled}
            className="shadow-lg"
            style={{
              backgroundColor: hasUnsavedChanges ? '#ef4444' : undefined,
              '--md-filled-button-container-color': hasUnsavedChanges ? '#ef4444' : undefined,
            } as any}
          >
            {syncDisabled && isLoading ? (
              <>
                <md-circular-progress slot="icon" indeterminate style={{ width: '18px', height: '18px' }} />
                Loading…
              </>
            ) : (
              <>
                {hasUnsavedChanges && (
                  <span slot="icon" className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
                Sync to Cloud
              </>
            )}
          </md-filled-button>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen &&
        nodeIndex !== null &&
        clickedNode !== null && (
          <InputModal
            clickedNode={clickedNode}
            initialParentName={
              parentIndex !== null
                ? dataValue.nodes.find((n) => n.index === parentIndex)?.name ||
                  clickedNode.category ||
                  ""
                : clickedNode.category || ""
            }
            initialPrice={(
              dataValue.nodes.find((n) => n.index === nodeIndex)?.value ??
              dataValue.nodes.find((n) => n.index === nodeIndex)?.cost ??
              0
            ).toString()}
            onSubmit={handleModalSubmit}
            onClose={() => {
              setIsModalOpen(false);
              // If we were editing from a category panel, return to that category
              if (editingFromCategory !== null) {
                setReturnToCategory(editingFromCategory);
                setEditingFromCategory(null);
              }
            }}
            onDelete={handleDeleteTransaction}
            parentOptions={parentOptions}
          />
        )}

      {isAddModalOpen && (
        <AddTransactionModal
          onSubmit={handleAddTransaction}
          onClose={() => setIsAddModalOpen(false)}
          parentOptions={parentOptions}
        />
      )}

      {/* LLM Settings Modal */}
      {isLLMSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <LLMSettings onClose={() => setIsLLMSettingsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SankeyChartComponent;
