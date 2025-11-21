"use client";

import React, { useState, useMemo } from "react";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";
import { SankeyNode } from "@/app/types/types";

interface SmartSearchProps {
  nodes: SankeyNode[];
  onSelectTransaction: (nodeIndex: number) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  nodes,
  onSelectTransaction,
}) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    fileSource: "",
    dateRange: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Local search - no AI needed for simple queries
  const searchResults = useMemo(() => {
    if (!query && !filters.minAmount && !filters.maxAmount && !filters.fileSource) {
      return [];
    }

    const leafNodes = nodes.filter((n) => n.isleaf && n.cost);
    let results = leafNodes;

    // Text search (supports natural language-ish queries)
    if (query) {
      const lowerQuery = query.toLowerCase();

      // Check for amount queries like "$50" or "under $100"
      const amountMatch = query.match(/\$?(\d+\.?\d*)/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        if (query.includes("under") || query.includes("less than") || query.includes("<")) {
          results = results.filter((n) => (n.cost || 0) < amount);
        } else if (query.includes("over") || query.includes("more than") || query.includes(">")) {
          results = results.filter((n) => (n.cost || 0) > amount);
        } else if (query.includes("exactly") || query.includes("=")) {
          results = results.filter((n) => Math.abs((n.cost || 0) - amount) < 0.01);
        } else {
          // Default: search by text AND amount tolerance
          results = results.filter((n) => {
            const matchesText = n.name.toLowerCase().includes(lowerQuery);
            const matchesAmount = Math.abs((n.cost || 0) - amount) < amount * 0.1; // 10% tolerance
            return matchesText || matchesAmount;
          });
        }
      } else {
        // Text-only search
        results = results.filter((n) => {
          const matchesName = n.name.toLowerCase().includes(lowerQuery);
          const matchesLocation = n.location?.toLowerCase().includes(lowerQuery);
          const matchesSource = n.bank?.toLowerCase().includes(lowerQuery);
          return matchesName || matchesLocation || matchesSource;
        });
      }
    }

    // Apply numeric filters
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      results = results.filter((n) => (n.cost || 0) >= min);
    }

    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      results = results.filter((n) => (n.cost || 0) <= max);
    }

    // Apply bank filter
    if (filters.fileSource) {
      results = results.filter(
        (n) =>
          n.bank?.toLowerCase().includes(filters.fileSource.toLowerCase())
      );
    }

    // Sort by relevance (amount descending by default)
    return results.sort((a, b) => (b.cost || 0) - (a.cost || 0)).slice(0, 50); // Limit to 50 results
  }, [query, filters, nodes]);

  const clearSearch = () => {
    setQuery("");
    setFilters({
      minAmount: "",
      maxAmount: "",
      fileSource: "",
      dateRange: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "Starbucks", "over $100", or "Amazon"'
              className="w-full rounded-lg border border-border-secondary bg-background-secondary py-3 pl-10 pr-10 text-sm text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg border px-4 py-3 transition ${
              showFilters
                ? "border-primary-500 bg-primary-500/10 text-primary-500"
                : "border-border-secondary bg-background-secondary text-text-tertiary hover:text-text-primary"
            }`}
          >
            <FiFilter size={18} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid gap-4 rounded-xl border border-border-secondary bg-background-secondary/50 p-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Min Amount</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
              }
              placeholder="$0"
              className="w-full rounded-lg border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">Max Amount</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
              }
              placeholder="$999+"
              className="w-full rounded-lg border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-tertiary">
              Payment Source
            </label>
            <input
              type="text"
              value={filters.fileSource}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, fileSource: e.target.value }))
              }
              placeholder="e.g., Chase, Amex"
              className="w-full rounded-lg border border-border-secondary bg-background-primary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-text-tertiary">
            Found {searchResults.length} transaction{searchResults.length !== 1 ? "s" : ""}
          </p>
          <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-border-secondary bg-background-secondary/50 p-3">
            {searchResults.map((node) => (
              <button
                key={node.index}
                onClick={() => onSelectTransaction(node.index)}
                className="w-full rounded-lg border border-border-secondary bg-background-primary p-3 text-left transition hover:border-[colors.primary.500] hover:bg-background-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary">{node.name}</h4>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-tertiary">
                      {node.date && (
                        <span className="flex items-center gap-1">
                          <span className="text-text-tertiary">📅</span>
                          {node.date}
                        </span>
                      )}
                      {node.location && (
                        <span className="flex items-center gap-1">
                          <span className="text-text-tertiary">📍</span>
                          {node.location}
                        </span>
                      )}
                      {node.bank && (
                        <span className="flex items-center gap-1">
                          <span className="text-text-tertiary">🏦</span>
                          {node.bank}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">
                      ${node.cost?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {query && searchResults.length === 0 && (
        <div className="rounded-xl border border-border-secondary bg-background-secondary/50 p-8 text-center">
          <p className="text-text-tertiary">
            No transactions found matching &quot;{query}&quot;
          </p>
          <p className="mt-2 text-xs text-text-tertiary">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
