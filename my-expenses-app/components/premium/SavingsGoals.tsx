"use client";

import React, { useState, useEffect } from "react";
import { goalsUtils } from "@/lib/premiumFeatures";
import { SavingsGoal, GoalsSummary } from "@/app/types/types";
import {
  FiTarget,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";
import PremiumModal from "./PremiumModal";
import { useToast, ToastContainer } from "./Toast";

interface SavingsGoalsProps {
  userId: string;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ userId }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<GoalsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [icon, setIcon] = useState("🎯");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");

  const { toasts, addToast, removeToast } = useToast();

  const goalCategories = [
    { name: "Emergency Fund", icon: "🚨", color: "#ef4444" },
    { name: "Vacation", icon: "🏖️", color: "#f59e0b" },
    { name: "Car", icon: "🚗", color: "#3b82f6" },
    { name: "House", icon: "🏠", color: "#8b5cf6" },
    { name: "Wedding", icon: "💒", color: "#ec4899" },
    { name: "Education", icon: "🎓", color: "#14b8a6" },
    { name: "Retirement", icon: "🏖️", color: "#10b981" },
    { name: "Other", icon: "💰", color: "#64748b" },
  ];

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsUtils.getGoals(userId);
      setGoals(data);
      setSummary(goalsUtils.calculateGoalsSummary(data));
    } catch (error) {
      console.error("Error loading goals:", error);
      addToast("Failed to load goals", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !targetAmount || !targetDate || !category) {
      addToast("Please fill all required fields", "warning");
      return;
    }

    const selectedCategory = goalCategories.find((c) => c.name === category);

    try {
      await goalsUtils.createGoal({
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        targetDate,
        category,
        priority,
        color: selectedCategory?.color || "#3b82f6",
        icon: selectedCategory?.icon || "💰",
      });

      addToast("Goal created successfully!", "success");
      setShowCreateModal(false);
      resetForm();
      await loadGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
      addToast("Failed to create goal", "error");
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoal || !contributionAmount || parseFloat(contributionAmount) <= 0) {
      addToast("Please enter a valid contribution amount", "warning");
      return;
    }

    try {
      await goalsUtils.addContribution({
        goalId: selectedGoal.id,
        userId,
        amount: parseFloat(contributionAmount),
        date: new Date().toISOString(),
        note: contributionNote,
        automatic: false,
      });

      addToast("Contribution added successfully!", "success");
      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributionAmount("");
      setContributionNote("");
      await loadGoals();
    } catch (error) {
      console.error("Error adding contribution:", error);
      addToast("Failed to add contribution", "error");
    }
  };

  const handleDeleteGoal = async (goalId: string, goalName: string) => {
    if (!confirm(`Delete goal "${goalName}"?`)) return;

    try {
      await goalsUtils.deleteGoal(goalId);
      addToast("Goal deleted successfully", "success");
      await loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      addToast("Failed to delete goal", "error");
    }
  };

  const openContributeModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setCategory("");
    setPriority("medium");
    setIcon("🎯");
  };

  const getProgressPercentage = (goal: SavingsGoal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getRequiredMonthlySavings = (goal: SavingsGoal) => {
    return goalsUtils.calculateRequiredMonthlySavings(goal);
  };

  const getDaysRemaining = (goal: SavingsGoal) => {
    const target = new Date(goal.targetDate);
    const today = new Date();
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeGoals = goals.filter((g) => !g.completedAt);
  const completedGoals = goals.filter((g) => g.completedAt);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-text-secondary">Loading goals...</p>
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
              Savings Goals
            </h2>
            <p className="text-text-secondary">
              Track your financial goals and celebrate milestones
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {summary && goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiTarget className="w-5 h-5 text-blue-500" />
                <p className="text-text-tertiary text-sm font-semibold">Total Goals</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">{summary.totalGoals}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="w-5 h-5 text-emerald-500" />
                <p className="text-text-tertiary text-sm font-semibold">Active</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">{summary.activeGoals}</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiAward className="w-5 h-5 text-violet-500" />
                <p className="text-text-tertiary text-sm font-semibold">Completed</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">{summary.completedGoals}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="w-5 h-5 text-amber-500" />
                <p className="text-text-tertiary text-sm font-semibold">Progress</p>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {summary.percentageComplete.toFixed(0)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Goals */}
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <div className="bg-background-card border border-border-secondary rounded-2xl p-12 text-center">
          <FiTarget className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Goals Yet</h3>
          <p className="text-text-secondary mb-6">
            Create your first savings goal to start tracking your financial progress
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiPlus /> Create Goal
          </button>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Active Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.map((goal) => {
                  const percentage = getProgressPercentage(goal);
                  const remaining = goal.targetAmount - goal.currentAmount;
                  const requiredMonthly = getRequiredMonthlySavings(goal);
                  const daysRemaining = getDaysRemaining(goal);

                  return (
                    <div
                      key={goal.id}
                      className="group bg-background-card border border-border-secondary rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg"
                      style={{ borderColor: `${goal.color}20` }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{goal.icon}</span>
                          <div>
                            <h4 className="text-lg font-bold text-text-primary">{goal.name}</h4>
                            <p className="text-xs text-text-tertiary">{goal.category}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(goal.id, goal.name)}
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-background-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress Circle */}
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-background-secondary"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={goal.color}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-text-primary">
                            {percentage.toFixed(0)}%
                          </span>
                          <span className="text-xs text-text-tertiary">Complete</span>
                        </div>
                      </div>

                      {/* Amount Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-tertiary">Current</span>
                          <span className="font-semibold text-text-primary">
                            ${goal.currentAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-tertiary">Target</span>
                          <span className="font-semibold text-text-primary">
                            ${goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-tertiary">Remaining</span>
                          <span className="font-semibold" style={{ color: goal.color }}>
                            ${remaining.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Required Monthly */}
                      <div className="bg-background-secondary rounded-lg p-3 mb-4">
                        <p className="text-xs text-text-tertiary mb-1">Required Monthly</p>
                        <p className="text-lg font-bold text-text-primary">
                          ${requiredMonthly.toFixed(0)}
                        </p>
                      </div>

                      {/* Days Remaining */}
                      <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          {daysRemaining > 0
                            ? `${daysRemaining} days remaining`
                            : "Overdue"}
                        </span>
                      </div>

                      {/* Add Contribution Button */}
                      <button
                        onClick={() => openContributeModal(goal)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add Contribution
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <FiAward className="w-6 h-6 text-emerald-500" />
                Completed Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{goal.icon}</span>
                      <div>
                        <h4 className="text-lg font-bold text-text-primary">{goal.name}</h4>
                        <p className="text-xs text-emerald-500 font-semibold">✓ Completed</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-text-primary mb-2">
                      ${goal.targetAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Completed on{" "}
                      {goal.completedAt &&
                        new Date(goal.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Goal Modal */}
      <PremiumModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Goal"
        size="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern w-full"
              placeholder="e.g., Dream Vacation"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const selected = goalCategories.find((c) => c.name === e.target.value);
                  if (selected) setIcon(selected.icon);
                }}
                className="input-modern w-full"
                required
              >
                <option value="">Select category</option>
                {goalCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="input-modern w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Target Amount ($)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="input-modern w-full"
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input-modern w-full"
                required
              />
            </div>
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
              Create Goal
            </button>
          </div>
        </form>
      </PremiumModal>

      {/* Add Contribution Modal */}
      <PremiumModal
        isOpen={showContributeModal}
        onClose={() => {
          setShowContributeModal(false);
          setSelectedGoal(null);
          setContributionAmount("");
          setContributionNote("");
        }}
        title={`Add Contribution to ${selectedGoal?.name}`}
      >
        <form onSubmit={handleAddContribution} className="space-y-4">
          {selectedGoal && (
            <div className="bg-background-secondary rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-tertiary">Current</span>
                <span className="font-semibold text-text-primary">
                  ${selectedGoal.currentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Target</span>
                <span className="font-semibold text-text-primary">
                  ${selectedGoal.targetAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Contribution Amount ($)
            </label>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="input-modern w-full"
              placeholder="e.g., 100"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Note (optional)
            </label>
            <textarea
              value={contributionNote}
              onChange={(e) => setContributionNote(e.target.value)}
              className="input-modern w-full"
              placeholder="e.g., Bonus payment"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowContributeModal(false);
                setSelectedGoal(null);
                setContributionAmount("");
                setContributionNote("");
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add Contribution
            </button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
};

export default SavingsGoals;
