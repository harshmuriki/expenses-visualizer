"use client";

import React, { useMemo, useState } from "react";
import { SankeyNode, SankeyLink } from "@/app/types/types";

interface CalendarViewProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  month: string;
  onEditTransaction?: (nodeIndex: number) => void;
}

interface DayData {
  date: number;
  transactions: SankeyNode[];
  total: number;
  isCurrentMonth: boolean;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarView: React.FC<CalendarViewProps> = ({
  nodes,
  links,
  month,
  onEditTransaction,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Get the month number and year
  const { monthNumber, year } = useMemo(() => {
    const monthNumber = MONTH_NAMES[month.toLowerCase()] ?? 0;
    // Use current year by default
    const year = new Date().getFullYear();
    return { monthNumber, year };
  }, [month]);

  // Filter to only leaf nodes (transactions)
  const transactions = useMemo(
    () => nodes.filter((node) => node.isleaf && node.cost),
    [nodes]
  );

  // Group transactions by date
  const transactionsByDate = useMemo(() => {
    const grouped = new Map<number, SankeyNode[]>();

    transactions.forEach((transaction) => {
      if (!transaction.date) return;

      try {
        const transactionDate = new Date(transaction.date);
        // Only include transactions from the current month
        if (
          transactionDate.getMonth() === monthNumber &&
          transactionDate.getFullYear() === year
        ) {
          const day = transactionDate.getDate();
          if (!grouped.has(day)) {
            grouped.set(day, []);
          }
          grouped.get(day)!.push(transaction);
        }
      } catch {
        console.warn("Invalid date format:", transaction.date);
      }
    });

    return grouped;
  }, [transactions, monthNumber, year]);

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, monthNumber, 1);
    const lastDay = new Date(year, monthNumber + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days: DayData[] = [];

    // Add empty days for previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        date: 0,
        transactions: [],
        total: 0,
        isCurrentMonth: false,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = transactionsByDate.get(day) || [];
      const total = dayTransactions.reduce(
        (sum, t) => sum + (t.cost || 0),
        0
      );

      days.push({
        date: day,
        transactions: dayTransactions,
        total,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [year, monthNumber, transactionsByDate]);

  // Calculate total spending for the month
  const monthTotal = useMemo(() => {
    return transactions
      .filter((t) => {
        if (!t.date) return false;
        try {
          const d = new Date(t.date);
          return d.getMonth() === monthNumber && d.getFullYear() === year;
        } catch {
          return false;
        }
      })
      .reduce((sum, t) => sum + (t.cost || 0), 0);
  }, [transactions, monthNumber, year]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const selectedDayData = useMemo(() => {
    if (selectedDay === null) return null;
    return calendarDays.find(
      (d) => d.date === selectedDay && d.isCurrentMonth
    );
  }, [selectedDay, calendarDays]);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="rounded-xl border border-border-secondary bg-background-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {MONTH_NAMES_FULL[monthNumber]} {year}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {transactions.length} transactions • {formatCurrency(monthTotal)}{" "}
              total
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-500">
              {formatCurrency(monthTotal)}
            </div>
            <p className="text-xs text-text-tertiary mt-1">Monthly Spending</p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-text-secondary py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayData, index) => {
            const hasTransactions = dayData.transactions.length > 0;
            const isSelected = selectedDay === dayData.date;

            return (
              <div
                key={index}
                onClick={() => {
                  if (dayData.isCurrentMonth && hasTransactions) {
                    setSelectedDay(
                      isSelected ? null : dayData.date
                    );
                  }
                }}
                className={`
                  relative min-h-[80px] rounded-lg border p-2 transition-all
                  ${
                    !dayData.isCurrentMonth
                      ? "bg-background-secondary border-transparent cursor-default"
                      : hasTransactions
                      ? `bg-background-card border-border-secondary cursor-pointer hover:border-primary-500 hover:shadow-lg ${
                          isSelected
                            ? "border-primary-500 shadow-lg ring-2 ring-primary-500/50"
                            : ""
                        }`
                      : "bg-background-card border-border-secondary cursor-default"
                  }
                `}
              >
                {dayData.isCurrentMonth && (
                  <>
                    <div className="text-sm font-semibold text-text-primary">
                      {dayData.date}
                    </div>
                    {hasTransactions && (
                      <>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-bold text-primary-500">
                            {formatCurrency(dayData.total)}
                          </div>
                          <div className="text-[10px] text-text-tertiary">
                            {dayData.transactions.length} transaction
                            {dayData.transactions.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        {/* Indicator dots for number of transactions */}
                        <div className="absolute bottom-2 left-2 right-2 flex gap-0.5 flex-wrap">
                          {dayData.transactions.slice(0, 5).map((_, idx) => (
                            <div
                              key={idx}
                              className="w-1 h-1 rounded-full bg-primary-500"
                            />
                          ))}
                          {dayData.transactions.length > 5 && (
                            <div className="text-[8px] text-text-tertiary ml-1">
                              +{dayData.transactions.length - 5}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayData && (
        <div className="rounded-xl border border-border-secondary bg-background-card p-6 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {MONTH_NAMES_FULL[monthNumber]} {selectedDayData.date}, {year}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-text-secondary hover:text-text-primary text-sm"
            >
              ✕ Close
            </button>
          </div>

          <div className="mb-4 p-4 rounded-lg bg-background-secondary">
            <div className="text-2xl font-bold text-primary-500">
              {formatCurrency(selectedDayData.total)}
            </div>
            <div className="text-sm text-text-secondary mt-1">
              {selectedDayData.transactions.length} transaction
              {selectedDayData.transactions.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {selectedDayData.transactions
              .sort((a, b) => (b.cost || 0) - (a.cost || 0))
              .map((transaction) => {
                // Find category for this transaction
                const parentLink = links.find(
                  (link) => link.target === transaction.index
                );
                const category = parentLink
                  ? nodes.find((n) => n.index === parentLink.source)?.name
                  : "Uncategorized";

                return (
                  <div
                    key={transaction.index}
                    onClick={() => {
                      if (onEditTransaction) {
                        onEditTransaction(transaction.index);
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background-secondary hover:bg-background-tertiary border border-border-secondary cursor-pointer transition-all hover:border-primary-500"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">
                        {transaction.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                        <span className="px-2 py-0.5 rounded-full bg-background-card border border-border-secondary">
                          {category}
                        </span>
                        {transaction.location &&
                          transaction.location !== "None" && (
                            <span>📍 {transaction.location}</span>
                          )}
                        {transaction.bank && transaction.bank !== "Unknown Bank" && (
                          <span>💳 {transaction.bank}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-text-primary">
                        {formatCurrency(transaction.cost || 0)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="rounded-xl border border-border-secondary bg-background-card p-12 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Transactions Yet
          </h3>
          <p className="text-text-secondary">
            Upload transactions or add them manually to see them on the
            calendar.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
