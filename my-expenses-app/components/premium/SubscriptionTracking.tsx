"use client";

import React, { useState, useEffect } from "react";
import { subscriptionsUtils } from "@/lib/premiumFeatures";
import { Subscription, SubscriptionsSummary } from "@/app/types/types";
import { FiCreditCard, FiPlus, FiX, FiAlertCircle } from "react-icons/fi";
import PremiumModal from "./PremiumModal";
import { useToast, ToastContainer } from "./Toast";

interface SubscriptionTrackingProps {
  userId: string;
}

const SubscriptionTracking: React.FC<SubscriptionTrackingProps> = ({ userId }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<SubscriptionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "quarterly">("monthly");
  const [category, setCategory] = useState("");

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, [userId]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsUtils.getSubscriptions(userId);
      setSubscriptions(data);
      setSummary(subscriptionsUtils.calculateSubscriptionsSummary(data));
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      addToast("Failed to load subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nextBilling = new Date();
      if (billingCycle === "monthly") nextBilling.setMonth(nextBilling.getMonth() + 1);
      else if (billingCycle === "quarterly") nextBilling.setMonth(nextBilling.getMonth() + 3);
      else nextBilling.setFullYear(nextBilling.getFullYear() + 1);

      await subscriptionsUtils.createSubscription({
        userId,
        name,
        merchant,
        amount: parseFloat(amount),
        billingCycle,
        nextBillingDate: nextBilling.toISOString(),
        category,
        autoDetected: false,
        status: "active",
        reminderEnabled: true,
        firstDetectedDate: new Date().toISOString(),
      });

      addToast("Subscription added successfully!", "success");
      setShowCreateModal(false);
      resetForm();
      await loadSubscriptions();
    } catch (error) {
      console.error("Error creating subscription:", error);
      addToast("Failed to add subscription", "error");
    }
  };

  const handleCancelSubscription = async (subId: string, subName: string) => {
    if (!confirm(`Cancel subscription to ${subName}?`)) return;

    try {
      await subscriptionsUtils.cancelSubscription(subId);
      addToast("Subscription cancelled", "success");
      await loadSubscriptions();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      addToast("Failed to cancel subscription", "error");
    }
  };

  const handleDeleteSubscription = async (subId: string, subName: string) => {
    if (!confirm(`Delete ${subName}?`)) return;

    try {
      await subscriptionsUtils.deleteSubscription(subId);
      addToast("Subscription deleted", "success");
      await loadSubscriptions();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      addToast("Failed to delete subscription", "error");
    }
  };

  const resetForm = () => {
    setName("");
    setMerchant("");
    setAmount("");
    setBillingCycle("monthly");
    setCategory("");
  };

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-text-secondary">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-background-card border border-border-secondary rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Subscriptions</h2>
            <p className="text-text-secondary">Manage your recurring payments</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Add Subscription
          </button>
        </div>

        {summary && subscriptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Active</p>
              <p className="text-3xl font-bold text-text-primary">{summary.activeSubscriptions}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Monthly Cost</p>
              <p className="text-3xl font-bold text-text-primary">${summary.monthlyTotal.toFixed(0)}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Annual Cost</p>
              <p className="text-3xl font-bold text-text-primary">${summary.annualTotal.toFixed(0)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Unused</p>
              <p className="text-3xl font-bold text-amber-500">{summary.unusedSubscriptions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="bg-background-card border border-border-secondary rounded-2xl p-12 text-center">
          <FiCreditCard className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Subscriptions Yet</h3>
          <p className="text-text-secondary mb-6">Track your recurring payments and save money</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2">
            <FiPlus /> Add Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubscriptions.map((sub) => (
            <div key={sub.id} className="bg-background-card border border-border-secondary rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-text-primary">{sub.name}</h4>
                  <p className="text-sm text-text-tertiary">{sub.merchant}</p>
                </div>
                <button onClick={() => handleDeleteSubscription(sub.id, sub.name)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Amount</span>
                  <span className="font-semibold text-text-primary">${sub.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Billing</span>
                  <span className="font-semibold text-text-primary capitalize">{sub.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Annual Cost</span>
                  <span className="font-semibold text-primary-500">${sub.annualCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Next Billing</span>
                  <span className="font-semibold text-text-primary text-xs">{new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                </div>
              </div>

              <button onClick={() => handleCancelSubscription(sub.id, sub.name)} className="w-full btn-secondary text-sm">
                Cancel Subscription
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <PremiumModal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Add Subscription">
        <form onSubmit={handleCreateSubscription} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Service Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-modern w-full" placeholder="e.g., Netflix" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Merchant</label>
            <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} className="input-modern w-full" placeholder="e.g., Netflix Inc" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-modern w-full" placeholder="e.g., 15.99" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Billing Cycle</label>
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as any)} className="input-modern w-full">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-modern w-full" placeholder="e.g., Entertainment" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add Subscription</button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
};

export default SubscriptionTracking;
