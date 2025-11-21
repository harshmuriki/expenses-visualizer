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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the month number and year
  const { monthNumber, year } = useMemo(() => {
    const monthLower = month.toLowerCase().trim();
    // Try to find month in the mapping
    let monthNum = MONTH_NAMES[monthLower];
    
    // If not found, try to extract from strings like "January 2025" or "jan 2025"
    if (monthNum === undefined) {
      const parts = monthLower.split(/\s+/);
      for (const part of parts) {
        if (MONTH_NAMES[part] !== undefined) {
          monthNum = MONTH_NAMES[part];
          break;
        }
      }
    }
    
    // Default to current month if still not found
    const monthNumber = monthNum ?? new Date().getMonth();
    
    // Try to extract year from month string (e.g., "January 2025")
    const yearMatch = month.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
    
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
        // Try multiple date parsing strategies
        let transactionDate: Date | null = null;
        
        // Strategy 1: Direct Date constructor
        const dateStr = String(transaction.date).trim();
        transactionDate = new Date(dateStr);
        
        // Strategy 2: If invalid, try parsing common formats
        if (isNaN(transactionDate.getTime())) {
          // Try MM/DD/YYYY or YYYY-MM-DD
          const parts = dateStr.split(/[-\/]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              // YYYY-MM-DD format
              transactionDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              // MM/DD/YYYY format
              transactionDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            }
          }
        }
        
        // Only process if we have a valid date
        if (transactionDate && !isNaN(transactionDate.getTime())) {
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
        }
      } catch (error) {
        console.warn("Invalid date format:", transaction.date, error);
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

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        setSelectedDay(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

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
                    setSelectedDay(dayData.date);
                    setIsModalOpen(true);
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
                          <div className="space-y-0.5">
                            {dayData.transactions.slice(0, 2).map((transaction) => (
                              <div
                                key={transaction.index}
                                className="truncate text-[10px] text-text-secondary"
                              >
                                • {transaction.name}
                              </div>
                            ))}
                            {dayData.transactions.length > 2 && (
                              <div className="text-[10px] text-text-tertiary">
                                +{dayData.transactions.length - 2} more
                              </div>
                            )}
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

      {/* Selected Day Modal */}
      {isModalOpen && selectedDayData && (
        <div
          className="glass-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto'
          }}
          onClick={() => {
            setIsModalOpen(false);
            setSelectedDay(null);
          }}
        >
          <div
            className="glass-modal w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative"
            style={{
              position: 'relative',
              margin: 'auto',
              zIndex: 10000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border-secondary/40 bg-background-secondary/40">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">
                  {MONTH_NAMES_FULL[monthNumber]} {selectedDayData.date}, {year}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {selectedDayData.transactions.length} transaction
                  {selectedDayData.transactions.length !== 1 ? "s" : ""} •{" "}
                  {formatCurrency(selectedDayData.total)}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedDay(null);
                }}
                className="rounded-full p-2 text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
                aria-label="Close day details"
              >
                ✕
              </button>
            </div>

            <div 
              className="p-6 overflow-y-auto space-y-2 flex-1"
              style={{ maxHeight: 'calc(90vh - 120px)' }}
            >
              {selectedDayData.transactions.length > 0 ? (
                selectedDayData.transactions
                  .sort((a, b) => (b.cost || 0) - (a.cost || 0))
                  .map((transaction) => {
                  const parentLink = links.find(
                    (link) => link.target === transaction.index
                  );
                  const category = parentLink
                    ? nodes.find((n) => n.index === parentLink.source)?.name
                    : "Uncategorized";

                  return (
                    <button
                      key={transaction.index}
                      onClick={() => {
                        if (onEditTransaction) {
                          onEditTransaction(transaction.index);
                        }
                        setIsModalOpen(false);
                        setSelectedDay(null);
                      }}
                      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-border-secondary bg-background-secondary/60 px-4 py-3 text-left transition hover:border-primary-500 hover:bg-background-tertiary/60"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary">
                          {transaction.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                          <span className="px-2 py-0.5 rounded-full bg-background-card border border-border-secondary">
                            {category}
                          </span>
                          {transaction.location &&
                            transaction.location !== "None" && (
                              <span>📍 {transaction.location}</span>
                            )}
                          {transaction.bank &&
                            transaction.bank !== "Unknown Bank" && (
                              <span>💳 {transaction.bank}</span>
                            )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">
                          {formatCurrency(transaction.cost || 0)}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          Tap to edit
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center text-text-tertiary py-8">
                  No transactions recorded for this day.
                </div>
              )}
            </div>
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
