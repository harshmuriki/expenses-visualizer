import axios, { AxiosResponse } from "axios";
import { OpenAICompletionResponse, EnvConfig } from "@/app/types/types";

/**
 * Configuration for OpenAI processing
 */
export const OPENAI_CONFIG = {
  BATCH_SIZE: 30, // Process 30 transactions per batch (optimal for gpt-4o-mini)
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_TOKENS: 16000, // Increased for larger batches
  TEMPERATURE: 0.2, // Lower for more deterministic extraction
  MAX_PARALLEL_BATCHES: 3, // Process 3 batches in parallel
};

/**
 * Token usage tracker for cost estimation
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * Calculate estimated cost for GPT-4o-mini
 */
export function calculateCost(usage: TokenUsage): number {
  const INPUT_COST = 0.15 / 1_000_000; // $0.15 per 1M tokens
  const OUTPUT_COST = 0.6 / 1_000_000; // $0.60 per 1M tokens
  return (
    usage.promptTokens * INPUT_COST + usage.completionTokens * OUTPUT_COST
  );
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = OPENAI_CONFIG.MAX_RETRIES,
  delay: number = OPENAI_CONFIG.INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    // Check if it's a rate limit error
    const isRateLimit =
      axios.isAxiosError(error) && error.response?.status === 429;
    const isServerError =
      axios.isAxiosError(error) &&
      error.response?.status &&
      error.response.status >= 500;

    if (isRateLimit || isServerError) {
      console.warn(
        `⚠️ API error (${error.response?.status}), retrying in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2); // Exponential backoff
    }

    throw error; // Don't retry for other errors
  }
}

/**
 * Optimized batch processing with chunking and parallel execution
 */
export async function processTransactionBatches<T, R>(
  items: T[],
  processFn: (batch: T[], batchIndex: number) => Promise<R[]>,
  options?: {
    batchSize?: number;
    maxParallel?: number;
    onProgress?: (processed: number, total: number) => void;
  }
): Promise<R[]> {
  const batchSize = options?.batchSize || OPENAI_CONFIG.BATCH_SIZE;
  const maxParallel = options?.maxParallel || OPENAI_CONFIG.MAX_PARALLEL_BATCHES;

  // Split into chunks
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    chunks.push(items.slice(i, i + batchSize));
  }

  console.log(
    `📊 Processing ${items.length} items in ${chunks.length} batches (${batchSize} per batch, ${maxParallel} parallel)`
  );

  const results: R[] = [];
  let processedCount = 0;

  // Process chunks in parallel batches
  for (let i = 0; i < chunks.length; i += maxParallel) {
    const batchGroup = chunks.slice(i, i + maxParallel);

    const batchPromises = batchGroup.map((chunk, localIndex) => {
      const globalIndex = i + localIndex;
      return retryWithBackoff(() => processFn(chunk, globalIndex));
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.flat());

    processedCount += batchGroup.reduce((sum, chunk) => sum + chunk.length, 0);
    if (options?.onProgress) {
      options.onProgress(processedCount, items.length);
    }

    console.log(
      `✅ Processed ${processedCount}/${items.length} items (${Math.round((processedCount / items.length) * 100)}%)`
    );
  }

  return results;
}

/**
 * JSON Schema type for OpenAI structured outputs
 */
export interface JSONSchema {
  name: string;
  strict: boolean;
  schema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties: boolean;
  };
}

/**
 * Optimized OpenAI request with structured output
 */
export async function callOpenAIWithSchema(
  prompt: string,
  schema: JSONSchema,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ response: OpenAICompletionResponse; usage: TokenUsage }> {
  const envConfig: EnvConfig = process.env as unknown as EnvConfig;
  const apiKey = envConfig.OPENAI_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_KEY environment variable");
  }

  const response: AxiosResponse<OpenAICompletionResponse> = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a financial transaction categorization assistant. Extract transaction details accurately and consistently.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: schema,
      },
      temperature: options?.temperature ?? OPENAI_CONFIG.TEMPERATURE,
      max_tokens: options?.maxTokens ?? OPENAI_CONFIG.MAX_TOKENS,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const usage: TokenUsage = {
    promptTokens: response.data.usage?.prompt_tokens || 0,
    completionTokens: response.data.usage?.completion_tokens || 0,
    totalTokens: response.data.usage?.total_tokens || 0,
    estimatedCost: 0,
  };
  usage.estimatedCost = calculateCost(usage);

  return { response: response.data, usage };
}

/**
 * Transaction data structure for batch processing
 */
export interface TransactionData {
  raw_data: Record<string, unknown>;
  index: number;
}

/**
 * Create optimized prompt for batch transaction processing
 * Uses more concise format to reduce token usage
 */
export function createBatchPrompt(
  transactions: TransactionData[],
  parentTags: string[]
): string {
  // Use more compact format to reduce tokens
  const compactTransactions = transactions.map((t, i) => ({
    i, // index
    d: t.raw_data, // data
  }));

  return `Process ${transactions.length} transactions. Extract for each:

Categories (choose one): ${parentTags.join(", ")}

Transactions:
${JSON.stringify(compactTransactions)}

Extract:
- name: concise merchant name
- price: positive number
- date: transaction date
- parenttag: category from list above
- index: from input 'i'
- location: merchant location or "Unknown"
- bank: financial institution from data

Return all ${transactions.length} transactions with required fields.`;
}

/**
 * Progress tracker for large uploads
 */
export class ProcessingProgress {
  private totalItems: number;
  private processedItems: number = 0;
  private startTime: number;
  private totalTokens: number = 0;
  private totalCost: number = 0;

  constructor(totalItems: number) {
    this.totalItems = totalItems;
    this.startTime = Date.now();
  }

  update(itemsProcessed: number, tokens?: TokenUsage) {
    this.processedItems += itemsProcessed;
    if (tokens) {
      this.totalTokens += tokens.totalTokens;
      this.totalCost += tokens.estimatedCost;
    }
  }

  getStats() {
    const elapsedMs = Date.now() - this.startTime;
    const elapsedSec = elapsedMs / 1000;
    const progress = (this.processedItems / this.totalItems) * 100;
    const itemsPerSec = this.processedItems / elapsedSec;
    const estimatedRemainingSec =
      (this.totalItems - this.processedItems) / itemsPerSec;

    return {
      processed: this.processedItems,
      total: this.totalItems,
      progress: Math.round(progress),
      elapsedSeconds: Math.round(elapsedSec),
      estimatedRemainingSeconds: Math.round(estimatedRemainingSec),
      itemsPerSecond: itemsPerSec.toFixed(2),
      totalTokens: this.totalTokens,
      estimatedCost: this.totalCost.toFixed(6),
    };
  }

  log() {
    const stats = this.getStats();
    console.log(
      `📈 Progress: ${stats.processed}/${stats.total} (${stats.progress}%) | ` +
        `⏱️ ${stats.elapsedSeconds}s elapsed | ` +
        `⏳ ~${stats.estimatedRemainingSeconds}s remaining | ` +
        `🚀 ${stats.itemsPerSecond} items/s | ` +
        `💰 $${stats.estimatedCost}`
    );
  }
}
