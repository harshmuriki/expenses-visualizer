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
} from "react-icons/fi";
import { useTheme } from "@/lib/theme-context";

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
  const { themeName } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("cost");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get background colors based on theme
  const getHeaderBackground = () => {
    if (themeName === "nordic") {
      return "bg-gradient-to-br from-slate-100 to-slate-200";
    }
    if (themeName === "cherryBlossom") {
      return "bg-gradient-to-br from-pink-50 to-rose-100";
    }
    return "bg-gradient-to-br from-slate-900/80 to-slate-800/60";
  };

  const getTableBackground = () => {
    if (themeName === "nordic") {
      return "bg-white/90";
    }
    if (themeName === "cherryBlossom") {
      return "bg-white/95";
    }
    return "bg-white/5";
  };

  const getTableHeaderBackground = () => {
    if (themeName === "nordic") {
      return "bg-gradient-to-r from-slate-200 to-slate-300";
    }
    if (themeName === "cherryBlossom") {
      return "bg-gradient-to-r from-pink-100 to-rose-200";
    }
    return "bg-gradient-to-r from-slate-800 to-slate-700";
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
  }, [transactions, searchQuery, categoryFilter, sortField, sortOrder]);

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

      {/* Excel-style Table */}
      <div
        className={`rounded-2xl border border-slate-800/60 ${getTableBackground()} overflow-hidden shadow-2xl`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead
              className={`${getTableHeaderBackground()} border-b-2 border-border-primary`}
            >
              <tr>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-background-tertiary/50 transition-colors border-r border-border-primary/50 min-w-[200px]"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Transaction <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-background-tertiary/50 transition-colors border-r border-border-primary/50 min-w-[120px]"
                  onClick={() => handleSort("cost")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount <SortIcon field="cost" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-background-tertiary/50 transition-colors border-r border-border-primary/50 min-w-[140px]"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-2">
                    Category <SortIcon field="category" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-background-tertiary/50 transition-colors border-r border-border-primary/50 min-w-[110px]"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-2">
                    Date <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-background-tertiary/50 transition-colors border-r border-border-primary/50 min-w-[150px]"
                  onClick={() => handleSort("location")}
                >
                  <div className="flex items-center gap-2">
                    Location <SortIcon field="location" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-primary hover:text-text-primary hover:bg-background-tertiary/50 transition-colors border-r border-border-primary/50 min-w-[120px]"
                  onClick={() => handleSort("source")}
                >
                  <div className="flex items-center gap-2">
                    Source <SortIcon field="source" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-text-primary min-w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-primary/30">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, idx) => (
                  <tr
                    key={transaction.index}
                    className={`transition-all duration-150 hover:bg-background-tertiary/30 hover:shadow-md border-b border-border-secondary/30 cursor-pointer ${
                      idx % 2 === 0
                        ? "bg-background-secondary/20"
                        : "bg-background-secondary/10"
                    }`}
                    onClick={() => onEditTransaction(transaction.index)}
                  >
                    <td className="px-4 py-3 text-sm text-text-primary border-r border-border-secondary/30 font-medium">
                      <div
                        className="truncate max-w-[180px]"
                        title={transaction.name || "Unnamed"}
                      >
                        {transaction.name || "Unnamed"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400 border-r border-border-secondary/30 tabular-nums">
                      ${(transaction.cost || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary border-r border-border-secondary/30">
                      <span className="inline-flex rounded-md border border-border-primary/50 bg-background-tertiary/40 px-2 py-1 text-xs font-medium">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary border-r border-border-secondary/30 tabular-nums">
                      {transaction.date ? (
                        <span className="font-mono text-xs">
                          {new Date(transaction.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "2-digit",
                              day: "2-digit",
                              year: "2-digit",
                            }
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary border-r border-border-secondary/30">
                      <div
                        className="truncate max-w-[130px]"
                        title={transaction.location || "-"}
                      >
                        {transaction.location || (
                          <span className="text-slate-500 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-tertiary border-r border-border-secondary/30">
                      <div
                        className="truncate max-w-[100px]"
                        title={transaction.bank || "-"}
                      >
                        {transaction.bank ? (
                          <span className="text-xs bg-background-tertiary/50 px-2 py-1 rounded font-mono">
                            {transaction.bank}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          onEditTransaction(transaction.index);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-[colors.primary.500] px-3 py-1.5 text-xs font-medium text-text-primary transition-all hover:bg-[colors.primary.600] hover:shadow-md active:scale-95"
                      >
                        <FiEdit2 size={12} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center bg-background-secondary/10"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FiSearch className="h-16 w-16 text-slate-600" />
                      <p className="text-text-tertiary text-lg font-medium">
                        No transactions found matching your filters
                      </p>
                      <p className="text-slate-500 text-sm">
                        Try adjusting your search criteria or category filter
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
