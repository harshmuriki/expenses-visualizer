"use client";

import React, { useState, useEffect } from "react";
import { billsUtils } from "@/lib/premiumFeatures";
import { Bill, BillsSummary } from "@/app/types/types";
import { FiCalendar, FiPlus, FiCheck, FiTrash2, FiAlertCircle, FiClock } from "react-icons/fi";
import PremiumModal from "./PremiumModal";
import { useToast, ToastContainer } from "./Toast";

interface BillRemindersProps {
  userId: string;
}

const BillReminders: React.FC<BillRemindersProps> = ({ userId }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<BillsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadBills();
  }, [userId]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billsUtils.getBills(userId);
      setBills(data);
      setSummary(billsUtils.calculateBillsSummary(data));
    } catch (error) {
      console.error("Error loading bills:", error);
      addToast("Failed to load bills", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const today = new Date();
      const nextDue = new Date(today.getFullYear(), today.getMonth(), parseInt(dueDate));
      if (nextDue < today) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      await billsUtils.createBill({
        userId,
        name,
        amount: parseFloat(amount),
        dueDate: parseInt(dueDate),
        category,
        recurring: true,
        frequency,
        autoDetected: false,
        status: "pending",
        nextDueDate: nextDue.toISOString(),
        reminderDays: 3,
        notificationsEnabled: true,
      });

      addToast("Bill created successfully!", "success");
      setShowCreateModal(false);
      resetForm();
      await loadBills();
    } catch (error) {
      console.error("Error creating bill:", error);
      addToast("Failed to create bill", "error");
    }
  };

  const handleMarkPaid = async (bill: Bill) => {
    try {
      await billsUtils.markBillPaid(bill.id, {
        billId: bill.id,
        userId,
        amount: bill.amount,
        paidDate: new Date().toISOString(),
      });

      addToast(`${bill.name} marked as paid!`, "success");
      await loadBills();
    } catch (error) {
      console.error("Error marking bill as paid:", error);
      addToast("Failed to mark bill as paid", "error");
    }
  };

  const handleDeleteBill = async (billId: string, billName: string) => {
    if (!confirm(`Delete bill "${billName}"?`)) return;

    try {
      await billsUtils.deleteBill(billId);
      addToast("Bill deleted successfully", "success");
      await loadBills();
    } catch (error) {
      console.error("Error deleting bill:", error);
      addToast("Failed to delete bill", "error");
    }
  };

  const resetForm = () => {
    setName("");
    setAmount("");
    setDueDate("");
    setCategory("");
    setFrequency("monthly");
  };

  const upcomingBills = billsUtils.getUpcomingBills(bills, 7);
  const overdueBills = billsUtils.getOverdueBills(bills);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-text-secondary">Loading bills...</p>
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
            <h2 className="text-3xl font-bold text-text-primary mb-2">Bill Reminders</h2>
            <p className="text-text-secondary">Never miss a payment again</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            New Bill
          </button>
        </div>

        {summary && bills.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Total Bills</p>
              <p className="text-3xl font-bold text-text-primary">{summary.totalBills}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Upcoming (7 days)</p>
              <p className="text-3xl font-bold text-text-primary">{summary.upcomingBills}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Overdue</p>
              <p className="text-3xl font-bold text-red-500">{summary.overdueBills}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Monthly Total</p>
              <p className="text-3xl font-bold text-text-primary">${summary.totalMonthlyBills.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overdue Bills Alert */}
      {overdueBills.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold text-red-500">Overdue Bills</h3>
          </div>
          <div className="space-y-3">
            {overdueBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between bg-background-card rounded-lg p-4">
                <div>
                  <p className="font-semibold text-text-primary">{bill.name}</p>
                  <p className="text-sm text-text-secondary">${bill.amount.toFixed(2)}</p>
                </div>
                <button onClick={() => handleMarkPaid(bill)} className="btn-primary text-sm">
                  Mark Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <FiClock className="w-5 h-5 text-amber-500" />
            Upcoming Bills (Next 7 Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="bg-background-card border border-border-secondary rounded-xl p-5 hover:border-primary-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-text-primary">{bill.name}</h4>
                    <p className="text-sm text-text-tertiary">{bill.category}</p>
                  </div>
                  <button onClick={() => handleDeleteBill(bill.id, bill.name)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-2xl font-bold text-text-primary mb-2">${bill.amount.toFixed(2)}</p>
                <p className="text-sm text-text-secondary mb-4">Due: {new Date(bill.nextDueDate).toLocaleDateString()}</p>
                <button onClick={() => handleMarkPaid(bill)} className="w-full btn-primary text-sm flex items-center justify-center gap-2">
                  <FiCheck /> Mark as Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Bills */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">All Bills</h3>
        {bills.length === 0 ? (
          <div className="bg-background-card border border-border-secondary rounded-2xl p-12 text-center">
            <FiCalendar className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Bills Yet</h3>
            <p className="text-text-secondary mb-6">Add your bills to get reminders and never miss a payment</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2">
              <FiPlus /> Add Bill
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="bg-background-card border border-border-secondary rounded-xl p-5 flex items-center justify-between hover:border-primary-500/50 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-text-primary">{bill.name}</h4>
                    {bill.status === "paid" && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full font-semibold">
                        ✓ Paid
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>${bill.amount.toFixed(2)}</span>
                    <span>•</span>
                    <span>Due: Day {bill.dueDate}</span>
                    <span>•</span>
                    <span className="capitalize">{bill.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bill.status !== "paid" && (
                    <button onClick={() => handleMarkPaid(bill)} className="btn-secondary text-sm">
                      Mark Paid
                    </button>
                  )}
                  <button onClick={() => handleDeleteBill(bill.id, bill.name)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Bill Modal */}
      <PremiumModal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Add New Bill">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Bill Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-modern w-full" placeholder="e.g., Electric Bill" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-modern w-full" placeholder="e.g., 150" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Due Date (Day)</label>
              <input type="number" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-modern w-full" placeholder="e.g., 15" min="1" max="31" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-modern w-full" placeholder="e.g., Utilities" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="input-modern w-full">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Add Bill</button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
};

export default BillReminders;
