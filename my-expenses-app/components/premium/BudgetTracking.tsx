"use client";

import React, { useState, useEffect } from "react";
import { budgetUtils } from "@/lib/premiumFeatures";
import { Budget, BudgetSummary } from "@/app/types/types";
import {
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import PremiumModal from "./PremiumModal";
import { useToast, ToastContainer } from "./Toast";

interface BudgetTrackingProps {
  userId: string;
  month: string;
}

const BudgetTracking: React.FC<BudgetTrackingProps> = ({ userId, month }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [rollover, setRollover] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Common expense categories
  const categories = [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Travel",
    "Education",
    "Personal Care",
    "Investments",
    "Other",
  ];

  useEffect(() => {
    loadBudgets();
  }, [userId, month]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetUtils.getBudgetsByMonth(userId, month);
      setBudgets(data);
      setSummary(budgetUtils.calculateBudgetSummary(data));
    } catch (error) {
      console.error("Error loading budgets:", error);
      addToast("Failed to load budgets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !limit || parseFloat(limit) <= 0) {
      addToast("Please fill all fields correctly", "warning");
      return;
    }

    try {
      await budgetUtils.createBudget({
        userId,
        month,
        category,
        limit: parseFloat(limit),
        spent: 0,
        rollover,
      });

      addToast("Budget created successfully!", "success");
      setShowCreateModal(false);
      resetForm();
      await loadBudgets();
    } catch (error) {
      console.error("Error creating budget:", error);
      addToast("Failed to create budget", "error");
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBudget || !limit || parseFloat(limit) <= 0) {
      addToast("Please enter a valid limit", "warning");
      return;
    }

    try {
      // Update budget limit
      const budgetRef = { ...editingBudget, limit: parseFloat(limit) };
      await budgetUtils.deleteBudget(editingBudget.id);
      await budgetUtils.createBudget({
        userId: budgetRef.userId,
        month: budgetRef.month,
        category: budgetRef.category,
        limit: budgetRef.limit,
        spent: budgetRef.spent,
        rollover: budgetRef.rollover,
      });

      addToast("Budget updated successfully!", "success");
      setShowEditModal(false);
      setEditingBudget(null);
      resetForm();
      await loadBudgets();
    } catch (error) {
      console.error("Error updating budget:", error);
      addToast("Failed to update budget", "error");
    }
  };

  const handleDeleteBudget = async (budgetId: string, categoryName: string) => {
    if (!confirm(`Delete budget for ${categoryName}?`)) return;

    try {
      await budgetUtils.deleteBudget(budgetId);
      addToast("Budget deleted successfully", "success");
      await loadBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      addToast("Failed to delete budget", "error");
    }
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setLimit(budget.limit.toString());
    setRollover(budget.rollover);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setCategory("");
    setLimit("");
    setRollover(false);
    setEditingBudget(null);
  };

  const getProgressColor = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage < 80) return "bg-emerald-500";
    if (percentage < 100) return "bg-amber-500";
    return "bg-red-500";
  };

  const getProgressPercentage = (budget: Budget) => {
    return Math.min(100, (budget.spent / budget.limit) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-text-secondary">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header with Summary */}
      <div className="bg-background-card border border-border-secondary rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Budget Tracking
            </h2>
            <p className="text-text-secondary">
              Set spending limits and track your progress for {month}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            New Budget
          </button>
        </div>

        {summary && budgets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="w-5 h-5 text-emerald-500" />
                <p className="text-text-tertiary text-sm font-semibold">Total Budgeted</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                ${summary.totalBudgeted.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="w-5 h-5 text-blue-500" />
                <p className="text-text-tertiary text-sm font-semibold">Total Spent</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                ${summary.totalSpent.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiCheckCircle className="w-5 h-5 text-violet-500" />
                <p className="text-text-tertiary text-sm font-semibold">Budget Used</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {summary.percentageUsed.toFixed(0)}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-text-tertiary text-sm font-semibold">Over Budget</p>
              </div>
              <p className="text-3xl font-bold text-red-500">
                {summary.categoriesOverBudget}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="bg-background-card border border-border-secondary rounded-2xl p-12 text-center">
          <FiDollarSign className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Budgets Yet
          </h3>
          <p className="text-text-secondary mb-6">
            Create your first budget to start tracking your spending limits
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiPlus /> Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const percentage = getProgressPercentage(budget);
            const remaining = budget.limit - budget.spent;
            const isOverBudget = budget.spent > budget.limit;

            return (
              <div
                key={budget.id}
                className="group bg-background-card border border-border-secondary rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary mb-1">
                      {budget.category}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      ${budget.spent.toLocaleString()} of ${budget.limit.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-2 text-text-secondary hover:text-primary-500 hover:bg-background-secondary rounded-lg transition-colors"
                      title="Edit budget"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id, budget.category)}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-background-secondary rounded-lg transition-colors"
                      title="Delete budget"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-background-secondary rounded-full overflow-hidden mb-3">
                  <div
                    className={`absolute inset-y-0 left-0 ${getProgressColor(budget)} transition-all duration-500 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`font-semibold ${
                      remaining >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {remaining >= 0
                      ? `$${remaining.toLocaleString()} remaining`
                      : `$${Math.abs(remaining).toLocaleString()} over`}
                  </span>
                  <span className="text-text-tertiary font-medium">
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Over Budget Alert */}
                {isOverBudget && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      You've exceeded your budget by $
                      {Math.abs(remaining).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Near Limit Warning */}
                {!isOverBudget && percentage >= 80 && percentage < 100 && (
                  <div className="mt-4 flex items-center gap-2 text-amber-500 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      Approaching budget limit
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <PremiumModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Budget"
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-modern w-full"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Budget Limit ($)
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="input-modern w-full"
              placeholder="e.g., 500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rollover"
              checked={rollover}
              onChange={(e) => setRollover(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded"
            />
            <label htmlFor="rollover" className="text-sm text-text-secondary">
              Roll over unused budget to next month
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Budget
            </button>
          </div>
        </form>
      </PremiumModal>

      {/* Edit Budget Modal */}
      <PremiumModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title={`Edit ${editingBudget?.category} Budget`}
      >
        <form onSubmit={handleEditBudget} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              New Budget Limit ($)
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="input-modern w-full"
              placeholder="e.g., 500"
              min="0"
              step="0.01"
              required
            />
            {editingBudget && (
              <p className="text-xs text-text-tertiary mt-2">
                Current: ${editingBudget.limit.toLocaleString()} | Spent: $
                {editingBudget.spent.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Update Budget
            </button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
};

export default BudgetTracking;
