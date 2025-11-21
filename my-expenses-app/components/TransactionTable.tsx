"use client";

import React, { useState, useMemo, useCallback } from "react";
import { SankeyNode, SankeyLink } from "@/app/types/types";
import {
  FiEdit2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronUp,
  FiChevronDown,
  FiGrid,
  FiRepeat,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import { useTheme } from "@/lib/theme-context";
import {
  detectRecurringTransactions,
  getRecurringInfo,
  formatFrequency,
  calculateAnnualCost,
} from "@/lib/recurringTransactions";

interface TransactionTableProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  onEditTransaction: (nodeIndex: number) => void;
}

type SortField = "name" | "cost" | "category" | "date" | "location" | "source";
type SortOrder = "asc" | "desc";

const TransactionTable: React.FC<TransactionTableProps> = ({
  nodes,
  links,
  onEditTransaction,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("cost");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showRecurringInsights, setShowRecurringInsights] = useState(true);

  // Get background colors based on theme
  const getHeaderBackground = () => {
    if (theme.mode === "light") {
      return "bg-gradient-to-br from-primary-50/70 to-secondary-50/70";
    }
    return "bg-gradient-to-br from-primary-900/50 to-secondary-900/40";
  };

  const getTableBackground = () => {
    if (theme.mode === "light") {
      return "bg-background-card";
    }
    return "bg-background-card/60";
  };

  const getTableHeaderBackground = () => {
    if (theme.mode === "light") {
      return "bg-gradient-to-r from-primary-100/80 to-secondary-100/70";
    }
    return "bg-gradient-to-r from-primary-900/60 to-secondary-800/50";
  };

  // Get category name for each transaction
  const getCategoryName = useCallback(
    (nodeIndex: number): string => {
      const parentLink = links.find((link) => link.target === nodeIndex);
      if (parentLink) {
        const parentNode = nodes.find((n) => n.index === parentLink.source);
        return parentNode?.name || "Uncategorized";
      }
      return "Uncategorized";
    },
    [links, nodes]
  );

  // Process transactions with category info
  const transactions = useMemo(() => {
    return nodes
      .filter((node) => node.isleaf)
      .map((node) => ({
        ...node,
        category: getCategoryName(node.index),
      }));
  }, [nodes, getCategoryName]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Get unique sources for filter
  const sources = useMemo(() => {
    const srcs = new Set(
      transactions.map((t) => t.bank).filter((bank) => bank)
    );
    return Array.from(srcs).sort();
  }, [transactions]);

  // Detect recurring transactions
  const recurringTransactions = useMemo(() => {
    return detectRecurringTransactions(transactions);
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter out "Unnamed Transaction"
    filtered = filtered.filter((t) => t.name !== "Unnamed Transaction");

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.location?.toLowerCase().includes(query) ||
          t.bank?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Apply source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((t) => t.bank === sourceFilter);
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        return new Date(t.date) >= new Date(dateRange.start);
      });
    }
    if (dateRange.end) {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        return new Date(t.date) <= new Date(dateRange.end);
      });
    }

    // Apply amount range filter
    if (amountRange.min) {
      const minAmount = parseFloat(amountRange.min);
      filtered = filtered.filter((t) => (t.cost || 0) >= minAmount);
    }
    if (amountRange.max) {
      const maxAmount = parseFloat(amountRange.max);
      filtered = filtered.filter((t) => (t.cost || 0) <= maxAmount);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "cost":
          comparison = (a.cost || 0) - (b.cost || 0);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "date":
          comparison = (a.date || "").localeCompare(b.date || "");
          break;
        case "location":
          comparison = (a.location || "").localeCompare(b.location || "");
          break;
        case "source":
          comparison = (a.bank || "").localeCompare(b.bank || "");
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    transactions,
    searchQuery,
    categoryFilter,
    sourceFilter,
    dateRange,
    amountRange,
    sortField,
    sortOrder,
  ]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce(
      (sum, t) => sum + (t.cost || 0),
      0
    );
    const avg =
      filteredTransactions.length > 0 ? total / filteredTransactions.length : 0;
    return {
      count: filteredTransactions.length,
      total,
      avg,
      min: Math.min(...filteredTransactions.map((t) => t.cost || 0)),
      max: Math.max(...filteredTransactions.map((t) => t.cost || 0)),
    };
  }, [filteredTransactions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Transaction",
      "Amount",
      "Category",
      "Date",
      "Location",
      "Source",
    ];
    const rows = filteredTransactions.map((t) => [
      t.name || "",
      t.cost?.toFixed(2) || "0.00",
      t.category,
      t.date || "",
      t.location || "",
      t.bank || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <FiChevronUp className="inline ml-1" />
    ) : (
      <FiChevronDown className="inline ml-1" />
    );
  };

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category, index) => {
      const palette = theme.categories || [];
      map.set(category, palette[index % palette.length]);
    });
    return map;
  }, [categories, theme]);

  const getAvatarStyles = useCallback(
    (category: string) => {
      const base = categoryColorMap.get(category) || theme.primary[500];
      return {
        background: base,
        boxShadow: `0 10px 25px ${base}33`,
      };
    },
    [categoryColorMap, theme]
  );

  const getStatusInfo = (transaction: SankeyNode) => {
    const status =
      (typeof (transaction as any).status === "string"
        ? (transaction as any).status
        : undefined) || "completed";
    if (status.toLowerCase() === "pending") {
      return {
        label: "pending",
        classes:
          "text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold",
      };
    }
    return {
      label: "completed",
      classes:
        "text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold",
    };
  };

  const formatTimelineLabel = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const timeLabel = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (
      diffDays === 0 &&
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth()
    ) {
      return `Today, ${timeLabel}`;
    }
    if (
      diffDays === 1 ||
      (diffDays === 0 && date.getDate() === now.getDate() - 1)
    ) {
      return `Yesterday, ${timeLabel}`;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Excel-style Header with filters and stats */}
      <div
        className={`rounded-2xl border border-slate-800/60 ${getHeaderBackground()} p-6 shadow-xl`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <FiGrid className="text-[colors.primary.500]" size={24} />
              Transaction Spreadsheet
            </h3>
            <p className="text-sm text-text-secondary mt-2 font-medium">
              📊 {stats.count} transactions • 💰 Total: $
              {stats.total.toFixed(2)}
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-text-primary transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg active:scale-95"
          >
            <FiDownload size={16} />
            Export to Excel
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border-secondary bg-background-secondary py-2 pl-10 pr-4 text-text-primary placeholder-slate-400 focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-border-secondary bg-background-secondary py-2 pl-10 pr-4 text-text-primary focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <FiFilter size={14} />
            {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
            {showAdvancedFilters ? (
              <FiChevronUp size={14} />
            ) : (
              <FiChevronDown size={14} />
            )}
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4 rounded-lg border border-border-secondary bg-background-secondary/30">
              {/* Source Filter */}
              <div>
                <label className="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wide">
                  Source / Bank
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full rounded-lg border border-border-secondary bg-background-secondary py-2 px-3 text-sm text-text-primary focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
                >
                  <option value="all">All Sources</option>
                  {sources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wide">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-border-secondary bg-background-secondary py-2 px-3 text-xs text-text-primary focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
                    placeholder="Start"
                  />
                  <span className="text-text-tertiary self-center">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-border-secondary bg-background-secondary py-2 px-3 text-xs text-text-primary focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
                    placeholder="End"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wide">
                  Amount Range ($)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) =>
                      setAmountRange({ ...amountRange, min: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-border-secondary bg-background-secondary py-2 px-3 text-xs text-text-primary focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
                    placeholder="Min"
                    step="0.01"
                  />
                  <span className="text-text-tertiary self-center">-</span>
                  <input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) =>
                      setAmountRange({ ...amountRange, max: e.target.value })
                    }
                    className="flex-1 rounded-lg border border-border-secondary bg-background-secondary py-2 px-3 text-xs text-text-primary focus:border-[colors.primary.500] focus:outline-none focus:ring-1 focus:ring-[colors.primary.500]"
                    placeholder="Max"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  onClick={() => {
                    setSourceFilter("all");
                    setDateRange({ start: "", end: "" });
                    setAmountRange({ min: "", max: "" });
                    setCategoryFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-background-tertiary/50 hover:bg-background-tertiary rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Excel-style Summary Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border-secondary/60 bg-background-secondary/40 p-5 md:grid-cols-4 shadow-inner">
          <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">
              Average
            </p>
            <p className="text-xl font-bold text-text-primary tabular-nums">
              ${stats.avg.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">
              Minimum
            </p>
            <p className="text-xl font-bold text-[colors.accent.500] tabular-nums">
              ${stats.min.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">
              Maximum
            </p>
            <p className="text-xl font-bold text-text-primary tabular-nums">
              ${stats.max.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-1">
              Count
            </p>
            <p className="text-xl font-bold text-[colors.secondary.500] tabular-nums">
              {stats.count}
            </p>
          </div>
        </div>
      </div>

      {/* Recurring Transactions Insights */}
      {recurringTransactions.length > 0 && (
        <div
          className={`rounded-2xl border border-slate-800/60 ${getHeaderBackground()} p-6 shadow-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiRepeat className="text-[colors.primary.500]" size={24} />
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  Recurring Transactions
                </h3>
                <p className="text-sm text-text-secondary">
                  Detected {recurringTransactions.length} recurring pattern
                  {recurringTransactions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRecurringInsights(!showRecurringInsights)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {showRecurringInsights ? (
                <FiChevronUp size={20} />
              ) : (
                <FiChevronDown size={20} />
              )}
            </button>
          </div>

          {showRecurringInsights && (
            <div className="space-y-3">
              {recurringTransactions.slice(0, 5).map((recurring) => (
                <div
                  key={recurring.id}
                  className="rounded-lg border border-border-secondary bg-background-secondary/40 p-4 hover:bg-background-secondary/60 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-text-primary">
                          {recurring.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 rounded-md bg-background-tertiary px-2 py-1 text-xs font-medium text-text-secondary border border-border-primary">
                          <FiRepeat size={12} />
                          {formatFrequency(recurring.frequency)}
                        </span>
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                            recurring.confidence >= 0.7
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : recurring.confidence >= 0.5
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          }`}
                        >
                          {Math.round(recurring.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-text-tertiary text-xs mb-1">
                            Average Amount
                          </p>
                          <p className="font-semibold text-text-primary tabular-nums">
                            ${recurring.averageAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-xs mb-1">
                            Occurrences
                          </p>
                          <p className="font-semibold text-text-primary">
                            {recurring.transactions.length}x
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-xs mb-1">
                            Annual Cost
                          </p>
                          <p className="font-semibold text-text-primary tabular-nums">
                            ${calculateAnnualCost(recurring).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-xs mb-1">
                            Next Expected
                          </p>
                          <p className="font-semibold text-text-primary text-xs tabular-nums">
                            {recurring.nextExpectedDate
                              ? new Date(
                                  recurring.nextExpectedDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recurringTransactions.length > 5 && (
                <p className="text-center text-sm text-text-tertiary">
                  + {recurringTransactions.length - 5} more recurring
                  transaction{recurringTransactions.length - 5 !== 1 ? "s" : ""}
                </p>
              )}

              {/* Summary Stats */}
              <div className="mt-4 pt-4 border-t border-border-secondary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
                    <FiTrendingUp className="mx-auto mb-2 text-emerald-400" />
                    <p className="text-xs text-text-tertiary mb-1">
                      Total Annual Recurring
                    </p>
                    <p className="text-lg font-bold text-text-primary tabular-nums">
                      $
                      {recurringTransactions
                        .reduce((sum, r) => sum + calculateAnnualCost(r), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
                    <FiRepeat className="mx-auto mb-2 text-blue-400" />
                    <p className="text-xs text-text-tertiary mb-1">
                      Most Common Frequency
                    </p>
                    <p className="text-lg font-bold text-text-primary">
                      {formatFrequency(
                        recurringTransactions.sort(
                          (a, b) =>
                            recurringTransactions.filter(
                              (r) => r.frequency === b.frequency
                            ).length -
                            recurringTransactions.filter(
                              (r) => r.frequency === a.frequency
                            ).length
                        )[0]?.frequency || "N/A"
                      )}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background-tertiary/30 border border-border-primary/30">
                    <FiAlertCircle className="mx-auto mb-2 text-amber-400" />
                    <p className="text-xs text-text-tertiary mb-1">
                      High Confidence Patterns
                    </p>
                    <p className="text-lg font-bold text-text-primary">
                      {
                        recurringTransactions.filter((r) => r.confidence >= 0.7)
                          .length
                      }
                      /{recurringTransactions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity List */}
      <div className="rounded-3xl border border-border-secondary/60 bg-background-card/80 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-secondary/60 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-text-tertiary">
              Recent Activity
            </p>
            <h3 className="text-2xl font-bold text-text-primary mt-1">
              Transactions
            </h3>
          </div>
          <button
            onClick={exportToCSV}
            className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
          >
            View All
          </button>
        </div>
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border-secondary/40">
            {filteredTransactions.map((transaction) => {
              const statusInfo = getStatusInfo(transaction);
              const timelineLabel = formatTimelineLabel(transaction.date);
              const shortDate = formatShortDate(transaction.date);
              const amount = `$${(transaction.cost || 0).toFixed(2)}`;
              const recurringInfo = getRecurringInfo(
                transaction,
                recurringTransactions
              );

              return (
                <button
                  key={transaction.index}
                  onClick={() => onEditTransaction(transaction.index)}
                  className="w-full px-6 py-4 flex flex-wrap items-center gap-4 text-left transition hover:bg-white/5/10 hover:bg-background-secondary/40"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-semibold text-white uppercase shadow-lg"
                    style={getAvatarStyles(transaction.category)}
                  >
                    {(transaction.name || "P")[0]}
                  </div>

                  <div className="flex-1 min-w-[160px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-text-primary truncate max-w-[220px]">
                        {transaction.name || "Unnamed"}
                      </p>
                      <span className={statusInfo.classes}>
                        {statusInfo.label}
                      </span>
                      {recurringInfo && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-200">
                          <FiRepeat size={12} />
                          {formatFrequency(recurringInfo.frequency)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      {timelineLabel}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center">
                    <span className="inline-flex rounded-full border border-border-secondary/60 bg-background-secondary/40 px-3 py-1 text-xs font-semibold text-text-secondary">
                      {transaction.category}
                    </span>
                  </div>

                  <div className="hidden sm:flex w-24 text-sm text-text-tertiary">
                    {shortDate}
                  </div>

                  <div className="text-right min-w-[110px]">
                    <p className="text-lg font-bold text-text-primary tabular-nums">
                      {amount}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {transaction.bank || "Unknown"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-text-tertiary">
            <FiSearch className="mx-auto mb-3 h-10 w-10 text-text-secondary" />
            <p className="text-lg font-medium">
              No transactions found matching your filters
            </p>
            <p className="text-sm mt-1">
              Try adjusting your search criteria or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
