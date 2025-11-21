"use client";

import React, { useState, useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { SankeyNode, SankeyLink } from "@/app/types/types";
import { FiX, FiEdit2, FiCheckCircle } from "react-icons/fi";
import { useTheme } from "@/lib/theme-context";
import InsightsPanel from "./InsightsPanel";

interface TreeMapChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  onEditTransaction: (nodeIndex: number) => void;
  onEditFromCategory?: (nodeIndex: number, categoryIndex: number) => void;
  returnToCategory?: number | null;
  insights?: Array<{
    type: "info" | "warning" | "success" | "tip";
    title: string;
    description: string;
    icon: string;
  }>;
  excludedCategories?: string[];
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({
  nodes,
  links,
  onEditTransaction,
  onEditFromCategory,
  returnToCategory,
  insights = [],
  excludedCategories = [],
}) => {
  const { theme, themeName } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Use theme-aware category colors (kept for potential future use)
  const CHART_COLORS = theme.categories;

  // Close panel on ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCategory !== null) {
        setSelectedCategory(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedCategory]);

  // Handle returning to category after editing
  React.useEffect(() => {
    if (returnToCategory !== null && returnToCategory !== undefined) {
      setSelectedCategory(returnToCategory);
    }
  }, [returnToCategory]);

  // Build tree data structure for TreeMap
  const treeData = useMemo(() => {
    const rootLinks = links.filter((link) => link.source === 0);

    const filteredRootLinks = rootLinks.filter((link) => {
      const categoryNode = nodes.find((n) => n.index === link.target);
      const categoryName = categoryNode?.name ?? "";
      return !excludedCategories.includes(categoryName);
    });

    const children = filteredRootLinks.map((link, idx) => {
      const categoryNode = nodes.find((n) => n.index === link.target);
      const categoryLinks = links.filter((l) => l.source === link.target);

      return {
        name: categoryNode?.name || `Category ${link.target}`,
        size: link.value,
        originalIndex: link.target,
        isCategory: true,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        transactionCount: categoryLinks.length,
      };
    });

    return {
      name: "Expenses",
      children: children.sort((a, b) => b.size - a.size),
    };
  }, [nodes, links, excludedCategories, CHART_COLORS]);

  // Get transactions for selected category
  const selectedTransactions = useMemo(() => {
    if (selectedCategory === null) return [];

    const categoryLinks = links.filter(
      (link) => link.source === selectedCategory
    );
    return categoryLinks
      .map((link) => {
        const transactionNode = nodes.find((n) => n.index === link.target);
        return {
          node: transactionNode,
          index: link.target,
          amount: transactionNode?.cost || 0,
          name: transactionNode?.name || "Unknown",
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [selectedCategory, nodes, links]);

  const selectedCategoryNode = useMemo(() => {
    if (selectedCategory === null) return null;
    return nodes.find((n) => n.index === selectedCategory);
  }, [selectedCategory, nodes]);

  const CustomContent = (props: {
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    size?: number;
    color?: string;
    originalIndex?: number;
  }) => {
    const { x, y, width, height, name, size, color, originalIndex } = props;

    if (width < 30 || height < 30 || !name) return null;

    const isHovered = hoveredNode === name;
    const fontSize = Math.max(14, Math.min(width / 8, height / 4, 20));
    const valueFontSize = Math.max(12, Math.min(width / 10, height / 5, 16));
    const borderRadius = 8; // Rounded corners

    // Add spacing between blocks (gap)
    const gap = 4;
    const adjustedX = x + gap / 2;
    const adjustedY = y + gap / 2;
    const adjustedWidth = Math.max(0, width - gap);
    const adjustedHeight = Math.max(0, height - gap);

    // Use the provided color or fallback to a dark gray
    // Slightly darken the color to work with dark theme while keeping it vibrant
    const baseColor = color || "#374151";

    // Convert hex to RGB and adjust brightness
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 55, g: 65, b: 81 }; // fallback to gray-700
    };

    const rgb = hexToRgb(baseColor);
    // Slightly darken the color (reduce by 15-20%) to work with dark background
    // but keep it vibrant enough to show the color
    const blockColor = `rgba(${Math.max(
      0,
      Math.floor(rgb.r * 0.75)
    )}, ${Math.max(0, Math.floor(rgb.g * 0.75))}, ${Math.max(
      0,
      Math.floor(rgb.b * 0.75)
    )}, 0.9)`;
    const hoverColor = `rgba(${Math.min(
      255,
      Math.floor(rgb.r * 0.9)
    )}, ${Math.min(255, Math.floor(rgb.g * 0.9))}, ${Math.min(
      255,
      Math.floor(rgb.b * 0.9)
    )}, 1)`;

    // Calculate max characters that fit in the block width
    // Approximate: each character is about 0.6 * fontSize wide
    // Use 85% of width to leave padding on sides
    const textPadding = 8;
    const availableWidth = adjustedWidth - textPadding * 2;
    const maxChars = Math.floor(availableWidth / (fontSize * 0.6));
    const truncatedName =
      name && name.length > maxChars
        ? name.substring(0, Math.max(0, maxChars - 3)) + "..."
        : name || "";

    // Create unique clip path ID for this block
    const clipId = `clip-${
      originalIndex !== undefined
        ? originalIndex
        : `${Math.floor(x)}-${Math.floor(y)}`
    }`;

    return (
      <g>
        {/* Define clip path to prevent text overflow */}
        <defs>
          <clipPath id={clipId}>
            <rect
              x={adjustedX}
              y={adjustedY}
              width={adjustedWidth}
              height={adjustedHeight}
              rx={borderRadius}
              ry={borderRadius}
            />
          </clipPath>
        </defs>

        {/* Rounded rectangle with spacing */}
        <rect
          x={adjustedX}
          y={adjustedY}
          width={adjustedWidth}
          height={adjustedHeight}
          rx={borderRadius}
          ry={borderRadius}
          style={{
            fill: isHovered ? hoverColor : blockColor,
            stroke: "none",
            cursor: "pointer",
            transition: "fill 0.2s ease",
          }}
          onMouseEnter={() => setHoveredNode(name || "")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => {
            if (originalIndex !== undefined) {
              setSelectedCategory(originalIndex);
            }
          }}
        />
        {adjustedWidth > 60 && adjustedHeight > 40 && (
          <g clipPath={`url(#${clipId})`}>
            {/* Category name - bold white text */}
            <text
              x={adjustedX + adjustedWidth / 2}
              y={adjustedY + adjustedHeight / 2 - 8}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={fontSize}
              fontWeight="700"
              style={{
                pointerEvents: "none",
                letterSpacing: "0.2px",
              }}
            >
              {truncatedName}
            </text>
            {/* Amount - lighter white text below */}
            <text
              x={adjustedX + adjustedWidth / 2}
              y={adjustedY + adjustedHeight / 2 + fontSize - 2}
              textAnchor="middle"
              fill="#E5E7EB"
              fontSize={valueFontSize}
              fontWeight="400"
              style={{
                pointerEvents: "none",
              }}
            >
              ${(size || 0).toFixed(0)}
            </text>
          </g>
        )}
      </g>
    );
  };

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div
        className="rounded-lg p-3 shadow-xl"
        style={{
          backgroundColor: "#374151",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <p className="font-semibold text-white">{data.name}</p>
        <p className="mt-1 text-lg font-bold text-white">
          ${data.size?.toFixed(2) || 0}
        </p>
        {data.transactionCount && (
          <p className="mt-1 text-xs text-gray-300">
            {data.transactionCount} transactions
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">Click to view transactions</p>
      </div>
    );
  };

  const totalCategoryAmount = selectedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* TreeMap Visualization */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#1F2937", // dark gray background
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/10">
          <h3 className="text-xl font-bold text-white">CATEGORY HEATMAP</h3>
          <p className="text-sm text-gray-400">
            Click any category to view transactions
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: 500,
            position: "relative",
            backgroundColor: "#111827", // darker background for the chart area
            padding: "16px",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <Treemap
              data={treeData.children}
              dataKey="size"
              stroke="none"
              fill="#374151"
              content={CustomContent as never}
              animationDuration={0}
              isAnimationActive={false}
              style={{ position: "absolute", left: 0, top: 0 }}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Detail Panel */}
      {selectedCategory !== null && (
        <div
          className="glass-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="glass-modal w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 backdrop-blur-sm p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">
                  {selectedCategoryNode?.name || "Category"}
                </h2>
                <p className="mt-1 text-sm text-gray-300">
                  {selectedTransactions.length} transactions · $
                  {totalCategoryAmount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg p-2 text-gray-100 transition hover:bg-white/20"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Transactions List */}
            <div
              className="overflow-y-auto p-6"
              style={{ maxHeight: "calc(90vh - 120px)" }}
            >
              {selectedTransactions.length > 0 ? (
                <div className="grid gap-3">
                  {selectedTransactions.map((transaction, idx) => {
                    return (
                      <div
                        key={transaction.index}
                        className="group relative glass-card p-4 transition-all hover:scale-[1.02] cursor-pointer text-white"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent closing the category panel
                          if (onEditFromCategory && selectedCategory !== null) {
                            // Close category panel first, then open edit modal
                            setSelectedCategory(null);
                            setTimeout(() => {
                              onEditFromCategory(
                                transaction.index,
                                selectedCategory
                              );
                            }, 100);
                          } else {
                            setSelectedCategory(null);
                            setTimeout(
                              () => onEditTransaction(transaction.index),
                              100
                            );
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-100">
                                  {transaction.name}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                                  {transaction.node?.date && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-gray-400">📅</span>
                                      {transaction.node.date}
                                    </span>
                                  )}
                                  {transaction.node?.location && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-gray-400">📍</span>
                                      {transaction.node.location}
                                    </span>
                                  )}
                                  {transaction.node?.bank && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-gray-400">🏦</span>
                                      {transaction.node.bank}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-400">
                                ${transaction.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {(
                                  (transaction.amount / totalCategoryAmount) *
                                  100
                                ).toFixed(1)}
                                % of category
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                if (
                                  onEditFromCategory &&
                                  selectedCategory !== null
                                ) {
                                  // Close category panel first, then open edit modal
                                  setSelectedCategory(null);
                                  setTimeout(() => {
                                    onEditFromCategory(
                                      transaction.index,
                                      selectedCategory
                                    );
                                  }, 100);
                                } else {
                                  setSelectedCategory(null);
                                  setTimeout(
                                    () => onEditTransaction(transaction.index),
                                    100
                                  );
                                }
                              }}
                              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-primary-600 group-hover:shadow-lg"
                            >
                              <FiEdit2 size={14} />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-text-tertiary">
                  <div className="text-center">
                    <FiCheckCircle className="mx-auto mb-2 h-12 w-12" />
                    <p>No transactions in this category</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-border-secondary bg-background-secondary/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-tertiary">
                  Showing {selectedTransactions.length} transaction
                  {selectedTransactions.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  Total: ${totalCategoryAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Panel */}
      {insights && insights.length > 0 && <InsightsPanel insights={insights} />}
    </div>
  );
};

export default TreeMapChart;
