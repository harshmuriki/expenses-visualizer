import axios, { AxiosResponse } from "axios";
import { OpenAICompletionResponse, EnvConfig } from "@/app/types/types";
import {
  LLMProviderFactory,
  ILLMProvider,
  JSONSchema as LLMJSONSchema,
  TokenUsage as LLMTokenUsage,
} from "./llmProvider";

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
 * Get or create LLM provider instance
 */
let cachedProvider: ILLMProvider | null = null;

export function getProvider(): ILLMProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  // Try to create from environment variables
  try {
    cachedProvider = LLMProviderFactory.createFromEnv();
    return cachedProvider;
  } catch (error) {
    console.error("Failed to create LLM provider from env:", error);
    throw error;
  }
}

/**
 * Set a custom provider (for testing or runtime configuration)
 */
export function setProvider(provider: ILLMProvider) {
  cachedProvider = provider;
}

/**
 * Optimized OpenAI request with structured output
 * Now supports multiple LLM providers through abstraction layer
 */
export async function callOpenAIWithSchema(
  prompt: string,
  schema: JSONSchema,
  options?: {
    temperature?: number;
    maxTokens?: number;
    provider?: ILLMProvider;
  }
): Promise<{ response: OpenAICompletionResponse; usage: TokenUsage }> {
  const provider = options?.provider || getProvider();

  const llmSchema: LLMJSONSchema = schema as unknown as LLMJSONSchema;

  const result = await provider.completeWithSchema(
    prompt,
    llmSchema,
    "You are a financial transaction categorization assistant. Extract transaction details accurately and consistently."
  );

  const usage: TokenUsage = {
    promptTokens: result.usage?.promptTokens || 0,
    completionTokens: result.usage?.completionTokens || 0,
    totalTokens: result.usage?.totalTokens || 0,
    estimatedCost: result.usage?.estimatedCost || 0,
  };

  // Parse the content as OpenAI response format
  let response: OpenAICompletionResponse;

  try {
    const content = result.content;
    const parsed = JSON.parse(content);

    // Construct OpenAI-compatible response
    response = {
      id: "local-" + Date.now(),
      object: "chat.completion",
      created: Date.now(),
      model: provider.config.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: content,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.totalTokens,
      },
    };
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    throw new Error("Invalid response from LLM provider");
  }

  return { response, usage };
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
