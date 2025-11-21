"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useSession } from "next-auth/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi";
import Plot from "react-plotly.js";
import { useTheme } from "@/lib/theme-context";

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  totalSpending: number;
  categories: CategorySpending[];
  transactionCount?: number;
}

interface TrendData {
  category: string;
  monthlyAmounts: { [month: string]: number };
  trend: "up" | "down" | "stable";
  changePercentage: number;
}

interface TransactionDetail {
  id: string | number;
  name: string;
  amount: number;
  category: string;
  date?: string;
  monthKey?: string;
  docId?: string | number;
}

interface Insight {
  type: "success" | "warning" | "info" | "alert";
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SpendingTrendsComponent: React.FC = () => {
  const { theme, themeName } = useTheme();
  const isLightTheme = themeName === "cherryBlossom" || themeName === "nordic";
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [monthlyTransactions, setMonthlyTransactions] = useState<
    Record<string, TransactionDetail[]>
  >({});
  const [calendarMonth, setCalendarMonth] = useState<string | null>(null);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<
    | {
        dateLabel: string;
        transactions: TransactionDetail[];
        dayNumber: number;
      }
    | null
  >(null);
  const [editableTransactions, setEditableTransactions] = useState<
    TransactionDetail[]
  >([]);
  const [isSavingDay, setIsSavingDay] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const calendarSectionRef = useRef<HTMLDivElement | null>(null);

  // State for available months
  const [availableMonths, setAvailableMonths] = useState<
    { name: string; key: string; createdAt?: string }[]
  >([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Function to discover all available collections with transaction data
  const discoverAvailableMonths = React.useCallback(async (): Promise<
    { name: string; key: string; createdAt?: string }[]
  > => {
    if (!session?.user?.email) return [];

    try {
      const userDocRef = doc(db, "users", session.user.email);
      const monthCollections: {
        name: string;
        key: string;
        createdAt?: string;
      }[] = [];

      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const monthsArray = userData.months || [];

        for (const monthName of monthsArray) {
          try {
            const monthCollectionRef = collection(userDocRef, monthName);
            const snapshot = await getDocs(monthCollectionRef);

            if (snapshot.docs.length > 0) {
              const hasTransactions = snapshot.docs.some(
                (doc) => doc.id !== "parentChildMap" && doc.id !== "meta"
              );

              if (hasTransactions) {
                let createdAt = undefined;
                try {
                  const metaDocRef = doc(userDocRef, monthName, "meta");
                  const metaDocSnapshot = await getDoc(metaDocRef);
                  if (metaDocSnapshot.exists()) {
                    const metaData = metaDocSnapshot.data();
                    createdAt =
                      metaData.createdAt || metaData.createdTimestamp;
                  }
                } catch {
                  // No metadata
                }

                monthCollections.push({
                  name: monthName,
                  key: monthName,
                  createdAt: createdAt,
                });
              }
            }
          } catch (error) {
            console.log(`Error checking collection "${monthName}":`, error);
          }
        }
      }

      return monthCollections.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        }
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error("Error discovering collections:", error);
      return [];
    }
  }, [session]);

  const fetchSpendingData = React.useCallback(async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep("Loading transaction data...");

    try {
      if (selectedMonths.length === 0) {
        setError("Please select at least one month to view trends");
        setIsLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", session.user.email);
      const monthlyDataArray: MonthlyData[] = [];
      const transactionMap: Record<string, TransactionDetail[]> = {};

      for (const monthKey of selectedMonths) {
        const month = availableMonths.find((m) => m.key === monthKey);
        if (!month) continue;

        setLoadingStep(`Processing ${month.name}...`);
        try {
          const monthCollectionRef = collection(userDocRef, month.key);
          const nodesSnapshot = await getDocs(monthCollectionRef);

          const transactionDocs = nodesSnapshot.docs.filter(
            (doc) => doc.id !== "parentChildMap" && doc.id !== "meta"
          );

          if (transactionDocs.length > 0) {
            const mapDocRef = doc(monthCollectionRef, "parentChildMap");
            const mapSnapshot = await getDoc(mapDocRef);

              if (mapSnapshot.exists()) {
                const parentChildMap = mapSnapshot.data();
                const categorySpending: { [category: string]: number } = {};
                const monthTransactions: TransactionDetail[] = [];
                let transactionCount = 0;

              for (const [parentIndex, childIndices] of Object.entries(
                parentChildMap
              )) {
                const parentNode = transactionDocs.find(
                  (doc) =>
                    doc.data().index === parseInt(parentIndex) &&
                    doc.data().isleaf === false
                );

                if (parentNode) {
                  const categoryName = parentNode.data().transaction;
                  let categoryTotal = 0;

                  for (const childIndex of childIndices as number[]) {
                    const childNode = transactionDocs.find(
                      (doc) =>
                        doc.data().index === childIndex &&
                        doc.data().isleaf === true
                    );
                    if (childNode) {
                      categoryTotal += childNode.data().cost || 0;
                      transactionCount++;

                      monthTransactions.push({
                        id: childNode.id || childIndex,
                        name:
                          childNode.data().transaction || "Unnamed Transaction",
                        amount: childNode.data().cost || 0,
                        category: categoryName,
                        date: childNode.data().date,
                        monthKey: month.key,
                        docId: childNode.id || childIndex,
                      });
                    }
                  }

                  if (categoryTotal > 0) {
                    categorySpending[categoryName] = categoryTotal;
                  }
                }
              }

              const totalSpending = Object.values(categorySpending).reduce(
                (sum, amount) => sum + amount,
                0
              );

              const categories: CategorySpending[] = Object.entries(
                categorySpending
              )
                .map(([category, amount]) => ({
                  category,
                  amount,
                  percentage:
                    totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
                }))
                .sort((a, b) => b.amount - a.amount);

                monthlyDataArray.push({
                  month: month.name,
                  totalSpending,
                  categories,
                  transactionCount,
                });

                transactionMap[month.key] = monthTransactions;
              }
            }
        } catch (monthError) {
          console.warn(`Could not fetch data for ${month.name}:`, monthError);
        }
      }

      setLoadingStep("Calculating trends...");
      setMonthlyData(monthlyDataArray);
      setMonthlyTransactions(transactionMap);
      setCalendarMonth((current) => {
        if (current && selectedMonths.includes(current)) {
          return current;
        }
        return selectedMonths[0] || null;
      });
      calculateTrends(monthlyDataArray);
    } catch (error) {
      console.error("Error fetching spending data:", error);
      setError("Failed to load spending trends");
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedMonths, availableMonths]);

  const loadAvailableMonths = React.useCallback(async () => {
    if (!session?.user?.email) return;

    setLoadingStep("Discovering available months...");
    const months = await discoverAvailableMonths();
    setAvailableMonths(months);
    // Only show month selector if we're initializing (not if we're refreshing data)
    if (isInitializing) {
      setShowMonthSelector(true);
    }
    setIsInitializing(false);
  }, [session, discoverAvailableMonths, isInitializing]);

  useEffect(() => {
    if (session?.user?.email && isInitializing) {
      loadAvailableMonths();
    }
  }, [session, loadAvailableMonths, isInitializing]);

  useEffect(() => {
    if (selectedMonths.length > 0) {
      fetchSpendingData();
    }
  }, [selectedMonths, fetchSpendingData]);

  const calculateTrends = (data: MonthlyData[]) => {
    const trendMap: { [category: string]: { [month: string]: number } } = {};

    data.forEach((monthData) => {
      monthData.categories.forEach((category) => {
        if (!trendMap[category.category]) {
          trendMap[category.category] = {};
        }
        trendMap[category.category][monthData.month] = category.amount;
      });
    });

    const trendData: TrendData[] = Object.entries(trendMap).map(
      ([category, monthlyAmounts]) => {
        const months = Object.keys(monthlyAmounts).sort();
        if (months.length < 2) {
          return {
            category,
            monthlyAmounts,
            trend: "stable" as const,
            changePercentage: 0,
          };
        }

        const firstMonth = months[0];
        const lastMonth = months[months.length - 1];
        const firstAmount = monthlyAmounts[firstMonth] || 0;
        const lastAmount = monthlyAmounts[lastMonth] || 0;

        const changePercentage =
          firstAmount > 0
            ? ((lastAmount - firstAmount) / firstAmount) * 100
            : 0;

        let trend: "up" | "down" | "stable" = "stable";
        if (Math.abs(changePercentage) > 10) {
          trend = changePercentage > 0 ? "up" : "down";
        }

        return {
          category,
          monthlyAmounts,
          trend,
          changePercentage,
        };
      }
    );

    setTrends(
      trendData.sort(
        (a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage)
      )
    );
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const totalSpent = monthlyData.reduce(
      (sum, month) => sum + month.totalSpending,
      0
    );
    const avgMonthly = totalSpent / monthlyData.length;
    const highestMonth = monthlyData.reduce((max, month) =>
      month.totalSpending > max.totalSpending ? month : max
    );
    const lowestMonth = monthlyData.reduce((min, month) =>
      month.totalSpending < min.totalSpending ? month : min
    );

    const totalTransactions = monthlyData.reduce(
      (sum, month) => sum + (month.transactionCount || 0),
      0
    );

    const avgDailySpending = totalSpent / (monthlyData.length * 30);

    // Get top categories across all months
    const allCategories: { [key: string]: number } = {};
    monthlyData.forEach((month) => {
      month.categories.forEach((cat) => {
        allCategories[cat.category] =
          (allCategories[cat.category] || 0) + cat.amount;
      });
    });

    const topCategory = Object.entries(allCategories).reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return {
      totalSpent,
      avgMonthly,
      highestMonth,
      lowestMonth,
      totalTransactions,
      avgDailySpending,
      topCategory: { name: topCategory[0], amount: topCategory[1] },
    };
  }, [monthlyData]);

  // Generate insights
  const insights = useMemo((): Insight[] => {
    if (!summaryStats || monthlyData.length < 2) return [];

    const insightsList: Insight[] = [];

    // Spending trend insight
    const recentMonths = monthlyData.slice(-2);
    if (recentMonths.length === 2) {
      const change =
        ((recentMonths[1].totalSpending - recentMonths[0].totalSpending) /
          recentMonths[0].totalSpending) *
        100;

      if (change > 15) {
        insightsList.push({
          type: "alert",
          title: "Spending Increased",
          description: `You spent ${change.toFixed(
            1
          )}% more in ${recentMonths[1].month} compared to ${recentMonths[0].month}`,
          icon: <FiTrendingUp className="w-5 h-5" />,
        });
      } else if (change < -15) {
        insightsList.push({
          type: "success",
          title: "Great Progress!",
          description: `You spent ${Math.abs(change).toFixed(
            1
          )}% less in ${recentMonths[1].month} compared to ${recentMonths[0].month}`,
          icon: <FiTrendingDown className="w-5 h-5" />,
        });
      }
    }

    // Top category insight
    insightsList.push({
      type: "info",
      title: "Top Spending Category",
      description: `${summaryStats.topCategory.name} accounts for most of your spending`,
      icon: <FiPieChart className="w-5 h-5" />,
    });

    // Daily spending insight
    insightsList.push({
      type: "info",
      title: "Daily Average",
      description: `You're spending about ${formatCurrency(
        summaryStats.avgDailySpending
      )} per day`,
      icon: <FiActivity className="w-5 h-5" />,
    });

    // Category trend insights
    const biggestIncrease = trends.find((t) => t.trend === "up");
    if (biggestIncrease) {
      insightsList.push({
        type: "warning",
        title: "Rising Category",
        description: `${biggestIncrease.category} spending increased by ${biggestIncrease.changePercentage.toFixed(1)}%`,
        icon: <FiArrowUp className="w-5 h-5" />,
      });
    }

    const biggestDecrease = trends.find((t) => t.trend === "down");
    if (biggestDecrease) {
      insightsList.push({
        type: "success",
        title: "Reduced Spending",
        description: `${biggestDecrease.category} spending decreased by ${Math.abs(biggestDecrease.changePercentage).toFixed(1)}%`,
        icon: <FiArrowDown className="w-5 h-5" />,
      });
    }

    return insightsList;
  }, [summaryStats, monthlyData, trends]);

  const calendarData = useMemo(() => {
    if (!calendarMonth) return null;

    const transactions = monthlyTransactions[calendarMonth] || [];
    const datedTransactions = transactions.filter(
      (txn) => txn.date && !isNaN(new Date(txn.date).getTime())
    );

    const referenceDate = datedTransactions[0]?.date
      ? new Date(datedTransactions[0].date as string)
      : new Date();

    const year = referenceDate.getFullYear();
    const monthIndex = referenceDate.getMonth();
    const monthName = referenceDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const startDay = new Date(year, monthIndex, 1).getDay();

    const dailySpending: Record<number, { total: number; items: TransactionDetail[] }> = {};

    datedTransactions.forEach((txn) => {
      const dateObj = txn.date ? new Date(txn.date) : null;
      if (!dateObj) return;
      const day = dateObj.getDate();
      if (!dailySpending[day]) {
        dailySpending[day] = { total: 0, items: [] };
      }
      dailySpending[day].total += txn.amount;
      dailySpending[day].items.push(txn);
    });

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
      (day) => ({
        day,
        total: dailySpending[day]?.total || 0,
        items: dailySpending[day]?.items || [],
      })
    );

    const padding = Array.from({ length: startDay }, () => null);

    return {
      monthName,
      days: [...padding, ...days],
      hasData: transactions.length > 0,
      totalSpent: transactions.reduce((sum, txn) => sum + txn.amount, 0),
    };
  }, [calendarMonth, monthlyTransactions]);

  const formatDateLabel = (dateString?: string, fallback?: string) => {
    if (!dateString) return fallback || "";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return fallback || dateString;
    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "";
    return parsed.toISOString().split("T")[0];
  };

  const handleDayClick = (day: { day: number; items: TransactionDetail[] }) => {
    if (!calendarData) return;
    const referenceDate = day.items[0]?.date;
    const label = formatDateLabel(
      referenceDate,
      `${calendarData.monthName} ${day.day}`
    );
    setSelectedDay({
      dateLabel: label,
      transactions: day.items,
      dayNumber: day.day,
    });
    setEditableTransactions(day.items.map((item) => ({ ...item })));
    setShowCalendarPicker(false);
  };

  useEffect(() => {
    if (selectedDay && calendarSectionRef.current) {
      calendarSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDay]);

  const updateEditableTransaction = (
    index: number,
    field: keyof TransactionDetail,
    value: string
  ) => {
    setEditableTransactions((prev) =>
      prev.map((txn, i) => {
        if (i !== index) return txn;
        if (field === "amount") {
          const parsed = parseFloat(value);
          return { ...txn, amount: isNaN(parsed) ? txn.amount : parsed };
        }
        return { ...txn, [field]: value } as TransactionDetail;
      })
    );
  };

  const handleSaveDayChanges = async () => {
    if (!session?.user?.email || !selectedDay || !calendarMonth) return;
    setIsSavingDay(true);
    setSaveError(null);
    try {
      const userDocRef = doc(db, "users", session.user.email);
      await Promise.all(
        editableTransactions.map(async (txn) => {
          if (!txn.monthKey || !txn.docId) return;
          const txnRef = doc(userDocRef, txn.monthKey, String(txn.docId));
          await updateDoc(txnRef, {
            transaction: txn.name,
            cost: txn.amount,
            date: txn.date,
          });
        })
      );

      setMonthlyTransactions((prev) => {
        const currentMonthTransactions = prev[calendarMonth || ""] || [];
        const updated = currentMonthTransactions.map((existing) => {
          const updatedTxn = editableTransactions.find(
            (txn) => txn.id === existing.id
          );
          return updatedTxn ? { ...existing, ...updatedTxn } : existing;
        });
        return { ...prev, [calendarMonth || ""]: updated };
      });

      fetchSpendingData();
      setSelectedDay(null);
    } catch (err) {
      console.error("Failed to update transactions", err);
      setSaveError("Failed to save updates. Please try again.");
    } finally {
      setIsSavingDay(false);
    }
  };

  if (showMonthSelector) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-8 border border-border-secondary shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary">
                Select Time Period
              </h3>
              <p className="text-text-tertiary">
                Choose which months to include in your analysis
              </p>
            </div>
          </div>

          {availableMonths.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-text-primary mb-2">
                No Data Yet
              </h4>
              <p className="text-text-tertiary">
                Upload your first CSV to start tracking trends
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {availableMonths
                  .sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      );
                    }
                    if (a.createdAt && !b.createdAt) return -1;
                    if (!a.createdAt && b.createdAt) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((month) => (
                    <label
                      key={month.key}
                      className={`relative flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        selectedMonths.includes(month.key)
                          ? "bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg scale-105"
                          : "bg-background-secondary/50 border-border-secondary hover:border-primary-500/50 hover:scale-102"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(month.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMonths([...selectedMonths, month.key]);
                          } else {
                            setSelectedMonths(
                              selectedMonths.filter((m) => m !== month.key)
                            );
                          }
                        }}
                        className="w-5 h-5 text-primary-500 bg-background-tertiary border-border-primary rounded-md focus:ring-primary-500 focus:ring-2"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-text-primary">
                          {month.name}
                        </span>
                        {month.createdAt && (
                          <span className="text-xs text-text-tertiary">
                            {new Date(month.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>
                      {selectedMonths.includes(month.key) && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </label>
                  ))}
              </div>

              {/* Quick Select Buttons */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setSelectedMonths(availableMonths.map((m) => m.key))}
                  className="px-4 py-2 text-sm bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition border border-border-secondary"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedMonths([])}
                  className="px-4 py-2 text-sm bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition border border-border-secondary"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    const last3 = availableMonths.slice(0, 3).map((m) => m.key);
                    setSelectedMonths(last3);
                  }}
                  className="px-4 py-2 text-sm bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition border border-border-secondary"
                >
                  Last 3 Months
                </button>
              </div>

              {selectedMonths.length > 0 && (
                <div className="flex justify-between items-center pt-6 border-t border-border-secondary">
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
                      <span className="text-primary-500 font-bold">
                        {selectedMonths.length}
                      </span>
                      <span className="text-text-tertiary ml-1">
                        month{selectedMonths.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMonthSelector(false);
                      fetchSpendingData();
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <FiBarChart2 className="w-5 h-5" />
                    Analyze Trends
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (isLoading || isInitializing) {
    return (
      <div className="w-full p-8 bg-background-card rounded-xl border border-border-secondary">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-8 h-8 border-2 border-border-secondary border-t-secondary-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {loadingStep}
            </h3>
            <p className="text-text-secondary">
              {isInitializing
                ? "Preparing your insights..."
                : "Crunching the numbers..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-background-card rounded-xl border border-border-secondary">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-primary mb-4">{error}</p>
          <button
            onClick={fetchSpendingData}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500">
            <FiActivity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-text-primary">
              Spending Insights
            </h2>
            <p className="text-text-tertiary">
              {selectedMonths.length} month{selectedMonths.length !== 1 ? "s" : ""} of data
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowCalendarPicker((prev) => !prev)}
              className="px-4 py-2 bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition border border-border-secondary flex items-center gap-2"
            >
              <FiCalendar className="w-4 h-4" />
              Calendar Month
            </button>
            {showCalendarPicker && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border-secondary bg-background-card shadow-lg z-10">
                <div className="p-3 border-b border-border-secondary text-sm font-semibold text-text-secondary">
                  Jump to month
                </div>
                <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                  {selectedMonths.length === 0 && (
                    <div className="text-xs text-text-tertiary px-2 py-1">
                      Select months first to enable calendar view.
                    </div>
                  )}
                  {selectedMonths.map((monthKey) => {
                    const month = availableMonths.find((m) => m.key === monthKey);
                    return (
                      <button
                        key={monthKey}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          calendarMonth === monthKey
                            ? "bg-primary-500/10 text-primary-500"
                            : "hover:bg-background-tertiary text-text-primary"
                        }`}
                        onClick={() => {
                          setCalendarMonth(monthKey);
                          setShowCalendarPicker(false);
                          setTimeout(() => {
                            calendarSectionRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }, 50);
                        }}
                      >
                        {month?.name || monthKey}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowMonthSelector(true)}
            className="px-4 py-2 bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition border border-border-secondary flex items-center gap-2"
          >
            <FiCalendar className="w-4 h-4" />
            Change Period
          </button>
          <button
            onClick={fetchSpendingData}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition flex items-center gap-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Spent */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FiDollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {formatCurrency(summaryStats.totalSpent)}
            </div>
            <div className="text-sm text-text-tertiary">Total Spent</div>
            <div className="text-xs text-text-tertiary mt-2">
              Avg: {formatCurrency(summaryStats.avgMonthly)}/month
            </div>
          </div>

          {/* Daily Average */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FiActivity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {formatCurrency(summaryStats.avgDailySpending)}
            </div>
            <div className="text-sm text-text-tertiary">Daily Average</div>
            <div className="text-xs text-text-tertiary mt-2">
              Based on selected months
            </div>
          </div>

          {/* Top Category */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <FiPieChart className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1 truncate">
              {summaryStats.topCategory.name}
            </div>
            <div className="text-sm text-text-tertiary">Top Category</div>
            <div className="text-xs text-text-tertiary mt-2">
              {formatCurrency(summaryStats.topCategory.amount)}
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <FiBarChart2 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {summaryStats.totalTransactions}
            </div>
            <div className="text-sm text-text-tertiary">Transactions</div>
            <div className="text-xs text-text-tertiary mt-2">
              Avg: {Math.round(summaryStats.totalTransactions / monthlyData.length)}/month
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-6 border border-border-secondary shadow-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-primary-500" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${
                  insight.type === "success"
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : insight.type === "warning"
                    ? "bg-yellow-500/5 border-yellow-500/30"
                    : insight.type === "alert"
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-blue-500/5 border-blue-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      insight.type === "success"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : insight.type === "warning"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : insight.type === "alert"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-text-tertiary">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {calendarData && (
        <div
          ref={calendarSectionRef}
          className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-6 border border-border-secondary shadow-xl space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-primary-500" />
                Monthly Calendar
              </h3>
              <p className="text-text-tertiary text-sm">
                View daily spending across your selected month
              </p>
              <p className="text-text-secondary text-sm font-semibold">
                {calendarData.monthName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={calendarMonth || ""}
                onChange={(e) => setCalendarMonth(e.target.value)}
                className="rounded-lg border border-border-secondary bg-background-tertiary px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
              >
                {selectedMonths.map((monthKey) => {
                  const month = availableMonths.find((m) => m.key === monthKey);
                  return (
                    <option key={monthKey} value={monthKey}>
                      {month?.name || monthKey}
                    </option>
                  );
                })}
              </select>
              <div className="rounded-lg border border-border-secondary bg-background-tertiary px-3 py-2 text-sm text-text-primary">
                Total: {formatCurrency(calendarData.totalSpent)}
              </div>
            </div>
          </div>

          {calendarData.hasData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-text-tertiary px-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {calendarData.days.map((day, index) =>
                  day ? (
                    <div
                      key={`${calendarData.monthName}-${day.day}-${index}`}
                      onClick={() => handleDayClick(day)}
                      className={`rounded-xl border p-3 min-h-[110px] flex flex-col gap-2 transition-all duration-200 cursor-pointer ${
                        day.total > 0
                          ? "bg-primary-500/10 border-primary-500/40"
                          : "bg-background-tertiary/30 border-border-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
                        <span>{day.day}</span>
                        {day.total > 0 && (
                          <span className="text-xs font-bold text-primary-500">
                            {formatCurrency(day.total)}
                          </span>
                        )}
                      </div>
                      {day.items.length > 0 ? (
                        <div className="space-y-1 text-[11px] text-text-tertiary">
                          {day.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                              <span className="truncate font-medium text-text-primary">
                                {item.name}
                              </span>
                              <span className="font-semibold text-text-primary">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          ))}
                          {day.items.length > 2 && (
                            <div className="text-[11px] text-text-secondary">
                              +{day.items.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-text-tertiary italic">No spending</p>
                      )}
                    </div>
                  ) : (
                    <div
                      key={`${calendarData.monthName}-pad-${index}`}
                      className="rounded-xl border border-border-secondary bg-background-tertiary/20"
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-text-tertiary">
              No transactions for this month yet.
            </div>
          )}
        </div>
      )}

      {/* Monthly Spending Chart */}
      <div className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-6 border border-border-secondary shadow-xl">
        <h3 className="text-xl font-bold text-text-primary mb-4">
          Monthly Spending Overview
        </h3>
        <div className="h-96">
          <Plot
            data={[
              {
                x: monthlyData
                  .sort((a, b) => {
                    const monthA = availableMonths.find((m) => m.name === a.month);
                    const monthB = availableMonths.find((m) => m.name === b.month);
                    if (monthA?.createdAt && monthB?.createdAt) {
                      return (
                        new Date(monthA.createdAt).getTime() -
                        new Date(monthB.createdAt).getTime()
                      );
                    }
                    return a.month.localeCompare(b.month);
                  })
                  .map((m) => m.month),
                y: monthlyData.map((m) => m.totalSpending),
                type: "bar",
                marker: {
                  color: monthlyData.map((_, i) => theme.categories[i % theme.categories.length]),
                  line: {
                    color: theme.primary[500],
                    width: 1,
                  },
                },
                hovertemplate: "<b>%{x}</b><br>Total: %{y:$,.0f}<extra></extra>",
          },
        ]}
        layout={{
              xaxis: {
                title: "Month",
                color: theme.text.secondary,
                gridcolor: isLightTheme ? theme.border.secondary : theme.border.primary,
                showgrid: false,
              },
              yaxis: {
                title: "Amount",
                color: theme.text.secondary,
                gridcolor: isLightTheme ? theme.border.secondary : theme.border.primary,
                showgrid: true,
                tickformat: "$,.0f",
              },
              plot_bgcolor: "rgba(0,0,0,0)",
              paper_bgcolor: "rgba(0,0,0,0)",
              font: { color: theme.text.tertiary },
              margin: { t: 20, b: 50, l: 80, r: 20 },
              hovermode: "x unified",
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: "100%", height: "100%" }}
      />
    </div>

      {selectedDay && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-background-card rounded-2xl border border-border-secondary shadow-2xl">
            <div className="flex items-start justify-between p-6 border-b border-border-secondary">
              <div>
                <p className="text-sm text-text-tertiary">Daily details</p>
                <h3 className="text-2xl font-bold text-text-primary">
                  {selectedDay.dateLabel}
                </h3>
                <p className="text-text-secondary text-sm">
                  {selectedDay.transactions.length} transaction
                  {selectedDay.transactions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSaveError(null);
                }}
                className="text-text-tertiary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            {saveError && (
              <div className="mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500">
                {saveError}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {editableTransactions.length === 0 ? (
                <p className="text-text-tertiary text-sm">
                  No transactions recorded for this day.
                </p>
              ) : (
                editableTransactions.map((txn, index) => (
                  <div
                    key={txn.id}
                    className="rounded-xl border border-border-secondary bg-background-tertiary/40 p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wide text-text-tertiary">
                          Name
                        </label>
                        <input
                          type="text"
                          value={txn.name}
                          onChange={(e) =>
                            updateEditableTransaction(index, "name", e.target.value)
                          }
                          className="rounded-lg border border-border-secondary bg-background-card px-3 py-2 text-text-primary focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wide text-text-tertiary">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={txn.amount}
                          onChange={(e) =>
                            updateEditableTransaction(index, "amount", e.target.value)
                          }
                          className="rounded-lg border border-border-secondary bg-background-card px-3 py-2 text-text-primary focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wide text-text-tertiary">
                          Date
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(txn.date)}
                          onChange={(e) =>
                            updateEditableTransaction(index, "date", e.target.value)
                          }
                          className="rounded-lg border border-border-secondary bg-background-card px-3 py-2 text-text-primary focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wide text-text-tertiary">
                          Category
                        </label>
                        <div className="rounded-lg border border-border-secondary bg-background-tertiary px-3 py-2 text-text-primary">
                          {txn.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 border-t border-border-secondary">
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSaveError(null);
                }}
                className="px-4 py-2 rounded-lg border border-border-secondary text-text-primary hover:bg-background-tertiary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDayChanges}
                disabled={isSavingDay}
                className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 ${
                  isSavingDay
                    ? "bg-primary-500/70 cursor-wait"
                    : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                }`}
              >
                {isSavingDay ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Category Breakdown with Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-6 border border-border-secondary shadow-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">
            Spending by Category
          </h3>
          <div className="h-96">
            {summaryStats && (
              <Plot
                data={[
                  {
                    labels: monthlyData[0]?.categories.map((c) => c.category) || [],
                    values: monthlyData[0]?.categories.map((c) => c.amount) || [],
                    type: "pie",
                    marker: {
                      colors: theme.categories,
                    },
                    textinfo: "label+percent",
                    textposition: "auto",
                    hovertemplate: "<b>%{label}</b><br>%{value:$,.0f}<br>%{percent}<extra></extra>",
                  },
                ]}
                layout={{
                  plot_bgcolor: "rgba(0,0,0,0)",
                  paper_bgcolor: "rgba(0,0,0,0)",
                  font: { color: theme.text.primary },
                  margin: { t: 20, b: 20, l: 20, r: 20 },
                  showlegend: true,
                  legend: {
                    bgcolor: "rgba(0,0,0,0)",
                    font: { color: theme.text.primary, size: 10 },
                  },
                }}
                config={{
                  displayModeBar: false,
                  responsive: true,
                }}
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>
        </div>

        {/* Top Categories List */}
        <div className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-6 border border-border-secondary shadow-xl">
          <h3 className="text-xl font-bold text-text-primary mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {monthlyData[0]?.categories.slice(0, 8).map((category, index) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-text-tertiary">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-text-primary truncate">
                      {category.category}
                    </span>
                  </div>
                  <span className="font-bold text-text-primary">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-background-tertiary rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${category.percentage}%`,
                        background: theme.categories[index % theme.categories.length],
                      }}
                    />
                  </div>
                  <span className="absolute right-2 top-0 text-xs font-bold text-text-primary">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Trends Over Time */}
      <div className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-2xl p-6 border border-border-secondary shadow-xl">
        <h3 className="text-xl font-bold text-text-primary mb-4">
          Category Trends Over Time
        </h3>
        <div className="h-96">
          <Plot
            data={trends.slice(0, 5).map((trend, index) => {
              const months = availableMonths
                .filter((month) => selectedMonths.includes(month.key))
                .sort((a, b) => {
                  if (a.createdAt && b.createdAt) {
                    return (
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                    );
                  }
                  return a.name.localeCompare(b.name);
                });

              return {
                x: months.map((month) => month.name),
                y: months.map((month) => trend.monthlyAmounts[month.name] || 0),
                type: "scatter",
                mode: "lines+markers",
                name: trend.category,
                line: {
                  color: theme.categories[index % theme.categories.length],
                  width: 3,
                  shape: "spline",
                },
                marker: {
                  color: theme.categories[index % theme.categories.length],
                  size: 8,
                  line: {
                    color: theme.background.primary,
                    width: 2,
                  },
                },
              };
            })}
            layout={{
              xaxis: {
                title: "Month",
                color: theme.text.secondary,
                gridcolor: isLightTheme ? theme.border.secondary : theme.border.primary,
                showgrid: true,
              },
              yaxis: {
                title: "Amount",
                color: theme.text.secondary,
                gridcolor: isLightTheme ? theme.border.secondary : theme.border.primary,
                showgrid: true,
                tickformat: "$,.0f",
              },
              plot_bgcolor: "rgba(0,0,0,0)",
              paper_bgcolor: "rgba(0,0,0,0)",
              font: { color: theme.text.tertiary },
              margin: { t: 20, b: 50, l: 80, r: 20 },
              hovermode: "x unified",
              legend: {
                bgcolor: "rgba(0,0,0,0)",
                font: { color: theme.text.primary },
                orientation: "h",
                y: -0.2,
              },
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.slice(0, 6).map((trend) => (
          <div
            key={trend.category}
            className="bg-gradient-to-br from-background-card via-background-card to-background-secondary/30 rounded-xl p-5 border border-border-secondary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-text-primary mb-1 truncate">
                  {trend.category}
                </h4>
                <div className="text-2xl font-bold text-text-primary">
                  {formatCurrency(
                    Object.values(trend.monthlyAmounts).slice(-1)[0] || 0
                  )}
                </div>
              </div>
              <div
                className={`p-2 rounded-lg ${
                  trend.trend === "up"
                    ? "bg-red-500/20"
                    : trend.trend === "down"
                    ? "bg-emerald-500/20"
                    : "bg-slate-500/20"
                }`}
              >
                {trend.trend === "up" ? (
                  <FiTrendingUp className="w-5 h-5 text-red-500" />
                ) : trend.trend === "down" ? (
                  <FiTrendingDown className="w-5 h-5 text-emerald-500" />
                ) : (
                  <FiDollarSign className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  trend.trend === "up"
                    ? "bg-red-500/10 text-red-500"
                    : trend.trend === "down"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-slate-500/10 text-slate-500"
                }`}
              >
                {trend.changePercentage > 0 ? "+" : ""}
                {trend.changePercentage.toFixed(1)}%
              </div>
              <span className="text-xs text-text-tertiary">vs previous</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingTrendsComponent;
