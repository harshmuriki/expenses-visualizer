import { SankeyNode, SankeyData } from "@/app/types/types";

/**
 * Comprehensive data context for chatbot
 */
export interface ChatbotContext {
  summary: string;
  detailedData: string;
  categories: CategorySummary[];
  transactions: TransactionDetail[];
  insights: string[];
  metadata: {
    totalTransactions: number;
    totalSpend: number;
    dateRange: string;
    month: string;
  };
}

export interface CategorySummary {
  name: string;
  total: number;
  percentage: number;
  transactionCount: number;
  avgTransaction: number;
  minTransaction: number;
  maxTransaction: number;
}

export interface TransactionDetail {
  name: string;
  amount: number;
  category: string;
  date?: string;
  location?: string;
  bank?: string;
}

/**
 * Generate comprehensive context for the chatbot
 * This ensures the chatbot has complete, accurate data and doesn't hallucinate
 */
export function generateChatbotContext(
  data: SankeyData,
  month: string
): ChatbotContext {
  const { nodes, links } = data;

  // Extract all leaf transactions (actual transactions, not categories)
  const leafTransactions = nodes.filter((n) => n.isleaf);

  // Calculate total spend
  const totalSpend = leafTransactions.reduce(
    (sum, t) => sum + (t.cost || 0),
    0
  );

  // Extract categories (nodes that are children of root but not leaves)
  const categoryNodes = nodes.filter(
    (n) => !n.isleaf && n.index !== 0 // Exclude root node
  );

  // Build category summaries
  const categories: CategorySummary[] = categoryNodes.map((categoryNode) => {
    // Find all transactions in this category
    const categoryTransactions = leafTransactions.filter((t) => {
      // Find the link connecting this transaction to its parent
      const link = links.find((l) => l.target === t.index);
      return link && link.source === categoryNode.index;
    });

    const categoryTotal = categoryTransactions.reduce(
      (sum, t) => sum + (t.cost || 0),
      0
    );
    const transactionCount = categoryTransactions.length;
    const amounts = categoryTransactions.map((t) => t.cost || 0);

    return {
      name: categoryNode.name,
      total: categoryTotal,
      percentage: totalSpend > 0 ? (categoryTotal / totalSpend) * 100 : 0,
      transactionCount,
      avgTransaction:
        transactionCount > 0 ? categoryTotal / transactionCount : 0,
      minTransaction: amounts.length > 0 ? Math.min(...amounts) : 0,
      maxTransaction: amounts.length > 0 ? Math.max(...amounts) : 0,
    };
  });

  // Sort categories by total spending
  categories.sort((a, b) => b.total - a.total);

  // Build detailed transaction list
  const transactions: TransactionDetail[] = leafTransactions.map((t) => {
    // Find the category for this transaction
    const link = links.find((l) => l.target === t.index);
    const category = link
      ? nodes.find((n) => n.index === link.source)?.name || "Unknown"
      : "Unknown";

    return {
      name: t.name,
      amount: t.cost || 0,
      category,
      date: t.date || undefined,
      location: t.location || undefined,
      bank: t.file_source || undefined,
    };
  });

  // Sort transactions by amount (highest first)
  transactions.sort((a, b) => b.amount - a.amount);

  // Generate insights
  const insights = generateInsights(categories, transactions, totalSpend);

  // Extract date range
  const dates = transactions
    .filter((t) => t.date)
    .map((t) => new Date(t.date!))
    .sort((a, b) => a.getTime() - b.getTime());
  const dateRange =
    dates.length > 0
      ? `${dates[0].toLocaleDateString()} to ${dates[dates.length - 1].toLocaleDateString()}`
      : "Unknown";

  // Build summary text
  const summary = buildSummary(
    categories,
    totalSpend,
    transactions.length,
    month
  );

  // Build detailed data text
  const detailedData = buildDetailedData(categories, transactions);

  return {
    summary,
    detailedData,
    categories,
    transactions,
    insights,
    metadata: {
      totalTransactions: transactions.length,
      totalSpend,
      dateRange,
      month,
    },
  };
}

/**
 * Build a concise summary of the data
 */
function buildSummary(
  categories: CategorySummary[],
  totalSpend: number,
  transactionCount: number,
  month: string
): string {
  const topCategories = categories.slice(0, 5);

  let summary = `SPENDING SUMMARY FOR ${month.toUpperCase()}\n\n`;
  summary += `Total Spend: $${totalSpend.toFixed(2)}\n`;
  summary += `Total Transactions: ${transactionCount}\n`;
  summary += `Average Transaction: $${(totalSpend / transactionCount).toFixed(2)}\n\n`;

  summary += `TOP SPENDING CATEGORIES:\n`;
  topCategories.forEach((cat, i) => {
    summary += `${i + 1}. ${cat.name}: $${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%) - ${cat.transactionCount} transactions\n`;
  });

  return summary;
}

/**
 * Build detailed data text with all categories and transactions
 */
function buildDetailedData(
  categories: CategorySummary[],
  transactions: TransactionDetail[]
): string {
  let data = `COMPLETE SPENDING BREAKDOWN\n\n`;

  // Category breakdown
  data += `ALL CATEGORIES (${categories.length} total):\n`;
  categories.forEach((cat) => {
    data += `\n${cat.name}:\n`;
    data += `  Total: $${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%)\n`;
    data += `  Transactions: ${cat.transactionCount}\n`;
    data += `  Average: $${cat.avgTransaction.toFixed(2)}\n`;
    data += `  Range: $${cat.minTransaction.toFixed(2)} - $${cat.maxTransaction.toFixed(2)}\n`;
  });

  // Group transactions by category for detailed view
  data += `\n\nALL TRANSACTIONS BY CATEGORY:\n`;
  categories.forEach((cat) => {
    const catTransactions = transactions.filter((t) => t.category === cat.name);
    if (catTransactions.length > 0) {
      data += `\n${cat.name} (${catTransactions.length} transactions):\n`;
      catTransactions.forEach((t) => {
        data += `  - ${t.name}: $${t.amount.toFixed(2)}`;
        if (t.date) data += ` on ${t.date}`;
        if (t.location) data += ` at ${t.location}`;
        if (t.bank) data += ` [${t.bank}]`;
        data += `\n`;
      });
    }
  });

  return data;
}

/**
 * Generate insights from the data
 */
function generateInsights(
  categories: CategorySummary[],
  transactions: TransactionDetail[],
  totalSpend: number
): string[] {
  const insights: string[] = [];

  // Top spending category
  if (categories.length > 0) {
    const top = categories[0];
    insights.push(
      `Your highest spending category is ${top.name} with $${top.total.toFixed(2)} (${top.percentage.toFixed(1)}% of total spending)`
    );
  }

  // Large transactions
  const largeTransactions = transactions.filter((t) => t.amount > 100);
  if (largeTransactions.length > 0) {
    insights.push(
      `You have ${largeTransactions.length} transactions over $100, totaling $${largeTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`
    );
  }

  // Small transactions
  const smallTransactions = transactions.filter((t) => t.amount < 10);
  if (smallTransactions.length > 5) {
    insights.push(
      `You have ${smallTransactions.length} small transactions (under $10), totaling $${smallTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`
    );
  }

  // Category with most transactions
  const mostTransactions = categories.reduce((max, cat) =>
    cat.transactionCount > max.transactionCount ? cat : max
  );
  if (mostTransactions) {
    insights.push(
      `${mostTransactions.name} has the most transactions (${mostTransactions.transactionCount})`
    );
  }

  // Average transaction size
  const avgTransaction = totalSpend / transactions.length;
  insights.push(`Your average transaction size is $${avgTransaction.toFixed(2)}`);

  // Category diversity
  insights.push(
    `Your spending is spread across ${categories.length} different categories`
  );

  return insights;
}

/**
 * Format context for AI prompt
 * This creates a comprehensive, structured prompt that prevents hallucination
 */
export function formatContextForAI(context: ChatbotContext): string {
  let prompt = `You are an AI financial assistant with access to the user's complete transaction data for ${context.metadata.month}.\n\n`;

  prompt += `CRITICAL INSTRUCTIONS:\n`;
  prompt += `1. ONLY use information from the data provided below\n`;
  prompt += `2. If asked about something not in the data, say "I don't have that information"\n`;
  prompt += `3. DO NOT make assumptions or estimates beyond the data\n`;
  prompt += `4. Be precise with numbers - use exact amounts from the data\n`;
  prompt += `5. When giving totals, always verify against the provided totals\n\n`;

  prompt += `METADATA:\n`;
  prompt += `- Month: ${context.metadata.month}\n`;
  prompt += `- Total Transactions: ${context.metadata.totalTransactions}\n`;
  prompt += `- Total Spend: $${context.metadata.totalSpend.toFixed(2)}\n`;
  prompt += `- Date Range: ${context.metadata.dateRange}\n\n`;

  prompt += `${context.summary}\n\n`;

  prompt += `INSIGHTS:\n`;
  context.insights.forEach((insight, i) => {
    prompt += `${i + 1}. ${insight}\n`;
  });
  prompt += `\n`;

  prompt += `${context.detailedData}\n\n`;

  prompt += `AVAILABLE QUERY TYPES:\n`;
  prompt += `- Category totals and breakdowns\n`;
  prompt += `- Specific transaction searches\n`;
  prompt += `- Spending comparisons\n`;
  prompt += `- Date-based queries\n`;
  prompt += `- Location-based queries\n`;
  prompt += `- Bank/source queries\n`;
  prompt += `- Statistical analysis (averages, totals, percentages)\n\n`;

  prompt += `Remember: Only answer based on the data above. If the user asks about something not in this data, politely explain that you don't have that information.\n`;

  return prompt;
}

/**
 * Create a search index for fast transaction lookup
 */
export function createTransactionIndex(context: ChatbotContext): Map<string, TransactionDetail[]> {
  const index = new Map<string, TransactionDetail[]>();

  context.transactions.forEach((transaction) => {
    // Index by name
    const nameLower = transaction.name.toLowerCase();
    if (!index.has(nameLower)) {
      index.set(nameLower, []);
    }
    index.get(nameLower)!.push(transaction);

    // Index by category
    const categoryLower = transaction.category.toLowerCase();
    if (!index.has(categoryLower)) {
      index.set(categoryLower, []);
    }
    index.get(categoryLower)!.push(transaction);

    // Index by location if available
    if (transaction.location) {
      const locationLower = transaction.location.toLowerCase();
      if (!index.has(locationLower)) {
        index.set(locationLower, []);
      }
      index.get(locationLower)!.push(transaction);
    }
  });

  return index;
}
