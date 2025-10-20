import { SankeyNode } from "@/app/types/types";

export interface RecurringTransaction {
  id: string;
  name: string;
  transactions: SankeyNode[];
  averageAmount: number;
  frequency: "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly";
  frequencyDays: number;
  confidence: number; // 0-1 score
  nextExpectedDate?: Date;
}

interface TransactionWithCategory extends SankeyNode {
  category?: string;
}

/**
 * Calculate the similarity between two strings (0-1)
 * Uses a simple character-based comparison
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }

  // Calculate Levenshtein-inspired similarity
  const longer = s1.length > s2.length ? s1 : s2;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(s1, s2);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate the difference in days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine the frequency based on average days between transactions
 */
function determineFrequency(
  avgDays: number
): "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly" {
  if (avgDays >= 5 && avgDays <= 9) return "weekly";
  if (avgDays >= 12 && avgDays <= 16) return "bi-weekly";
  if (avgDays >= 28 && avgDays <= 33) return "monthly";
  if (avgDays >= 85 && avgDays <= 95) return "quarterly";
  if (avgDays >= 350 && avgDays <= 380) return "yearly";
  return "monthly"; // default
}

/**
 * Calculate confidence score for recurring pattern
 * Based on consistency of intervals and amount similarity
 */
function calculateConfidence(
  intervalVariance: number,
  amountVariance: number,
  transactionCount: number
): number {
  // More transactions = higher confidence
  const countScore = Math.min(transactionCount / 6, 1);

  // Lower variance = higher confidence
  const intervalScore = Math.max(0, 1 - intervalVariance / 10);
  const amountScore = Math.max(0, 1 - amountVariance / 50);

  // Weighted average
  return countScore * 0.3 + intervalScore * 0.4 + amountScore * 0.3;
}

/**
 * Detect recurring transactions from a list of transactions
 */
export function detectRecurringTransactions(
  transactions: TransactionWithCategory[]
): RecurringTransaction[] {
  const recurringGroups: RecurringTransaction[] = [];

  // Filter transactions with valid dates and amounts
  const validTransactions = transactions.filter(
    (t) => t.date && t.cost && t.cost > 0
  );

  // Sort by date
  validTransactions.sort(
    (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
  );

  // Track which transactions have been grouped
  const grouped = new Set<number>();

  // For each transaction, find similar transactions
  for (let i = 0; i < validTransactions.length; i++) {
    if (grouped.has(i)) continue;

    const transaction = validTransactions[i];
    const similarTransactions: SankeyNode[] = [transaction];
    grouped.add(i);

    // Find similar transactions
    for (let j = i + 1; j < validTransactions.length; j++) {
      if (grouped.has(j)) continue;

      const other = validTransactions[j];

      // Check name similarity
      const nameSimilarity = calculateStringSimilarity(
        transaction.name || "",
        other.name || ""
      );

      // Check amount similarity (within 10%)
      const amountDiff =
        Math.abs((transaction.cost || 0) - (other.cost || 0)) /
        (transaction.cost || 1);

      // If name is very similar and amount is close
      if (nameSimilarity >= 0.7 && amountDiff <= 0.1) {
        similarTransactions.push(other);
        grouped.add(j);
      }
    }

    // Only consider as recurring if there are at least 3 occurrences
    if (similarTransactions.length >= 3) {
      // Calculate intervals between transactions
      const intervals: number[] = [];
      for (let k = 1; k < similarTransactions.length; k++) {
        const date1 = new Date(similarTransactions[k - 1].date!);
        const date2 = new Date(similarTransactions[k].date!);
        intervals.push(daysBetween(date1, date2));
      }

      // Calculate average interval
      const avgInterval =
        intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

      // Calculate variance in intervals
      const intervalVariance =
        intervals.reduce((sum, val) => sum + Math.abs(val - avgInterval), 0) /
        intervals.length;

      // Calculate average amount
      const avgAmount =
        similarTransactions.reduce((sum, t) => sum + (t.cost || 0), 0) /
        similarTransactions.length;

      // Calculate variance in amounts
      const amountVariance =
        similarTransactions.reduce(
          (sum, t) => sum + Math.abs((t.cost || 0) - avgAmount),
          0
        ) / similarTransactions.length;

      // Only include if intervals are somewhat consistent (variance < 15 days)
      if (intervalVariance < 15) {
        const frequency = determineFrequency(avgInterval);
        const confidence = calculateConfidence(
          intervalVariance,
          (amountVariance / avgAmount) * 100,
          similarTransactions.length
        );

        // Calculate next expected date
        const lastDate = new Date(
          similarTransactions[similarTransactions.length - 1].date!
        );
        const nextExpectedDate = new Date(lastDate);
        nextExpectedDate.setDate(lastDate.getDate() + Math.round(avgInterval));

        recurringGroups.push({
          id: `recurring-${i}`,
          name: transaction.name || "Unknown",
          transactions: similarTransactions,
          averageAmount: avgAmount,
          frequency,
          frequencyDays: Math.round(avgInterval),
          confidence,
          nextExpectedDate,
        });
      }
    }
  }

  // Sort by confidence (highest first)
  return recurringGroups.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get the recurring transaction info for a specific transaction
 */
export function getRecurringInfo(
  transaction: SankeyNode,
  recurringTransactions: RecurringTransaction[]
): RecurringTransaction | null {
  for (const recurring of recurringTransactions) {
    if (
      recurring.transactions.some((t) => t.index === transaction.index)
    ) {
      return recurring;
    }
  }
  return null;
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: string): string {
  const map: Record<string, string> = {
    weekly: "Weekly",
    "bi-weekly": "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };
  return map[frequency] || frequency;
}

/**
 * Calculate total annual cost for a recurring transaction
 */
export function calculateAnnualCost(recurring: RecurringTransaction): number {
  const periodsPerYear = 365 / recurring.frequencyDays;
  return recurring.averageAmount * periodsPerYear;
}
