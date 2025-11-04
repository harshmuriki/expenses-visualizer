/**
 * Premium Features Utility Library
 *
 * This file contains all the business logic for Tier 1 premium features:
 * 1. Budget Tracking
 * 2. Savings Goals
 * 3. Bill Reminders
 * 4. Subscription Tracking
 * 5. Net Worth Tracking
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/components/firebaseConfig";
import {
  Budget,
  SavingsGoal,
  Bill,
  Subscription,
  Asset,
  Liability,
  NetWorthSnapshot,
  BudgetSummary,
  GoalsSummary,
  BillsSummary,
  SubscriptionsSummary,
  NetWorthSummary,
  GoalContribution,
  BillPayment,
} from "@/app/types/types";

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Helper function to remove undefined values from objects
 * Firestore doesn't accept undefined values
 */
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = { ...obj };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

// ============================================
// 1. BUDGET TRACKING UTILITIES
// ============================================

export const budgetUtils = {
  /**
   * Create a new budget for a category
   */
  async createBudget(budget: Omit<Budget, "id" | "createdAt" | "updatedAt">): Promise<Budget> {
    const budgetId = `${budget.userId}_${budget.month}_${budget.category}`;
    const now = new Date().toISOString();

    const newBudget: Budget = {
      ...budget,
      id: budgetId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, "budgets", budgetId), removeUndefined(newBudget));
    return newBudget;
  },

  /**
   * Get all budgets for a user and month
   */
  async getBudgetsByMonth(userId: string, month: string): Promise<Budget[]> {
    const budgetsRef = collection(db, "budgets");
    const q = query(
      budgetsRef,
      where("userId", "==", userId),
      where("month", "==", month)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Budget);
  },

  /**
   * Update budget spent amount
   */
  async updateBudgetSpent(budgetId: string, spent: number): Promise<void> {
    const budgetRef = doc(db, "budgets", budgetId);
    await updateDoc(budgetRef, {
      spent,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Delete a budget
   */
  async deleteBudget(budgetId: string): Promise<void> {
    await deleteDoc(doc(db, "budgets", budgetId));
  },

  /**
   * Calculate budget summary for a month
   */
  calculateBudgetSummary(budgets: Budget[]): BudgetSummary {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const categoriesOverBudget = budgets.filter((b) => b.spent > b.limit).length;
    const categoriesUnderBudget = budgets.filter((b) => b.spent <= b.limit).length;
    const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalBudgeted,
      totalSpent,
      categoriesOverBudget,
      categoriesUnderBudget,
      percentageUsed,
    };
  },

  /**
   * Check if budget limit is exceeded
   */
  isBudgetExceeded(budget: Budget, threshold: number = 100): boolean {
    return (budget.spent / budget.limit) * 100 >= threshold;
  },
};

// ============================================
// 2. SAVINGS GOALS UTILITIES
// ============================================

export const goalsUtils = {
  /**
   * Create a new savings goal
   */
  async createGoal(goal: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">): Promise<SavingsGoal> {
    const goalId = doc(collection(db, "savingsGoals")).id;
    const now = new Date().toISOString();

    const newGoal: SavingsGoal = {
      ...goal,
      id: goalId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, "savingsGoals", goalId), removeUndefined(newGoal));
    return newGoal;
  },

  /**
   * Get all goals for a user
   */
  async getGoals(userId: string): Promise<SavingsGoal[]> {
    const goalsRef = collection(db, "savingsGoals");
    const q = query(goalsRef, where("userId", "==", userId), orderBy("priority", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as SavingsGoal);
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, currentAmount: number): Promise<void> {
    const goalRef = doc(db, "savingsGoals", goalId);
    const goalSnap = await getDoc(goalRef);

    if (goalSnap.exists()) {
      const goal = goalSnap.data() as SavingsGoal;
      const updateData: Partial<SavingsGoal> = {
        currentAmount,
        updatedAt: new Date().toISOString(),
      };

      // Mark as completed if target reached
      if (currentAmount >= goal.targetAmount && !goal.completedAt) {
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(goalRef, updateData);
    }
  },

  /**
   * Add contribution to goal
   */
  async addContribution(contribution: Omit<GoalContribution, "id">): Promise<void> {
    const contributionId = doc(collection(db, "goalContributions")).id;
    const newContribution: GoalContribution = {
      ...contribution,
      id: contributionId,
    };

    await setDoc(doc(db, "goalContributions", contributionId), newContribution);

    // Update goal current amount
    const goalRef = doc(db, "savingsGoals", contribution.goalId);
    const goalSnap = await getDoc(goalRef);

    if (goalSnap.exists()) {
      const goal = goalSnap.data() as SavingsGoal;
      await this.updateGoalProgress(contribution.goalId, goal.currentAmount + contribution.amount);
    }
  },

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    await deleteDoc(doc(db, "savingsGoals", goalId));
  },

  /**
   * Calculate goals summary
   */
  calculateGoalsSummary(goals: SavingsGoal[]): GoalsSummary {
    const totalGoals = goals.length;
    const activeGoals = goals.filter((g) => !g.completedAt).length;
    const completedGoals = goals.filter((g) => g.completedAt).length;
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const percentageComplete = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      percentageComplete,
    };
  },

  /**
   * Calculate required monthly savings
   */
  calculateRequiredMonthlySavings(goal: SavingsGoal): number {
    const remaining = goal.targetAmount - goal.currentAmount;
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(
      1,
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
        (targetDate.getMonth() - today.getMonth())
    );
    return remaining / monthsRemaining;
  },

  /**
   * Calculate progress percentage
   */
  getProgressPercentage(goal: SavingsGoal): number {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  },
};

// ============================================
// 3. BILL TRACKING UTILITIES
// ============================================

export const billsUtils = {
  /**
   * Create a new bill
   */
  async createBill(bill: Omit<Bill, "id" | "createdAt" | "updatedAt">): Promise<Bill> {
    const billId = doc(collection(db, "bills")).id;
    const now = new Date().toISOString();

    const newBill: Bill = {
      ...bill,
      id: billId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, "bills", billId), removeUndefined(newBill));
    return newBill;
  },

  /**
   * Get all bills for a user
   */
  async getBills(userId: string): Promise<Bill[]> {
    const billsRef = collection(db, "bills");
    const q = query(billsRef, where("userId", "==", userId), orderBy("dueDate", "asc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Bill);
  },

  /**
   * Mark bill as paid
   */
  async markBillPaid(billId: string, payment: Omit<BillPayment, "id">): Promise<void> {
    // Record payment
    const paymentId = doc(collection(db, "billPayments")).id;
    const newPayment: BillPayment = {
      ...payment,
      id: paymentId,
    };
    await setDoc(doc(db, "billPayments", paymentId), newPayment);

    // Update bill status
    const billRef = doc(db, "bills", billId);
    await updateDoc(billRef, {
      status: "paid",
      lastPaidDate: payment.paidDate,
      nextDueDate: this.calculateNextDueDate(billId).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Calculate next due date
   */
  calculateNextDueDate(bill: Bill): Date {
    const today = new Date();
    const nextDate = new Date(bill.nextDueDate);

    switch (bill.frequency) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "biweekly":
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  },

  /**
   * Get upcoming bills (within X days)
   */
  getUpcomingBills(bills: Bill[], daysAhead: number = 7): Bill[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return bills.filter((bill) => {
      const nextDue = new Date(bill.nextDueDate);
      return nextDue >= today && nextDue <= futureDate && bill.status !== "paid";
    });
  },

  /**
   * Get overdue bills
   */
  getOverdueBills(bills: Bill[]): Bill[] {
    const today = new Date();
    return bills.filter((bill) => {
      const nextDue = new Date(bill.nextDueDate);
      return nextDue < today && bill.status !== "paid";
    });
  },

  /**
   * Calculate bills summary
   */
  calculateBillsSummary(bills: Bill[]): BillsSummary {
    const totalBills = bills.length;
    const upcomingBills = this.getUpcomingBills(bills, 7).length;
    const overdueBills = this.getOverdueBills(bills).length;
    const paidThisMonth = bills.filter((b) => {
      if (!b.lastPaidDate) return false;
      const paidDate = new Date(b.lastPaidDate);
      const today = new Date();
      return paidDate.getMonth() === today.getMonth() && paidDate.getFullYear() === today.getFullYear();
    }).length;

    const totalMonthlyBills = bills
      .filter((b) => b.recurring)
      .reduce((sum, b) => {
        switch (b.frequency) {
          case "weekly":
            return sum + b.amount * 4.33; // avg weeks per month
          case "biweekly":
            return sum + b.amount * 2.17; // avg biweekly periods per month
          case "monthly":
            return sum + b.amount;
          case "quarterly":
            return sum + b.amount / 3;
          case "yearly":
            return sum + b.amount / 12;
          default:
            return sum;
        }
      }, 0);

    return {
      totalBills,
      upcomingBills,
      overdueBills,
      paidThisMonth,
      totalMonthlyBills,
    };
  },

  /**
   * Delete a bill
   */
  async deleteBill(billId: string): Promise<void> {
    await deleteDoc(doc(db, "bills", billId));
  },
};

// ============================================
// 4. SUBSCRIPTION TRACKING UTILITIES
// ============================================

export const subscriptionsUtils = {
  /**
   * Create a new subscription
   */
  async createSubscription(
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt" | "annualCost">
  ): Promise<Subscription> {
    const subscriptionId = doc(collection(db, "subscriptions")).id;
    const now = new Date().toISOString();

    const newSubscription: Subscription = {
      ...subscription,
      id: subscriptionId,
      annualCost: this.calculateAnnualCost(subscription.amount, subscription.billingCycle),
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, "subscriptions", subscriptionId), removeUndefined(newSubscription));
    return newSubscription;
  },

  /**
   * Get all subscriptions for a user
   */
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(subscriptionsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Subscription);
  },

  /**
   * Calculate annual cost
   */
  calculateAnnualCost(amount: number, billingCycle: Subscription["billingCycle"]): number {
    switch (billingCycle) {
      case "weekly":
        return amount * 52;
      case "monthly":
        return amount * 12;
      case "quarterly":
        return amount * 4;
      case "yearly":
        return amount;
      default:
        return amount * 12;
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, {
      status: "cancelled",
      cancellationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Calculate subscriptions summary
   */
  calculateSubscriptionsSummary(subscriptions: Subscription[]): SubscriptionsSummary {
    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    const totalSubscriptions = subscriptions.length;
    const monthlyTotal = activeSubscriptions.reduce((sum, s) => {
      switch (s.billingCycle) {
        case "weekly":
          return sum + s.amount * 4.33;
        case "monthly":
          return sum + s.amount;
        case "quarterly":
          return sum + s.amount / 3;
        case "yearly":
          return sum + s.amount / 12;
        default:
          return sum;
      }
    }, 0);
    const annualTotal = activeSubscriptions.reduce((sum, s) => sum + s.annualCost, 0);

    // Detect unused subscriptions (no charge in last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const unusedSubscriptions = activeSubscriptions.filter((s) => {
      if (!s.lastChargeDate) return false;
      return new Date(s.lastChargeDate) < sixtyDaysAgo;
    }).length;

    return {
      totalSubscriptions,
      activeSubscriptions: activeSubscriptions.length,
      monthlyTotal,
      annualTotal,
      unusedSubscriptions,
    };
  },

  /**
   * Delete a subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    await deleteDoc(doc(db, "subscriptions", subscriptionId));
  },
};

// ============================================
// 5. NET WORTH TRACKING UTILITIES
// ============================================

export const netWorthUtils = {
  /**
   * Add asset
   */
  async addAsset(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset> {
    const assetId = doc(collection(db, "assets")).id;
    const now = new Date().toISOString();

    const newAsset: Asset = {
      ...asset,
      id: assetId,
      createdAt: now,
      updatedAt: now,
    };

    // Remove undefined fields before saving to Firestore
    await setDoc(doc(db, "assets", assetId), removeUndefined(newAsset));
    return newAsset;
  },

  /**
   * Add liability
   */
  async addLiability(liability: Omit<Liability, "id" | "createdAt" | "updatedAt">): Promise<Liability> {
    const liabilityId = doc(collection(db, "liabilities")).id;
    const now = new Date().toISOString();

    const newLiability: Liability = {
      ...liability,
      id: liabilityId,
      createdAt: now,
      updatedAt: now,
    };

    // Remove undefined fields before saving to Firestore
    await setDoc(doc(db, "liabilities", liabilityId), removeUndefined(newLiability));
    return newLiability;
  },

  /**
   * Get all assets for a user
   */
  async getAssets(userId: string): Promise<Asset[]> {
    const assetsRef = collection(db, "assets");
    const q = query(assetsRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Asset);
  },

  /**
   * Get all liabilities for a user
   */
  async getLiabilities(userId: string): Promise<Liability[]> {
    const liabilitiesRef = collection(db, "liabilities");
    const q = query(liabilitiesRef, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Liability);
  },

  /**
   * Create net worth snapshot
   */
  async createSnapshot(userId: string, assets: Asset[], liabilities: Liability[]): Promise<NetWorthSnapshot> {
    const snapshotId = doc(collection(db, "netWorthSnapshots")).id;
    const now = new Date();

    const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.currentBalance, 0);
    const netWorth = totalAssets - totalLiabilities;

    const assetBreakdown: Record<string, number> = {};
    assets.forEach((asset) => {
      assetBreakdown[asset.type] = (assetBreakdown[asset.type] || 0) + asset.currentValue;
    });

    const liabilityBreakdown: Record<string, number> = {};
    liabilities.forEach((liability) => {
      liabilityBreakdown[liability.type] = (liabilityBreakdown[liability.type] || 0) + liability.currentBalance;
    });

    const snapshot: NetWorthSnapshot = {
      id: snapshotId,
      userId,
      date: now.toISOString().split("T")[0], // YYYY-MM-DD
      totalAssets,
      totalLiabilities,
      netWorth,
      assetBreakdown,
      liabilityBreakdown,
      createdAt: now.toISOString(),
    };

    await setDoc(doc(db, "netWorthSnapshots", snapshotId), snapshot);
    return snapshot;
  },

  /**
   * Get net worth history
   */
  async getNetWorthHistory(userId: string, months: number = 12): Promise<NetWorthSnapshot[]> {
    const snapshotsRef = collection(db, "netWorthSnapshots");
    const q = query(
      snapshotsRef,
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as NetWorthSnapshot).slice(0, months);
  },

  /**
   * Calculate net worth summary
   */
  calculateNetWorthSummary(
    currentSnapshot: NetWorthSnapshot,
    history: NetWorthSnapshot[]
  ): NetWorthSummary {
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastMonth = sortedHistory.find((s, i) => i > 0);
    const lastYear = sortedHistory.find((s) => {
      const diff = new Date(currentSnapshot.date).getTime() - new Date(s.date).getTime();
      return diff >= 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    });

    const monthlyChange = lastMonth ? currentSnapshot.netWorth - lastMonth.netWorth : 0;
    const monthlyChangePercentage = lastMonth && lastMonth.netWorth !== 0
      ? (monthlyChange / Math.abs(lastMonth.netWorth)) * 100
      : 0;

    const yearlyChange = lastYear ? currentSnapshot.netWorth - lastYear.netWorth : 0;
    const yearlyChangePercentage = lastYear && lastYear.netWorth !== 0
      ? (yearlyChange / Math.abs(lastYear.netWorth)) * 100
      : 0;

    return {
      currentNetWorth: currentSnapshot.netWorth,
      totalAssets: currentSnapshot.totalAssets,
      totalLiabilities: currentSnapshot.totalLiabilities,
      monthlyChange,
      monthlyChangePercentage,
      yearlyChange,
      yearlyChangePercentage,
    };
  },

  /**
   * Update asset value
   */
  async updateAssetValue(assetId: string, newValue: number): Promise<void> {
    const assetRef = doc(db, "assets", assetId);
    await updateDoc(assetRef, {
      currentValue: newValue,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Update liability balance
   */
  async updateLiabilityBalance(liabilityId: string, newBalance: number): Promise<void> {
    const liabilityRef = doc(db, "liabilities", liabilityId);
    await updateDoc(liabilityRef, {
      currentBalance: newBalance,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    await deleteDoc(doc(db, "assets", assetId));
  },

  /**
   * Delete liability
   */
  async deleteLiability(liabilityId: string): Promise<void> {
    await deleteDoc(doc(db, "liabilities", liabilityId));
  },
};
