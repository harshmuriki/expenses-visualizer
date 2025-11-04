export interface InputModalProps {
  clickedNode: SankeyNode;
  initialParentName: string;
  initialPrice: string;
  onSubmit: (
    newParentName: string,
    newPrice: number,
    newTransactionName?: string
  ) => void;
  onClose: () => void;
  onDelete?: () => void;
  parentOptions: string[];
}

export interface Payload {
  name: string;
  value?: number;
  cost?: number;
}

export interface SankeyNode {
  isleaf?: boolean;
  name: string;
  cost?: number;
  index: number;
  visible: boolean;
  value?: number;
  date?: string;
  location?: string;
  bank?: string;
  raw_str?: string;
  newTransactionName?: string;
  originalName?: string; // Track the original name from Firebase for deletion
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
  strokeWidth?: number;
}

export type Map = Record<number, number[]>;

export interface MyCustomNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: Payload;
  containerWidth?: number;
  onNodeClick: (nodeId: string, event?: React.MouseEvent<SVGElement>) => void; // New click handler
  allNodes: SankeyNode[];
  fixViz?: boolean;
  links?: SankeyLink[]; // Add this prop to allow access to links for edge width
}

export interface SnakeyChartComponentProps {
  refresh: boolean; // Prop to trigger data fetch
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface UploadComponentProps {
  onUploadSuccess: () => void; // Callback function to trigger data fetch
  useremail: string;
}

export interface AggregatorTransaction {
  transaction_id?: string;
  account_id?: string;
  name?: string;
  amount?: number;
  iso_currency_code?: string;
  date?: string;
  pending?: boolean;
  category?: string[];
  merchant_name?: string | null;
}

/**
 * Interface that represents the environment variables you rely on.
 * For safety, check if the variable is present before usage.
 */
export interface EnvConfig {
  OPENAI_KEY?: string;
}

/**
 * Represents a row of CSV data.
 * Many times CSV rows are free-form, so we can make this a generic
 * "string-to-string" mapping or refine it if you know the CSV columns.
 */
export interface CSVRow {
  [key: string]: string;
}

/**
 * The structure returned by the OpenAI completion endpoint.
 * This is simplified; you can expand if you need more fields.
 */
export interface OpenAIChoiceMessage {
  message: {
    content: string;
  };
}

export interface OpenAICompletionResponse {
  data: {
    choices: OpenAIChoiceMessage[];
  };
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Represents the shape of each node in the output JSON.
 * For instance, a node has at least a 'name', 'index' (and possibly 'cost').
 */
export interface OutputNode {
  name: string;
  index: number;
  cost?: number;
  date?: string;
  location?: string;
  bank?: string;
  raw_str?: string;
}

/**
 * The final hierarchical data returned by Document.convertData().
 */
export interface HierarchicalData {
  output: {
    nodes: OutputNode[];
  };
  parentChildMap: Record<number, number[]>;
}

// Define the type for the results array
export interface ResultType {
  // Replace 'key1', 'key2', etc., with actual keys and their types
  key1: string;
  key2: number;
  // Add other keys as needed
}

// ============================================
// TIER 1 PREMIUM FEATURES - TYPE DEFINITIONS
// ============================================

// 1. BUDGET TRACKING
export interface Budget {
  id: string;
  userId: string;
  month: string; // e.g., "nov-2024"
  category: string;
  limit: number;
  spent: number;
  rollover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  userId: string;
  category: string;
  threshold: number; // percentage (e.g., 80, 90, 100)
  triggered: boolean;
  triggeredAt?: string;
}

// 2. SAVINGS GOALS
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string
  category: string; // e.g., "vacation", "emergency", "car"
  priority: "low" | "medium" | "high";
  linkedAccountId?: string;
  color: string; // hex color for visualization
  icon?: string; // emoji or icon name
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string;
  note?: string;
  automatic: boolean;
}

// 3. BILL TRACKING & REMINDERS
export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: number; // day of month (1-31)
  category: string;
  recurring: boolean;
  frequency: "monthly" | "quarterly" | "yearly" | "weekly" | "biweekly";
  autoDetected: boolean;
  linkedTransactionPattern?: string; // merchant name pattern
  status: "pending" | "paid" | "overdue";
  lastPaidDate?: string;
  nextDueDate: string;
  reminderDays: number; // days before due date to remind
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillPayment {
  id: string;
  billId: string;
  userId: string;
  amount: number;
  paidDate: string;
  transactionId?: string; // link to actual transaction
  note?: string;
}

// 4. SUBSCRIPTION TRACKING
export interface Subscription {
  id: string;
  userId: string;
  name: string;
  merchant: string;
  amount: number;
  billingCycle: "monthly" | "yearly" | "quarterly" | "weekly";
  nextBillingDate: string;
  category: string;
  autoDetected: boolean;
  linkedTransactionPattern?: string;
  status: "active" | "cancelled" | "paused";
  cancelUrl?: string;
  reminderEnabled: boolean;
  lastChargeDate?: string;
  annualCost: number; // calculated
  firstDetectedDate: string;
  cancellationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAlert {
  id: string;
  subscriptionId: string;
  userId: string;
  type: "price_increase" | "upcoming_renewal" | "unused" | "cancelled";
  message: string;
  oldAmount?: number;
  newAmount?: number;
  createdAt: string;
  read: boolean;
}

// 5. NET WORTH TRACKING
export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: "checking" | "savings" | "investment" | "property" | "vehicle" | "crypto" | "other";
  currentValue: number;
  institution?: string;
  accountNumber?: string; // last 4 digits
  linkedPlaidAccount?: boolean;
  plaidAccountId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  userId: string;
  name: string;
  type: "credit_card" | "student_loan" | "auto_loan" | "mortgage" | "personal_loan" | "other";
  currentBalance: number;
  interestRate?: number;
  minimumPayment?: number;
  institution?: string;
  accountNumber?: string; // last 4 digits
  linkedPlaidAccount?: boolean;
  plaidAccountId?: string;
  dueDate?: number; // day of month
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshot {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: Record<string, number>; // type -> amount
  liabilityBreakdown: Record<string, number>; // type -> amount
  createdAt: string;
}

// SHARED TYPES
export interface PremiumFeatureState {
  budgets: Budget[];
  goals: SavingsGoal[];
  bills: Bill[];
  subscriptions: Subscription[];
  assets: Asset[];
  liabilities: Liability[];
  netWorthHistory: NetWorthSnapshot[];
}

// Analytics for dashboard
export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  categoriesOverBudget: number;
  categoriesUnderBudget: number;
  percentageUsed: number;
}

export interface GoalsSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  percentageComplete: number;
}

export interface BillsSummary {
  totalBills: number;
  upcomingBills: number;
  overdueBills: number;
  paidThisMonth: number;
  totalMonthlyBills: number;
}

export interface SubscriptionsSummary {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyTotal: number;
  annualTotal: number;
  unusedSubscriptions: number;
}

export interface NetWorthSummary {
  currentNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyChange: number;
  monthlyChangePercentage: number;
  yearlyChange: number;
  yearlyChangePercentage: number;
}
