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
  insights = [],
  excludedCategories = [],
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Use theme-aware category colors
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
    const fontSize = Math.max(12, Math.min(width / 10, height / 5, 18));
    const valueFontSize = Math.max(11, Math.min(width / 12, height / 6, 16));

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width + 0.5}
          height={height + 0.5}
          style={{
            fill: color || theme.primary[500],
            stroke: isHovered ? theme.text.primary : "none",
            strokeWidth: isHovered ? 3 : 0,
            cursor: "pointer",
            opacity: isHovered ? 1 : 1,
            filter: isHovered ? "brightness(1.1)" : "none",
          }}
          onMouseEnter={() => setHoveredNode(name || "")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => {
            if (originalIndex !== undefined) {
              setSelectedCategory(originalIndex);
            }
          }}
        />
        {width > 50 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 6}
              textAnchor="middle"
              fill={theme.text.inverse}
              fontSize={fontSize}
              fontWeight="800"
              style={{
                pointerEvents: "none",
                letterSpacing: "0.3px",
                textShadow: `0 1px 3px ${theme.background.primary}`,
              }}
            >
              {name && name.length > 20
                ? name.substring(0, 17) + "..."
                : name || ""}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + fontSize + 4}
              textAnchor="middle"
              fill={theme.text.inverse}
              fontSize={valueFontSize}
              fontWeight="800"
              style={{
                pointerEvents: "none",
                textShadow: `0 1px 3px ${theme.background.primary}`,
              }}
            >
              ${(size || 0).toFixed(0)}
            </text>
          </>
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
      <div className="rounded-lg border border-border-secondary bg-background-primary/95 p-3 shadow-xl backdrop-blur">
        <p className="font-semibold text-text-primary">{data.name}</p>
        <p className="mt-1 text-lg font-bold text-emerald-400">
          ${data.size?.toFixed(2) || 0}
        </p>
        {data.transactionCount && (
          <p className="mt-1 text-xs text-text-tertiary">
            {data.transactionCount} transactions
          </p>
        )}
        <p className="mt-2 text-xs text-secondary-500">
          Click to view transactions
        </p>
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
        className="border border-slate-800/60 bg-background-primary/40 shadow-2xl"
        style={{ overflow: "hidden" }}
      >
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary">
            Expense Categories
          </h3>
          <p className="text-sm text-text-tertiary">
            Click any category to view transactions
          </p>
        </div>

        <div style={{ width: "100%", height: 500, position: "relative" }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <Treemap
              data={treeData.children}
              dataKey="size"
              stroke="none"
              fill="#8b5cf6"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border-secondary bg-background-primary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-secondary bg-gradient-to-r from-primary-500 to-secondary-500 p-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  {selectedCategoryNode?.name || "Category"}
                </h2>
                <p className="mt-1 text-sm text-text-primary/90">
                  {selectedTransactions.length} transactions · $
                  {totalCategoryAmount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg p-2 text-text-primary transition hover:bg-white/20"
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
                        className="group relative rounded-xl border border-border-secondary/60 bg-background-secondary/50 p-4 transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-text-primary">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <h3 className="font-semibold text-text-primary">
                                  {transaction.name}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-tertiary">
                                  {transaction.node?.date && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-slate-500">📅</span>
                                      {transaction.node.date}
                                    </span>
                                  )}
                                  {transaction.node?.location && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-slate-500">📍</span>
                                      {transaction.node.location}
                                    </span>
                                  )}
                                  {transaction.node?.file_source && (
                                    <span className="flex items-center gap-1">
                                      <span className="text-slate-500">🏦</span>
                                      {transaction.node.file_source}
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
                              <p className="text-xs text-text-tertiary">
                                {(
                                  (transaction.amount / totalCategoryAmount) *
                                  100
                                ).toFixed(1)}
                                % of category
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedCategory(null);
                                setTimeout(
                                  () => onEditTransaction(transaction.index),
                                  100
                                );
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
