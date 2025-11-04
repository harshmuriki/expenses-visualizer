"use client";

import React from "react";
import {
  FiDollarSign,
  FiPieChart,
  FiTrendingUp,
  FiCreditCard,
} from "react-icons/fi";

interface StatsCardsProps {
  totalSpend: number;
  categoryCount: number;
  topCategory: { name: string; value: number; color: string };
  transactionCount?: number;
  avgTransaction?: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalSpend,
  categoryCount,
  topCategory,
  transactionCount,
  avgTransaction,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Spending",
      value: formatCurrency(totalSpend),
      icon: FiDollarSign,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/15",
      gradientFrom: "from-emerald-500/10",
      gradientTo: "to-emerald-500/5",
    },
    {
      title: "Categories",
      value: categoryCount.toString(),
      icon: FiPieChart,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/15",
      gradientFrom: "from-blue-500/10",
      gradientTo: "to-blue-500/5",
    },
    {
      title: "Top Category",
      value: topCategory.name,
      subtitle: formatCurrency(topCategory.value),
      icon: FiTrendingUp,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/15",
      gradientFrom: "from-violet-500/10",
      gradientTo: "to-violet-500/5",
    },
    ...(transactionCount && avgTransaction
      ? [
          {
            title: "Transactions",
            value: transactionCount.toString(),
            subtitle: `Avg: ${formatCurrency(avgTransaction)}`,
            icon: FiCreditCard,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/15",
            gradientFrom: "from-amber-500/10",
            gradientTo: "to-amber-500/5",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-2xl border border-border-secondary bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-border-focus/30`}
          >
            {/* Background gradient effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background-glass opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-text-primary tracking-tight">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-sm font-medium text-text-secondary">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`flex-shrink-0 p-3.5 rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <IconComponent className={`h-7 w-7 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
