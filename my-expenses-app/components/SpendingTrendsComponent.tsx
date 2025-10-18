"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useSession } from "next-auth/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
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
}

interface TrendData {
  category: string;
  monthlyAmounts: { [month: string]: number };
  trend: "up" | "down" | "stable";
  changePercentage: number;
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

      console.log("🔍 Starting collection discovery...");
      console.log("📋 Fetching months from your user document...");

      try {
        // Get the user document to fetch the months array
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const monthsArray = userData.months || [];

          console.log(
            `📊 Found ${monthsArray.length} months in your user document:`
          );

          if (monthsArray.length === 0) {
            console.log("❌ No months found in your user document.");
            console.log(
              "💡 Make sure you have uploaded CSV files and they have been processed."
            );
          } else {
            console.log("📋 All months found");
            // monthsArray.forEach((month: string, index: number) => {
            //   console.log(`  ${index + 1}. "${month}"`);
            // });

            // Check each month collection for transaction data
            console.log(
              "🔍 Checking each month collection for transaction data..."
            );

            for (const monthName of monthsArray) {
              try {
                const monthCollectionRef = collection(userDocRef, monthName);
                const snapshot = await getDocs(monthCollectionRef);

                if (snapshot.docs.length > 0) {
                  // console.log(
                  //   `📁 Found collection: "${monthName}" with ${snapshot.docs.length} documents`
                  // );

                  // Check if this collection has transaction data
                  const hasTransactions = snapshot.docs.some(
                    (doc) => doc.id !== "parentChildMap" && doc.id !== "meta"
                  );

                  if (hasTransactions) {
                    // console.log(
                    //   `✅ Collection "${monthName}" has transaction data`
                    // );

                    // Try to get creation timestamp from meta document
                    let createdAt = undefined;
                    try {
                      const metaDocRef = doc(userDocRef, monthName, "meta");
                      const metaDocSnapshot = await getDoc(metaDocRef);
                      if (metaDocSnapshot.exists()) {
                        const metaData = metaDocSnapshot.data();
                        createdAt =
                          metaData.createdAt || metaData.createdTimestamp;
                        console.log(
                          `📅 Collection "${monthName}" created at: ${createdAt}`
                        );
                      }
                    } catch {
                      console.log(
                        `ℹ️ No metadata found for collection "${monthName}"`
                      );
                    }

                    monthCollections.push({
                      name: monthName,
                      key: monthName,
                      createdAt: createdAt,
                    });
                  } else {
                    console.log(
                      `ℹ️ Collection "${monthName}" exists but no transaction data`
                    );
                  }
                } else {
                  console.log(
                    `⚠️ Collection "${monthName}" exists but is empty`
                  );
                }
              } catch (error) {
                console.log(
                  `❌ Error checking collection "${monthName}":`,
                  error
                );
              }
            }
          }
        } else {
          console.log("❌ User document not found.");
          console.log(
            "💡 Make sure you have uploaded CSV files and they have been processed."
          );
        }
      } catch (error) {
        console.error("❌ Error fetching user document:", error);
        console.log(
          "💡 This might be a Firebase permissions issue or the user document doesn't exist yet."
        );
      }

      console.log(
        `🎯 DISCOVERY COMPLETE: Found ${monthCollections.length} collections with transaction data:`
      );

      if (monthCollections.length === 0) {
        console.log("❌ No collections with transaction data found!");
        console.log(
          "💡 Make sure you have uploaded CSV files and they have been processed."
        );
      } else {
        console.log("📋 All discovered collections:");
        // monthCollections.forEach((col, index) => {
        //   console.log(`  ${index + 1}. "${col.name}"`);
        // });
      }

      // Sort by creation date (newest first), then by name for consistent ordering
      return monthCollections.sort((a, b) => {
        // If both have creation dates, sort by date (newest first)
        if (a.createdAt && b.createdAt) {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        }
        // If only one has creation date, prioritize it
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        // If neither has creation date, sort by name
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

      // Fetch data for each selected month
      for (const monthKey of selectedMonths) {
        const month = availableMonths.find((m) => m.key === monthKey);
        if (!month) continue;

        setLoadingStep(`Processing ${month.name}...`);
        try {
          const monthCollectionRef = collection(userDocRef, month.key);
          const nodesSnapshot = await getDocs(monthCollectionRef);

          // Get transaction data (exclude parentChildMap and meta)
          const transactionDocs = nodesSnapshot.docs.filter(
            (doc) => doc.id !== "parentChildMap" && doc.id !== "meta"
          );

          if (transactionDocs.length > 0) {
            // Get parentChildMap to understand category structure
            const mapDocRef = doc(monthCollectionRef, "parentChildMap");
            const mapSnapshot = await getDoc(mapDocRef);

            if (mapSnapshot.exists()) {
              const parentChildMap = mapSnapshot.data();
              const categorySpending: { [category: string]: number } = {};

              // Calculate spending by category
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

                  // Sum up all child transactions for this category
                  for (const childIndex of childIndices as number[]) {
                    const childNode = transactionDocs.find(
                      (doc) =>
                        doc.data().index === childIndex &&
                        doc.data().isleaf === true
                    );
                    if (childNode) {
                      categoryTotal += childNode.data().cost || 0;
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
              });
            }
          }
        } catch (monthError) {
          console.warn(`Could not fetch data for ${month.name}:`, monthError);
        }
      }

      setLoadingStep("Calculating trends...");
      setMonthlyData(monthlyDataArray);
      calculateTrends(monthlyDataArray);
    } catch (error) {
      console.error("Error fetching spending data:", error);
      setError("Failed to load spending trends");
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedMonths, availableMonths]);

  // Load available months when component mounts
  const loadAvailableMonths = React.useCallback(async () => {
    if (!session?.user?.email) return;

    setLoadingStep("Discovering available months...");
    const months = await discoverAvailableMonths();
    setAvailableMonths(months);
    setShowMonthSelector(true);
    setIsInitializing(false);
  }, [session, discoverAvailableMonths]);

  useEffect(() => {
    if (session?.user?.email) {
      loadAvailableMonths();
    }
  }, [session, loadAvailableMonths]);

  // Fetch data when selected months change
  useEffect(() => {
    if (selectedMonths.length > 0) {
      fetchSpendingData();
    }
  }, [selectedMonths, fetchSpendingData]);

  const calculateTrends = (data: MonthlyData[]) => {
    const trendMap: { [category: string]: { [month: string]: number } } = {};

    // Collect all categories and their monthly amounts
    data.forEach((monthData) => {
      monthData.categories.forEach((category) => {
        if (!trendMap[category.category]) {
          trendMap[category.category] = {};
        }
        trendMap[category.category][monthData.month] = category.amount;
      });
    });

    // Calculate trends for each category
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
        return <FiTrendingDown className="text-emerald-500" />;
      default:
        return <FiDollarSign className="text-text-tertiary" />;
    }
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-red-500";
    if (trend === "down") return "text-emerald-500";
    return "text-text-tertiary";
  };

  if (showMonthSelector) {
    return (
      <div className="space-y-6">
        <div className="bg-background-card rounded-xl p-6 border border-border-secondary">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Select Months to Analyze
          </h3>
          <p className="text-text-tertiary mb-4">
            Choose which months you&apos;d like to include in your spending
            trends analysis.
          </p>

          {availableMonths.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-tertiary text-lg mb-2">📊</div>
              <p className="text-text-tertiary">No transaction data found</p>
              <p className="text-text-tertiary text-sm">
                Upload some CSV files to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableMonths
                .sort((a, b) => {
                  // Sort by creation date (newest first) for month selector
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
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedMonths.includes(month.key)
                        ? "bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 text-text-primary"
                        : "bg-background-secondary border-border-secondary hover:border-primary-500 text-text-secondary"
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
                      className="w-4 h-4 text-primary-500 bg-background-tertiary border-border-primary rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{month.name}</span>
                      {month.createdAt && (
                        <span className="text-xs text-text-tertiary">
                          Created:{" "}
                          {new Date(month.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
            </div>
          )}

          {selectedMonths.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-text-tertiary">
                {selectedMonths.length} month
                {selectedMonths.length !== 1 ? "s" : ""} selected
              </p>
              <button
                onClick={() => {
                  setShowMonthSelector(false);
                  fetchSpendingData();
                }}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-text-inverse rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-300"
              >
                Analyze Trends
              </button>
            </div>
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
            <div className="w-12 h-12 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-6 h-6 border-2 border-border-secondary border-t-secondary-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              🔍 {loadingStep}
            </h3>
            <p className="text-text-secondary text-sm">
              {isInitializing
                ? "Setting up your spending analysis..."
                : "Processing your financial data..."}
            </p>
            <div className="mt-3 flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-background-card rounded-xl border border-border-secondary">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchSpendingData}
            className="mt-2 px-4 py-2 bg-primary-500 text-text-inverse rounded-lg hover:bg-primary-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary flex items-center space-x-2">
          <FiCalendar className="text-primary-500" />
          <span>Spending Trends</span>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowMonthSelector(true)}
            className="px-4 py-2 bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition"
          >
            Change Months
          </button>
          <button
            onClick={fetchSpendingData}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-text-inverse rounded-lg hover:from-primary-600 hover:to-secondary-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Monthly Overview - only show selected months */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthlyData
          .filter((month) =>
            selectedMonths.some(
              (selectedKey) =>
                availableMonths.find(
                  (availMonth) => availMonth.key === selectedKey
                )?.name === month.month
            )
          )
          .sort((a, b) => {
            // Sort monthly data by creation date
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
          .map((month) => (
            <div
              key={month.month}
              className="bg-background-card rounded-xl p-4 border border-border-secondary"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-text-primary">
                  {month.month}
                </h3>
                {(() => {
                  const monthInfo = availableMonths.find(
                    (m) => m.name === month.month
                  );
                  return monthInfo?.createdAt ? (
                    <span className="text-xs text-text-tertiary">
                      {new Date(monthInfo.createdAt).toLocaleDateString()}
                    </span>
                  ) : null;
                })()}
              </div>
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
                            className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
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
      <div className="bg-background-card rounded-xl p-6 border border-border-secondary">
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Category Trends
        </h3>
        <div className="space-y-4">
          {trends.slice(0, 10).map((trend) => (
            <div
              key={trend.category}
              className="flex items-center justify-between p-4 bg-background-secondary/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getTrendIcon(trend.trend)}
                <span className="text-text-primary font-medium">
                  {trend.category}
                </span>
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

      {/* Combined Plotly Chart for All Trends */}
      <div className="bg-background-card rounded-xl p-6 border border-border-secondary">
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Spending Trends Over Time
        </h3>

        {/* Combined Interactive Chart */}
        <div className="h-96 bg-background-secondary rounded-lg p-4 mb-6">
          <Plot
            data={trends.slice(0, 5).map((trend, index) => {
              // Get selected months and sort by creation date (oldest to newest for chronological order)
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

              // Use theme category colors
              const colors = theme.categories;

              return {
                x: months.map((month) => month.name),
                y: months.map((month) => trend.monthlyAmounts[month.name] || 0),
                type: "scatter",
                mode: "lines+markers",
                name: trend.category,
                line: {
                  color: colors[index % colors.length],
                  width: 3,
                  shape: "spline",
                },
                marker: {
                  color: colors[index % colors.length],
                  size: 6,
                  line: {
                    color: colors[index % colors.length],
                    width: 1,
                  },
                },
              };
            })}
            layout={{
              title: {
                text: "Spending Trends Across Selected Months",
                font: { color: theme.text.primary },
              },
              xaxis: {
                title: "Month",
                color: theme.text.secondary,
                gridcolor: isLightTheme
                  ? theme.border.secondary
                  : theme.border.primary,
                showgrid: true,
              },
              yaxis: {
                title: "Amount ($)",
                color: theme.text.secondary,
                gridcolor: isLightTheme
                  ? theme.border.secondary
                  : theme.border.primary,
                showgrid: true,
                tickformat: "$,.0f",
              },
              plot_bgcolor: "rgba(0,0,0,0)",
              paper_bgcolor: "rgba(0,0,0,0)",
              font: { color: theme.text.tertiary },
              margin: { t: 50, b: 50, l: 80, r: 20 },
              hovermode: "closest",
              legend: {
                x: 0,
                y: 1,
                bgcolor: "rgba(0,0,0,0)",
                bordercolor: "rgba(0,0,0,0)",
                font: { color: theme.text.primary },
              },
            }}
            config={{
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
              responsive: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="space-y-6">
          {trends.slice(0, 5).map((trend) => {
            // Use only the selected months for the line chart, sorted chronologically
            const selectedMonthData = availableMonths.filter((month) =>
              selectedMonths.includes(month.key)
            );
            const months = selectedMonthData.sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return (
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
                );
              }
              return a.name.localeCompare(b.name);
            });

            return (
              <div key={trend.category} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-primary font-medium">
                    {trend.category}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-text-tertiary">
                      Total:{" "}
                      {formatCurrency(
                        Object.values(trend.monthlyAmounts).reduce(
                          (sum, amount) => sum + amount,
                          0
                        )
                      )}
                    </span>
                    <span className="text-text-tertiary">
                      Avg:{" "}
                      {formatCurrency(
                        Object.values(trend.monthlyAmounts).reduce(
                          (sum, amount) => sum + amount,
                          0
                        ) / Object.values(trend.monthlyAmounts).length
                      )}
                    </span>
                  </div>
                </div>

                {/* Plotly Line Chart */}
                <div className="h-80 bg-background-secondary rounded-lg p-4">
                  <Plot
                    data={[
                      {
                        x: months.map((month) => month.name),
                        y: months.map(
                          (month) => trend.monthlyAmounts[month.name] || 0
                        ),
                        type: "scatter",
                        mode: "lines+markers",
                        name: trend.category,
                        line: {
                          color: theme.primary[500],
                          width: 3,
                          shape: "spline",
                        },
                        marker: {
                          color: theme.secondary[500],
                          size: 8,
                          line: {
                            color: theme.primary[500],
                            width: 2,
                          },
                        },
                        fill: "tonexty",
                        fillcolor: `${theme.primary[500]}1A`,
                      },
                    ]}
                    layout={{
                      title: {
                        text: `Spending Trend: ${trend.category}`,
                        font: { color: theme.text.primary },
                      },
                      xaxis: {
                        title: "Month",
                        color: theme.text.secondary,
                        gridcolor: isLightTheme
                          ? theme.border.secondary
                          : theme.border.primary,
                        showgrid: true,
                      },
                      yaxis: {
                        title: "Amount ($)",
                        color: theme.text.secondary,
                        gridcolor: isLightTheme
                          ? theme.border.secondary
                          : theme.border.primary,
                        showgrid: true,
                        tickformat: "$,.0f",
                      },
                      plot_bgcolor: "rgba(0,0,0,0)",
                      paper_bgcolor: "rgba(0,0,0,0)",
                      font: { color: theme.text.tertiary },
                      margin: { t: 40, b: 40, l: 60, r: 20 },
                      hovermode: "closest",
                      showlegend: false,
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
                      responsive: true,
                    }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>

                {/* Monthly amounts - only show selected months */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {months.map((month) => {
                    const amount = trend.monthlyAmounts[month.name] || 0;
                    return (
                      <div
                        key={month.name}
                        className="bg-background-secondary/30 rounded p-2 text-center"
                      >
                        <div className="text-text-secondary font-medium">
                          {month.name}
                        </div>
                        <div className="text-text-tertiary">
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpendingTrendsComponent;
