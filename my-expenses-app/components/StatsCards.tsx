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
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Categories",
      value: categoryCount.toString(),
      icon: FiPieChart,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Top Category",
      value: topCategory.name,
      subtitle: formatCurrency(topCategory.value),
      icon: FiTrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    ...(transactionCount && avgTransaction
      ? [
          {
            title: "Transactions",
            value: transactionCount.toString(),
            subtitle: `Avg: ${formatCurrency(avgTransaction)}`,
            icon: FiCreditCard,
            color: "text-orange-400",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/20",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className={`rounded-xl border ${stat.borderColor} ${stat.bgColor} p-4 transition-all hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-tertiary mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
