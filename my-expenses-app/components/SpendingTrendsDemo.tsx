"use client";

import React from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

const SpendingTrendsDemo: React.FC = () => {
  // Mock data for demonstration
  const mockMonthlyData = [
    {
      month: "December",
      totalSpending: 2847.5,
      categories: [
        { category: "Food & Dining", amount: 892.3, percentage: 31.4 },
        { category: "Transportation", amount: 456.8, percentage: 16.1 },
        { category: "Shopping", amount: 623.4, percentage: 21.9 },
        {
          category: "Entertainment & Recreation",
          amount: 234.6,
          percentage: 8.2,
        },
        { category: "Bills & Utilities", amount: 640.4, percentage: 22.5 },
      ],
    },
    {
      month: "November",
      totalSpending: 3124.2,
      categories: [
        { category: "Food & Dining", amount: 1023.5, percentage: 32.7 },
        { category: "Shopping", amount: 789.3, percentage: 25.3 },
        { category: "Transportation", amount: 445.2, percentage: 14.2 },
        { category: "Bills & Utilities", amount: 866.2, percentage: 27.7 },
      ],
    },
    {
      month: "October",
      totalSpending: 2756.8,
      categories: [
        { category: "Food & Dining", amount: 756.4, percentage: 27.4 },
        { category: "Transportation", amount: 423.6, percentage: 15.4 },
        { category: "Shopping", amount: 892.3, percentage: 32.4 },
        {
          category: "Entertainment & Recreation",
          amount: 684.5,
          percentage: 24.8,
        },
      ],
    },
  ];

  const mockTrends = [
    {
      category: "Food & Dining",
      monthlyAmounts: { October: 756.4, November: 1023.5, December: 892.3 },
      trend: "up" as const,
      changePercentage: 18.0,
    },
    {
      category: "Shopping",
      monthlyAmounts: { October: 892.3, November: 789.3, December: 623.4 },
      trend: "down" as const,
      changePercentage: -30.1,
    },
    {
      category: "Transportation",
      monthlyAmounts: { October: 423.6, November: 445.2, December: 456.8 },
      trend: "up" as const,
      changePercentage: 7.8,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <FiTrendingUp className="text-red-500" />;
      case "down":
        return <FiTrendingDown className="text-green-500" />;
      default:
        return <FiDollarSign className="text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-red-500";
    if (trend === "down") return "text-green-500";
    return "text-gray-500";
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary flex items-center space-x-2">
          <FiCalendar className="text-[colors.primary.500]" />
          <span>Spending Trends Demo</span>
        </h2>
        <div className="text-sm text-text-tertiary">
          📊 Sample data for demonstration
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMonthlyData.map((month) => (
          <div
            key={month.month}
            className="bg-background-primary/50 rounded-xl p-4 border border-border-primary/30"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {month.month}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Total Spending</span>
                <span className="text-text-primary font-semibold">
                  {formatCurrency(month.totalSpending)}
                </span>
              </div>
              <div className="space-y-1">
                {month.categories.slice(0, 3).map((category) => (
                  <div
                    key={category.category}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-text-secondary truncate">
                      {category.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-text-tertiary">
                        {formatCurrency(category.amount)}
                      </span>
                      <div className="w-16 bg-background-tertiary rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-[colors.primary.500] to-[colors.secondary.500] h-1.5 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Trends */}
      <div className="bg-background-primary/50 rounded-xl p-6 border border-border-primary/30">
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Category Trends
        </h3>
        <div className="space-y-4">
          {mockTrends.map((trend) => (
            <div
              key={trend.category}
              className="flex items-center justify-between p-4 bg-background-secondary/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getTrendIcon(trend.trend)}
                <span className="text-text-primary font-medium">{trend.category}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-text-tertiary">Latest Month</div>
                  <div className="text-text-primary font-semibold">
                    {formatCurrency(
                      Object.values(trend.monthlyAmounts).slice(-1)[0] || 0
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-tertiary">Change</div>
                  <div
                    className={`font-semibold ${getTrendColor(trend.trend)}`}
                  >
                    {trend.changePercentage > 0 ? "+" : ""}
                    {trend.changePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      <div className="bg-background-primary/50 rounded-xl p-6 border border-border-primary/30">
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Monthly Comparison
        </h3>
        <div className="space-y-3">
          {mockTrends.slice(0, 3).map((trend) => (
            <div key={trend.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-primary font-medium">{trend.category}</span>
                <span className="text-text-tertiary text-sm">
                  {formatCurrency(
                    Object.values(trend.monthlyAmounts).reduce(
                      (sum, amount) => sum + amount,
                      0
                    )
                  )}{" "}
                  total
                </span>
              </div>
              <div className="flex space-x-1">
                {["October", "November", "December"].map((month) => {
                  const amount = trend.monthlyAmounts[month] || 0;
                  const maxAmount = Math.max(
                    ...Object.values(trend.monthlyAmounts)
                  );
                  const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                  return (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center space-y-1"
                    >
                      <div
                        className="w-full bg-background-tertiary rounded-t"
                        style={{ height: "60px" }}
                      >
                        <div
                          className="bg-gradient-to-t from-[colors.primary.500] to-[colors.secondary.500] rounded-t transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {month.slice(0, 3)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingTrendsDemo;
