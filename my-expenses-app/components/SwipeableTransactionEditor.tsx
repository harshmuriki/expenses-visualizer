"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { SankeyNode, SankeyLink } from "@/app/types/types";
import {
  FiEdit2,
  FiSave,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
} from "react-icons/fi";

interface SwipeableTransactionEditorProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  onUpdateTransaction: (
    nodeIndex: number,
    updates: { name?: string; cost?: number; category?: string }
  ) => void;
}

const SwipeableTransactionEditor: React.FC<SwipeableTransactionEditorProps> = ({
  nodes,
  links,
  onUpdateTransaction,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editData, setEditData] = useState<{
    name: string;
    cost: number;
    category: string;
  }>({ name: "", cost: 0, category: "" });

  // Touch gesture handling
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  // Ref for price input to auto-focus
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Get all leaf transactions (actual transactions, not categories)
  const transactions = useMemo(() => {
    return nodes.filter((node) => node.isleaf);
  }, [nodes]);

  // Get category name for a transaction
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

  // Get all unique categories for the dropdown
  const categories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((transaction) => {
      const category = getCategoryName(transaction.index);
      cats.add(category);
    });
    return Array.from(cats).sort();
  }, [transactions, getCategoryName]);

  const currentTransaction = transactions[currentIndex];
  const currentCategory = currentTransaction
    ? getCategoryName(currentTransaction.index)
    : "";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleEdit = () => {
    if (currentTransaction) {
      setEditData({
        name: currentTransaction.name || "",
        cost: currentTransaction.cost || 0,
        category: currentCategory,
      });
      setIsEditing(true);
    }
  };

  // Update edit data when card changes (only when index changes, not when data changes)
  useEffect(() => {
    if (currentTransaction) {
      setEditData({
        name: currentTransaction.name || "",
        cost: currentTransaction.cost || 0,
        category: currentCategory,
      });
    }
  }, [currentIndex, currentCategory]); // Only depend on currentIndex, not currentTransaction

  const handleSave = () => {
    if (currentTransaction) {
      onUpdateTransaction(currentTransaction.index, {
        name: editData.name,
        cost: editData.cost,
        category: editData.category,
      });

      // Go to next card after saving with transition animation
      if (currentIndex < transactions.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setIsEditing(true); // Auto-enter edit mode
          setIsTransitioning(false);
        }, 150);
      }
    }
  };

  // Auto-focus price input when card changes
  useEffect(() => {
    if (priceInputRef.current && isEditing) {
      priceInputRef.current.focus();
      priceInputRef.current.select(); // Select all text for easy editing
    }
  }, [currentIndex, isEditing]);

  // Handle keyboard navigation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Enter: Go to previous card
        handlePrevious();
      } else {
        // Enter: Save and continue
        handleSave();
      }
    } else if (e.key === "ArrowLeft" && e.target === e.currentTarget) {
      // Only navigate if focused on the container, not an input field
      e.preventDefault();
      handlePrevious();
    } else if (e.key === "ArrowRight" && e.target === e.currentTarget) {
      // Only navigate if focused on the container, not an input field
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowUp" && e.target !== e.currentTarget) {
      // Move to previous form field
      e.preventDefault();
      const form = e.currentTarget.querySelector("form") || e.currentTarget;
      const inputs = Array.from(form.querySelectorAll("input, select"));
      const currentIndex = inputs.indexOf(e.target as Element);
      if (currentIndex > 0) {
        (inputs[currentIndex - 1] as HTMLElement).focus();
      }
    } else if (e.key === "ArrowDown" && e.target !== e.currentTarget) {
      // Move to next form field
      e.preventDefault();
      const form = e.currentTarget.querySelector("form") || e.currentTarget;
      const inputs = Array.from(form.querySelectorAll("input, select"));
      const currentIndex = inputs.indexOf(e.target as Element);
      if (currentIndex < inputs.length - 1) {
        (inputs[currentIndex + 1] as HTMLElement).focus();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsEditing(true); // Auto-enter edit mode
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleNext = () => {
    if (currentIndex < transactions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsEditing(true); // Auto-enter edit mode
        setIsTransitioning(false);
      }, 150);
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    touchEndY.current = e.changedTouches[0].clientY;
    handleSwipe();
  };

  const handleSwipe = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        handlePrevious();
      } else {
        // Swipe left - go to next
        handleNext();
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-3xl border border-border-secondary bg-background-card">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Transactions Found
          </h3>
          <p className="text-text-tertiary">
            Upload some transaction data to start editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
          <span className="text-2xl">📝</span>
          <div className="text-left">
            <h2 className="text-lg font-bold text-text-primary">
              Transaction Editor
            </h2>
            <p className="text-xs text-text-tertiary">
              Review and edit your transactions
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-base font-bold text-text-primary">
              Transaction {currentIndex + 1} <span className="text-text-tertiary font-normal">of {transactions.length}</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30">
              <span className="text-sm font-semibold text-primary-500">
                {Math.round(((currentIndex + 1) / transactions.length) * 100)}% complete
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg border border-border-secondary bg-background-card hover:bg-background-tertiary text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              title="Previous (←)"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === transactions.length - 1}
              className="p-2 rounded-lg border border-border-secondary bg-background-card hover:bg-background-tertiary text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              title="Next (→)"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{
                width: `${((currentIndex + 1) / transactions.length) * 100}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Card - Large Square */}
      <div className="flex justify-center">
        <div
          className={`w-full max-w-2xl rounded-3xl border-2 border-border-secondary bg-gradient-to-br from-background-card via-background-card to-background-secondary/50 p-8 shadow-2xl touch-pan-y transition-all duration-300 ease-out backdrop-blur-sm ${
            isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100 hover:shadow-3xl"
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ minHeight: "550px" }}
        >
          {isEditing ? (
            <div className="h-full flex flex-col animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              {/* Card Header */}
              <div className="mb-6 pb-4 border-b border-border-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/10">
                    <FiEdit2 className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      Edit Transaction
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      Update transaction details
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-5 flex-1">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                    <span className="text-lg">🏷️</span>
                    Transaction Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-border-secondary bg-background-primary text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 ease-out font-medium shadow-sm hover:shadow-md"
                    placeholder="Enter transaction name"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                    <span className="text-lg">💰</span>
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-primary-500">
                      $
                    </span>
                    <input
                      ref={priceInputRef}
                      type="number"
                      step="0.01"
                      value={editData.cost}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          cost: parseFloat(e.target.value) || 0,
                        })
                      }
                      onKeyDown={(e) => {
                        // Prevent arrow keys from changing the number value
                        if (["ArrowUp", "ArrowDown"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-border-secondary bg-background-primary text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 ease-out text-lg font-semibold shadow-sm hover:shadow-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                    <FiTag className="w-4 h-4" />
                    Category
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-border-secondary bg-background-primary text-text-primary focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 ease-out font-medium shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Metadata */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wide flex items-center gap-2">
                    <span className="h-px flex-1 bg-border-secondary"></span>
                    <span>Transaction Details</span>
                    <span className="h-px flex-1 bg-border-secondary"></span>
                  </div>

                  {currentTransaction?.bank && (
                    <div className="rounded-xl border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/10">
                          <span className="text-2xl">🏦</span>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-text-tertiary mb-1">
                            Bank/Source
                          </label>
                          <span className="text-base font-bold text-text-primary">
                            {currentTransaction.bank}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date & Location Info */}
                  {(currentTransaction?.date || currentTransaction?.location) && (
                    <div className="grid grid-cols-2 gap-3">
                      {currentTransaction?.date && (
                        <div className="rounded-xl border border-border-secondary bg-background-tertiary/40 p-3 hover:bg-background-tertiary/60 transition-colors">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary mb-1.5">
                            <span>📅</span>
                            Date
                          </label>
                          <span className="text-sm font-medium text-text-primary block">
                            {new Date(currentTransaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {currentTransaction?.location && (
                        <div className="rounded-xl border border-border-secondary bg-background-tertiary/40 p-3 hover:bg-background-tertiary/60 transition-colors">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary mb-1.5">
                            <span>📍</span>
                            Location
                          </label>
                          <span className="text-sm font-medium text-text-primary truncate block" title={currentTransaction.location}>
                            {currentTransaction.location}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw Transaction Data */}
                  {currentTransaction?.raw_str && (
                    <div className="rounded-xl border border-border-secondary bg-background-tertiary/30 p-3">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary mb-2">
                        <span>📄</span>
                        Original Data
                      </label>
                      <div className="max-h-24 overflow-y-auto rounded-lg bg-background-primary/50 p-2 border border-border-secondary/50">
                        <code className="text-xs text-text-secondary font-mono break-all leading-relaxed">
                          {currentTransaction.raw_str}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Keyboard shortcuts */}
              <div className="mt-auto pt-6 space-y-4">
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FiSave className="w-5 h-5" />
                  Save & Continue
                  {currentIndex < transactions.length - 1 && (
                    <FiChevronRight className="w-5 h-5" />
                  )}
                </button>

                {/* Status & Shortcuts */}
                <div className="text-center">
                  {currentIndex === transactions.length - 1 ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-green-500 font-semibold text-sm">
                        Last transaction!
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-tertiary">
                      <kbd className="px-2 py-1 rounded bg-background-tertiary border border-border-secondary font-mono">Enter</kbd>
                      <span>save & next</span>
                      <span className="text-border-secondary">•</span>
                      <kbd className="px-2 py-1 rounded bg-background-tertiary border border-border-secondary font-mono">Shift+Enter</kbd>
                      <span>previous</span>
                      <span className="text-border-secondary">•</span>
                      <kbd className="px-2 py-1 rounded bg-background-tertiary border border-border-secondary font-mono">↑↓</kbd>
                      <span>fields</span>
                      <span className="text-border-secondary">•</span>
                      <kbd className="px-2 py-1 rounded bg-background-tertiary border border-border-secondary font-mono">←→</kbd>
                      <span>cards</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Transaction Display */}
              <div className="space-y-4 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-text-primary mb-2">
                      {currentTransaction?.name || "Unnamed Transaction"}
                    </h4>
                    <div className="text-2xl font-bold text-primary-500">
                      {formatCurrency(currentTransaction?.cost || 0)}
                    </div>
                  </div>

                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-secondary bg-background-card hover:bg-background-tertiary text-text-primary font-medium transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-1">
                        Category
                      </label>
                      <div className="flex items-center gap-2">
                        <FiTag className="w-4 h-4 text-text-tertiary" />
                        <span className="text-text-primary font-medium">
                          {currentCategory}
                        </span>
                      </div>
                    </div>

                    {currentTransaction?.date && (
                      <div>
                        <label className="block text-sm font-medium text-text-tertiary mb-1">
                          Date
                        </label>
                        <span className="text-text-primary">
                          {new Date(
                            currentTransaction.date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {currentTransaction?.location && (
                      <div>
                        <label className="block text-sm font-medium text-text-tertiary mb-1">
                          Location
                        </label>
                        <span className="text-text-primary">
                          {currentTransaction.location}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {currentTransaction?.bank && (
                      <div>
                        <label className="block text-sm font-medium text-text-tertiary mb-1">
                          Bank
                        </label>
                        <span className="text-text-primary">
                          {currentTransaction.bank}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw String */}
                {currentTransaction?.raw_str && (
                  <div className="mt-auto">
                    <label className="block text-xs font-medium text-text-tertiary mb-1">
                      Raw Data
                    </label>
                    <div className="p-3 rounded-lg bg-background-tertiary border border-border-secondary max-h-32 overflow-y-auto">
                      <code className="text-xs text-text-secondary font-mono break-all">
                        {currentTransaction.raw_str}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTransactionEditor;
