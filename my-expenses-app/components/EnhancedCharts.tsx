"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import type { TooltipProps } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { CategoryAnalysis } from "@/lib/aiAnalytics";

interface EnhancedChartsProps {
  categoryData: CategoryAnalysis[];
  totalSpend: number;
}

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({
  categoryData,
  totalSpend,
}) => {
  const pieChartData = useMemo(
    () =>
      categoryData.map((cat) => ({
        name: cat.name,
        value: cat.amount,
        color: cat.color,
        percentage: cat.percentage,
      })),
    [categoryData]
  );

  const barChartData = useMemo(
    () =>
      categoryData.map((cat) => ({
        name:
          cat.name.length > 15 ? cat.name.substring(0, 15) + "..." : cat.name,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
    [categoryData]
  );

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border border-border-secondary bg-background-primary/95 p-3 shadow-lg">
          <p className="font-semibold text-text-primary">{data.name}</p>
          <p className="mt-1 text-[colors.accent.500]">
            ${Number(data.value).toFixed(2)}
          </p>
          <p className="text-xs text-text-tertiary">
            {((Number(data.value) / totalSpend) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Sample trend data (in real app, would use historical data)
  const trendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      spending: totalSpend * (0.8 + Math.random() * 0.4),
    }));
  }, [totalSpend]);

  if (categoryData.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-8 text-center">
        <p className="text-text-tertiary">
          No data available for visualization yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Spending by Category
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-text-secondary">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Category Comparison
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={barChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="colors.background.tertiary" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: "colors.text.secondary", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "colors.text.secondary" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {barChartData.map((entry, index) => {
                const matchingCategory = categoryData.find((cat) =>
                  cat.name.startsWith(entry.name.replace("...", ""))
                );
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={matchingCategory?.color || "#4fd1c5"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Line Chart */}
      <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Spending Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="colors.background.tertiary" />
            <XAxis dataKey="month" tick={{ fill: "colors.text.secondary" }} />
            <YAxis tick={{ fill: "colors.text.secondary" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "colors.background.primary",
                border: "1px solid colors.border.primary",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "colors.text.secondary" }}
            />
            <Area
              type="monotone"
              dataKey="spending"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpending)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 rounded-lg bg-background-secondary/50 p-3">
          <p className="text-xs text-text-tertiary">
            📊 This shows simulated historical trends. Connect more months of
            data for accurate trend analysis.
          </p>
        </div>
      </div>

      {/* Top Expenses Card Grid */}
      <div className="rounded-2xl border border-slate-800/60 bg-background-primary/70 p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Top 5 Categories
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categoryData.slice(0, 5).map((category, index) => (
            <div
              key={index}
              className="rounded-xl border border-border-secondary/60 bg-background-secondary/50 p-4 transition-all hover:scale-105 hover:border-[colors.primary.500]/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <p className="text-sm font-medium text-text-secondary">
                      {category.name}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    ${category.amount.toFixed(0)}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {category.percentage.toFixed(1)}% of total
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[colors.primary.500]">
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCharts;
