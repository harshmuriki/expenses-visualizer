# Premium Features Component Implementation Guide

This guide provides step-by-step instructions for building the remaining 5 premium feature components.

## Architecture Overview

Each component follows this pattern:
```
Component (UI) → Utility Functions (Logic) → Firebase (Storage)
```

All utility functions are already built in `lib/premiumFeatures.ts`. You just need to create the UI components.

---

## Component 1: Budget Tracking

**File:** `components/premium/BudgetTracking.tsx`

### Features to Implement:
1. Display all budgets for the selected month
2. Create new budget (category + limit)
3. Show budget progress bars (green < 80%, yellow 80-100%, red > 100%)
4. Edit budget limit
5. Delete budget
6. Show total budgeted vs. spent
7. Auto-update spent amount from transactions

### Component Structure:
```tsx
"use client";

import React, { useState, useEffect } from "react";
import { budgetUtils } from "@/lib/premiumFeatures";
import { Budget, BudgetSummary } from "@/app/types/types";
import { FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi";

interface BudgetTrackingProps {
  userId: string;
  month: string;
}

const BudgetTracking: React.FC<BudgetTrackingProps> = ({ userId, month }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 1. Load budgets on mount
  useEffect(() => {
    loadBudgets();
  }, [userId, month]);

  const loadBudgets = async () => {
    try {
      const data = await budgetUtils.getBudgetsByMonth(userId, month);
      setBudgets(data);
      setSummary(budgetUtils.calculateBudgetSummary(data));
    } catch (error) {
      console.error("Error loading budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Create budget
  const handleCreateBudget = async (category: string, limit: number) => {
    try {
      await budgetUtils.createBudget({
        userId,
        month,
        category,
        limit,
        spent: 0, // Will be calculated from transactions
        rollover: false,
      });
      await loadBudgets();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating budget:", error);
    }
  };

  // 3. Delete budget
  const handleDeleteBudget = async (budgetId: string) => {
    if (confirm("Delete this budget?")) {
      try {
        await budgetUtils.deleteBudget(budgetId);
        await loadBudgets();
      } catch (error) {
        console.error("Error deleting budget:", error);
      }
    }
  };

  // 4. Calculate progress color
  const getProgressColor = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage < 80) return "bg-emerald-500";
    if (percentage < 100) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="bg-background-card border border-border-secondary rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Budget Tracking</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> New Budget
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background-secondary rounded-xl p-4">
              <p className="text-text-tertiary text-sm">Total Budgeted</p>
              <p className="text-2xl font-bold text-text-primary">
                ${summary.totalBudgeted.toFixed(0)}
              </p>
            </div>
            <div className="bg-background-secondary rounded-xl p-4">
              <p className="text-text-tertiary text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-text-primary">
                ${summary.totalSpent.toFixed(0)}
              </p>
            </div>
            <div className="bg-background-secondary rounded-xl p-4">
              <p className="text-text-tertiary text-sm">% Used</p>
              <p className="text-2xl font-bold text-text-primary">
                {summary.percentageUsed.toFixed(0)}%
              </p>
            </div>
            <div className="bg-background-secondary rounded-xl p-4">
              <p className="text-text-tertiary text-sm">Over Budget</p>
              <p className="text-2xl font-bold text-red-500">
                {summary.categoriesOverBudget}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const remaining = budget.limit - budget.spent;

          return (
            <div
              key={budget.id}
              className="bg-background-card border border-border-secondary rounded-xl p-6 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {budget.category}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    ${budget.spent.toFixed(0)} of ${budget.limit.toFixed(0)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-background-secondary rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${getProgressColor(budget)} transition-all duration-300`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                ></div>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className={remaining >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {remaining >= 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over`}
                </span>
                <span className="text-text-tertiary">{percentage.toFixed(1)}%</span>
              </div>

              {/* Alert if over budget */}
              {percentage >= 100 && (
                <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-500/10 rounded-lg p-3">
                  <FiAlertCircle />
                  <span className="text-sm font-medium">Budget exceeded!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Budget Modal - Add your modal implementation here */}
    </div>
  );
};

export default BudgetTracking;
```

### Integration with Transactions:
Add this to `components/sendDataFirebase.ts` after uploading transactions:

```typescript
// Update budget spent amounts
import { budgetUtils } from "@/lib/premiumFeatures";

// After transactions are uploaded:
const categoryTotals: Record<string, number> = {};
items.forEach(item => {
  if (item.parenttag) {
    categoryTotals[item.parenttag] = (categoryTotals[item.parenttag] || 0) + item.cost;
  }
});

// Update budgets
for (const [category, total] of Object.entries(categoryTotals)) {
  const budgetId = `${email}_${month}_${category}`;
  try {
    await budgetUtils.updateBudgetSpent(budgetId, total);
  } catch (error) {
    // Budget doesn't exist yet
  }
}
```

---

## Component 2: Savings Goals

**File:** `components/premium/SavingsGoals.tsx`

### Features to Implement:
1. Display all goals with progress circles
2. Create new goal (name, target, date, category)
3. Add contributions
4. Show required monthly savings
5. Milestone celebrations (confetti at 25%, 50%, 75%, 100%)
6. Edit/delete goals
7. Completed goals section

### Key UI Elements:
- **Progress Circle:** Use SVG circle or recharts `<RadialBarChart>`
- **Contribution Form:** Modal with amount input
- **Goal Card:** Shows target, current, percentage, required monthly

### Code Skeleton:
```tsx
const SavingsGoals: React.FC<SavingsGoalsProps> = ({ userId }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const loadGoals = async () => {
    const data = await goalsUtils.getGoals(userId);
    setGoals(data);
  };

  const handleAddContribution = async (goalId: string, amount: number) => {
    await goalsUtils.addContribution({
      goalId,
      userId,
      amount,
      date: new Date().toISOString(),
      automatic: false,
    });
    await loadGoals();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onAddContribution={handleAddContribution}
        />
      ))}
    </div>
  );
};
```

---

## Component 3: Bill Reminders

**File:** `components/premium/BillReminders.tsx`

### Features to Implement:
1. Calendar view of bills
2. Create bill manually
3. Mark as paid
4. Upcoming bills section (next 7 days)
5. Overdue bills alerts (red banner)
6. Total monthly bills amount
7. Payment history
8. Auto-detect from recurring transactions

### Key UI Elements:
- **Bill Calendar:** Monthly calendar with bill indicators
- **Bill Card:** Name, amount, due date, frequency, status
- **Quick Action Buttons:** "Mark Paid", "Edit", "Delete"
- **Upcoming Section:** Sorted by due date

### Auto-Detection:
```typescript
// In lib/RecurringTransactions.ts, add classification:
const classifyRecurringTransaction = (transaction: RecurringTransaction): "bill" | "subscription" => {
  const billKeywords = ["electric", "gas", "water", "insurance", "rent", "mortgage", "internet", "phone"];
  const subKeywords = ["netflix", "spotify", "amazon", "disney", "hulu", "gym"];

  const name = transaction.name.toLowerCase();

  if (billKeywords.some(keyword => name.includes(keyword))) {
    return "bill";
  }
  if (subKeywords.some(keyword => name.includes(keyword))) {
    return "subscription";
  }

  // Default: frequency < 30 days = subscription, >= 30 days = bill
  return transaction.interval <= 30 ? "subscription" : "bill";
};
```

---

## Component 4: Subscription Tracking

**File:** `components/premium/SubscriptionTracking.tsx`

### Features to Implement:
1. List all subscriptions with icons/logos
2. Show monthly and annual cost
3. Next billing date countdown
4. Cancel subscription (update status)
5. Unused subscription alerts (no charge in 60 days)
6. Total monthly/annual summary
7. Subscription categories
8. Auto-detect from recurring transactions

### Key UI Elements:
- **Subscription Card:** Logo, name, amount, billing cycle, next date
- **Cost Summary:** Monthly total, annual total
- **Unused Alert:** Yellow banner for subscriptions not charged recently
- **Cancel Button:** Marks as cancelled, doesn't delete

### Annual Cost Display:
```tsx
const getAnnualizedCost = (sub: Subscription) => {
  switch (sub.billingCycle) {
    case "weekly": return sub.amount * 52;
    case "monthly": return sub.amount * 12;
    case "quarterly": return sub.amount * 4;
    case "yearly": return sub.amount;
  }
};
```

---

## Component 5: Net Worth Tracking

**File:** `components/premium/NetWorthTracking.tsx`

### Features to Implement:
1. Add assets (type, name, value, institution)
2. Add liabilities (type, name, balance, interest rate)
3. Net worth calculation display (big number)
4. Historical chart (line graph)
5. Asset allocation pie chart
6. Liability breakdown pie chart
7. Monthly/yearly change percentage
8. Update values
9. Plaid auto-sync toggle

### Key UI Elements:
- **Net Worth Hero:** Large display of current net worth with trend
- **Historical Chart:** Line chart using recharts `<LineChart>`
- **Asset/Liability Lists:** Editable values
- **Pie Charts:** Asset allocation and liability breakdown
- **Snapshot Button:** "Take Monthly Snapshot"

### Chart Implementation:
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NetWorthChart = ({ history }: { history: NetWorthSnapshot[] }) => {
  const data = history.map(snapshot => ({
    date: new Date(snapshot.date).toLocaleDateString(),
    netWorth: snapshot.netWorth,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="netWorth" stroke="#0ea5e9" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

---

## Shared Components

### Modal Component
Create `components/premium/PremiumModal.tsx`:
```tsx
const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-background-card rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};
```

### Notification Toast
Create `components/premium/Toast.tsx`:
```tsx
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`${colors[type]} text-white rounded-xl p-4 shadow-lg animate-slide-up`}>
      {message}
    </div>
  );
};
```

---

## Testing Checklist

### For Each Component:
- [ ] Create operation works
- [ ] Read/display works with loading state
- [ ] Update operation works
- [ ] Delete operation works with confirmation
- [ ] Calculations are correct
- [ ] Responsive on mobile
- [ ] Error handling shows user-friendly messages
- [ ] Data persists in Firebase
- [ ] Real-time updates work (onSnapshot)

---

## Next Steps to Complete

### Day 1-2: Budget Tracking
1. Build BudgetTracking component
2. Add create/delete modals
3. Integrate with transaction upload
4. Test with real data

### Day 3-4: Savings Goals
1. Build SavingsGoals component
2. Add progress circles
3. Add contribution modal
4. Add milestone celebrations

### Day 5-6: Bill Reminders
1. Build BillReminders component
2. Add calendar view
3. Add mark paid functionality
4. Add overdue detection

### Day 7-8: Subscription Tracking
1. Build SubscriptionTracking component
2. Add auto-detection from recurring
3. Add unused subscription alerts
4. Add cancel functionality

### Day 9-10: Net Worth Tracking
1. Build NetWorthTracking component
2. Add historical chart
3. Add pie charts
4. Integrate with Plaid

### Day 11-12: Integration & Polish
1. Link from main chart page
2. Auto-update budgets from transactions
3. Auto-detect bills/subscriptions
4. End-to-end testing
5. Documentation

---

## Quick Start

To continue building, run:
```bash
cd my-expenses-app/components/premium
# Create each component file
touch BudgetTracking.tsx SavingsGoals.tsx BillReminders.tsx SubscriptionTracking.tsx NetWorthTracking.tsx
```

All the business logic is ready in `lib/premiumFeatures.ts`. You just need to:
1. Create the UI components
2. Call the utility functions
3. Handle loading/error states
4. Style with Tailwind

**Total remaining effort: 10-12 days of focused development.**

---

Last Updated: November 4, 2024
