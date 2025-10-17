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
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
            console.log("📋 All months found:");
            monthsArray.forEach((month: string, index: number) => {
              console.log(`  ${index + 1}. "${month}"`);
            });

            // Check each month collection for transaction data
            console.log(
              "🔍 Checking each month collection for transaction data..."
            );

            for (const monthName of monthsArray) {
              try {
                const monthCollectionRef = collection(userDocRef, monthName);
                const snapshot = await getDocs(monthCollectionRef);

                if (snapshot.docs.length > 0) {
                  console.log(
                    `📁 Found collection: "${monthName}" with ${snapshot.docs.length} documents`
                  );

                  // Check if this collection has transaction data
                  const hasTransactions = snapshot.docs.some(
                    (doc) => doc.id !== "parentChildMap" && doc.id !== "meta"
                  );

                  if (hasTransactions) {
                    console.log(
                      `✅ Collection "${monthName}" has transaction data`
                    );

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
                    } catch (metaError) {
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
        monthCollections.forEach((col, index) => {
          console.log(`  ${index + 1}. "${col.name}"`);
        });
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

    const months = await discoverAvailableMonths();
    setAvailableMonths(months);
    setShowMonthSelector(true);
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

  if (showMonthSelector) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600/30">
          <h3 className="text-xl font-semibold text-white mb-4">
            Select Months to Analyze
          </h3>
          <p className="text-slate-400 mb-4">
            Choose which months you'd like to include in your spending trends
            analysis.
          </p>

          {availableMonths.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 text-lg mb-2">📊</div>
              <p className="text-slate-400">No transaction data found</p>
              <p className="text-slate-500 text-sm">
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
                        ? "bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] border-[#80A1BA] text-white"
                        : "bg-slate-800/50 border-slate-600 hover:border-slate-500 text-slate-300"
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
                      className="w-4 h-4 text-[#80A1BA] bg-slate-700 border-slate-600 rounded focus:ring-[#80A1BA] focus:ring-2"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{month.name}</span>
                      {month.createdAt && (
                        <span className="text-xs text-slate-400">
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
              <p className="text-slate-400">
                {selectedMonths.length} month
                {selectedMonths.length !== 1 ? "s" : ""} selected
              </p>
              <button
                onClick={() => {
                  setShowMonthSelector(false);
                  fetchSpendingData();
                }}
                className="px-6 py-2 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] hover:from-[#6B8BA4] hover:to-[#7AAFAD] text-white rounded-lg font-semibold shadow-lg transform hover:scale-105 transition duration-300"
              >
                Analyze Trends
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-slate-900/50 rounded-xl border border-slate-600/30">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-[#80A1BA] rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading spending trends...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-slate-900/50 rounded-xl border border-slate-600/30">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchSpendingData}
            className="mt-2 px-4 py-2 bg-[#80A1BA] text-white rounded-lg hover:bg-[#6B8BA4] transition"
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
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FiCalendar className="text-[#80A1BA]" />
          <span>Spending Trends</span>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowMonthSelector(true)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            Change Months
          </button>
          <button
            onClick={fetchSpendingData}
            className="px-4 py-2 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white rounded-lg hover:from-[#6B8BA4] hover:to-[#7AAFAD] transition"
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
              className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/30"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {month.month}
                </h3>
                {(() => {
                  const monthInfo = availableMonths.find(
                    (m) => m.name === month.month
                  );
                  return monthInfo?.createdAt ? (
                    <span className="text-xs text-slate-400">
                      {new Date(monthInfo.createdAt).toLocaleDateString()}
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Spending</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(month.totalSpending)}
                  </span>
                </div>
                <div className="space-y-1">
                  {month.categories.slice(0, 3).map((category) => (
                    <div
                      key={category.category}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-slate-300 truncate">
                        {category.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">
                          {formatCurrency(category.amount)}
                        </span>
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] h-1.5 rounded-full"
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
      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600/30">
        <h3 className="text-xl font-semibold text-white mb-4">
          Category Trends
        </h3>
        <div className="space-y-4">
          {trends.slice(0, 10).map((trend) => (
            <div
              key={trend.category}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getTrendIcon(trend.trend)}
                <span className="text-white font-medium">{trend.category}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-slate-400">Latest Month</div>
                  <div className="text-white font-semibold">
                    {formatCurrency(
                      Object.values(trend.monthlyAmounts).slice(-1)[0] || 0
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Change</div>
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
      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600/30">
        <h3 className="text-xl font-semibold text-white mb-4">
          Spending Trends Over Time
        </h3>

        {/* Combined Interactive Chart */}
        <div className="h-96 bg-slate-800/30 rounded-lg p-4 mb-6">
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

              const colors = [
                "#80A1BA",
                "#91C4C3",
                "#B4DEBD",
                "#F7B2AD",
                "#D4A5A5",
              ];

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
              title: "Spending Trends Across Selected Months",
              xaxis: {
                title: "Month",
                color: "#94a3b8",
                gridcolor: "#374151",
                showgrid: true,
              },
              yaxis: {
                title: "Amount ($)",
                color: "#94a3b8",
                gridcolor: "#374151",
                showgrid: true,
                tickformat: "$,.0f",
              },
              plot_bgcolor: "rgba(0,0,0,0)",
              paper_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#94a3b8" },
              margin: { t: 50, b: 50, l: 80, r: 20 },
              hovermode: "closest",
              legend: {
                x: 0,
                y: 1,
                bgcolor: "rgba(0,0,0,0)",
                bordercolor: "rgba(0,0,0,0)",
                font: { color: "#ffffff" },
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
            const maxAmount = Math.max(...Object.values(trend.monthlyAmounts));
            const minAmount = Math.min(...Object.values(trend.monthlyAmounts));
            const range = maxAmount - minAmount;

            return (
              <div key={trend.category} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">
                    {trend.category}
                  </span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-400">
                      Total:{" "}
                      {formatCurrency(
                        Object.values(trend.monthlyAmounts).reduce(
                          (sum, amount) => sum + amount,
                          0
                        )
                      )}
                    </span>
                    <span className="text-slate-400">
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
                <div className="h-80 bg-slate-800/30 rounded-lg p-4">
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
                          color: "#80A1BA",
                          width: 3,
                          shape: "spline",
                        },
                        marker: {
                          color: "#91C4C3",
                          size: 8,
                          line: {
                            color: "#80A1BA",
                            width: 2,
                          },
                        },
                        fill: "tonexty",
                        fillcolor: "rgba(128, 161, 186, 0.1)",
                      },
                    ]}
                    layout={{
                      title: `Spending Trend: ${trend.category}`,
                      xaxis: {
                        title: "Month",
                        color: "#94a3b8",
                        gridcolor: "#374151",
                        showgrid: true,
                      },
                      yaxis: {
                        title: "Amount ($)",
                        color: "#94a3b8",
                        gridcolor: "#374151",
                        showgrid: true,
                        tickformat: "$,.0f",
                      },
                      plot_bgcolor: "rgba(0,0,0,0)",
                      paper_bgcolor: "rgba(0,0,0,0)",
                      font: { color: "#94a3b8" },
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
                        className="bg-slate-800/30 rounded p-2 text-center"
                      >
                        <div className="text-slate-300 font-medium">
                          {month.name}
                        </div>
                        <div className="text-slate-400">
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
