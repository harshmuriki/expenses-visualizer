/**
 * AI Analytics Utility Functions
 * Provides data analysis and insights generation for expense data
 */

import { SankeyNode, SankeyLink } from "@/app/types/types";

export interface SpendingInsight {
  type: "warning" | "info" | "success" | "tip";
  title: string;
  description: string;
  amount?: number;
  category?: string;
}

export interface CategoryAnalysis {
  name: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  color: string;
}

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
}

/**
 * Analyzes spending patterns and generates AI-powered insights
 */
export function generateSpendingInsights(
  nodes: SankeyNode[],
  links: SankeyLink[]
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];

  // Calculate total spending
  const totalSpend = links
    .filter((link) => link.source === 0)
    .reduce((sum, link) => sum + link.value, 0);

  // Find top spending category
  const categorySpending = links
    .filter((link) => link.source === 0)
    .map((link) => ({
      categoryNode: nodes.find((n) => n.index === link.target),
      amount: link.value,
    }))
    .filter((item) => item.categoryNode)
    .sort((a, b) => b.amount - a.amount);

  if (categorySpending.length > 0 && categorySpending[0].categoryNode) {
    const topCategory = categorySpending[0];
    const percentage = (topCategory.amount / totalSpend) * 100;

    if (percentage > 40) {
      insights.push({
        type: "warning",
        title: `High spending in ${topCategory.categoryNode.name}`,
        description: `${
          topCategory.categoryNode.name
        } accounts for ${percentage.toFixed(
          1
        )}% of your total spending. Consider reviewing these expenses.`,
        amount: topCategory.amount,
        category: topCategory.categoryNode.name,
      });
    }
  }

  // Detect unusual transactions (outliers)
  const leafNodes = nodes.filter((node) => node.isleaf && node.cost);
  if (leafNodes.length > 0) {
    const costs = leafNodes.map((n) => n.cost || 0);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    const highCostThreshold = avgCost * 3;

    const unusualTransactions = leafNodes.filter(
      (node) => (node.cost || 0) > highCostThreshold
    );

    if (unusualTransactions.length > 0) {
      const highestTransaction = unusualTransactions.reduce((prev, current) =>
        (prev.cost || 0) > (current.cost || 0) ? prev : current
      );

      insights.push({
        type: "info",
        title: "Unusual transaction detected",
        description: `${
          highestTransaction.name
        } ($${highestTransaction.cost?.toFixed(
          2
        )}) is significantly higher than your average transaction of $${avgCost.toFixed(
          2
        )}.`,
        amount: highestTransaction.cost,
      });
    }
  }

  // Small transactions optimization
  const smallTransactions = leafNodes.filter((node) => (node.cost || 0) < 10);
  if (smallTransactions.length > 5) {
    const totalSmall = smallTransactions.reduce(
      (sum, node) => sum + (node.cost || 0),
      0
    );
    insights.push({
      type: "tip",
      title: "Many small transactions",
      description: `You have ${
        smallTransactions.length
      } transactions under $10, totaling $${totalSmall.toFixed(
        2
      )}. These add up!`,
      amount: totalSmall,
    });
  }

  // Positive feedback for good spending
  if (categorySpending.length > 0) {
    const diversityScore = categorySpending.length;
    if (diversityScore >= 5) {
      insights.push({
        type: "success",
        title: "Well-diversified spending",
        description: `Your expenses are spread across ${diversityScore} categories, showing balanced financial activity.`,
      });
    }
  }

  return insights;
}

/**
 * Analyzes category-level spending patterns
 */
export function analyzeCategorySpending(
  nodes: SankeyNode[],
  links: SankeyLink[],
  colors: string[]
): CategoryAnalysis[] {
  const totalSpend = links
    .filter((link) => link.source === 0)
    .reduce((sum, link) => sum + link.value, 0);

  return links
    .filter((link) => link.source === 0)
    .map((link) => {
      const categoryNode = nodes.find((node) => node.index === link.target);
      const percentage = totalSpend > 0 ? (link.value / totalSpend) * 100 : 0;

      return {
        name: categoryNode?.name || `Category ${link.target}`,
        amount: link.value,
        percentage,
        trend: "stable" as const, // Would need historical data for real trends
        color: colors[link.target % colors.length] || "#4fd1c5",
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Predicts future spending based on current patterns
 */
export function predictSpending(
  nodes: SankeyNode[],
  links: SankeyLink[]
): SpendingPrediction[] {
  // This is a simple prediction based on current spending
  // In a real app, you'd use historical data and ML models

  const categorySpending = links
    .filter((link) => link.source === 0)
    .map((link) => {
      const categoryNode = nodes.find((n) => n.index === link.target);
      return {
        category: categoryNode?.name || `Category ${link.target}`,
        currentAmount: link.value,
      };
    });

  return categorySpending.map((item) => {
    // Simple prediction: current spending +/- 10% random variance
    const variance = (Math.random() - 0.5) * 0.2; // -10% to +10%
    const predictedAmount = item.currentAmount * (1 + variance);
    const trend =
      variance > 0.05
        ? "increasing"
        : variance < -0.05
        ? "decreasing"
        : "stable";

    return {
      category: item.category,
      predictedAmount,
      confidence: 75 + Math.random() * 15, // 75-90% confidence
      trend,
    };
  });
}

/**
 * Generates a summary text for AI assistant context
 */
export function generateDataSummary(
  nodes: SankeyNode[],
  links: SankeyLink[]
): string {
  const totalSpend = links
    .filter((link) => link.source === 0)
    .reduce((sum, link) => sum + link.value, 0);

  const categories = links
    .filter((link) => link.source === 0)
    .map((link) => {
      const node = nodes.find((n) => n.index === link.target);
      return {
        name: node?.name || "Unknown",
        amount: link.value,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const transactionCount = nodes.filter((n) => n.isleaf).length;

  let summary = `Financial Summary:\n`;
  summary += `Total Spending: $${totalSpend.toFixed(2)}\n`;
  summary += `Total Transactions: ${transactionCount}\n`;
  summary += `Number of Categories: ${categories.length}\n\n`;
  summary += `Spending by Category:\n`;

  categories.forEach((cat, idx) => {
    const percentage = (cat.amount / totalSpend) * 100;
    summary += `${idx + 1}. ${cat.name}: $${cat.amount.toFixed(
      2
    )} (${percentage.toFixed(1)}%)\n`;
  });

  return summary;
}

/**
 * Detects spending anomalies
 */
export function detectAnomalies(nodes: SankeyNode[]): SankeyNode[] {
  const leafNodes = nodes.filter((node) => node.isleaf && node.cost);
  if (leafNodes.length === 0) return [];

  const costs = leafNodes.map((n) => n.cost || 0);
  const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
  const variance =
    costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) /
    costs.length;
  const stdDev = Math.sqrt(variance);

  // Anomalies are transactions more than 2 standard deviations from mean
  const threshold = mean + 2 * stdDev;

  return leafNodes.filter((node) => (node.cost || 0) > threshold);
}
