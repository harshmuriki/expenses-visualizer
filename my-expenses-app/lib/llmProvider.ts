import axios, { AxiosResponse } from "axios";
import { OpenAICompletionResponse } from "@/app/types/types";

/**
 * Supported LLM Provider Types
 */
export type LLMProviderType =
  | "openai"
  | "ollama"
  | "lmstudio"
  | "anthropic"
  | "custom";

/**
 * Base configuration for all LLM providers
 */
export interface BaseLLMConfig {
  provider: LLMProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * OpenAI Configuration
 */
export interface OpenAIConfig extends BaseLLMConfig {
  provider: "openai";
  apiKey: string;
  model: string; // e.g., "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"
}

/**
 * Ollama Configuration (local, no API key needed)
 */
export interface OllamaConfig extends BaseLLMConfig {
  provider: "ollama";
  baseUrl: string; // e.g., "http://localhost:11434"
  model: string; // e.g., "llama3.2", "mistral", "codellama"
}

/**
 * LM Studio Configuration (OpenAI-compatible)
 */
export interface LMStudioConfig extends BaseLLMConfig {
  provider: "lmstudio";
  baseUrl: string; // e.g., "http://localhost:1234/v1"
  model: string; // e.g., "local-model"
}

/**
 * Anthropic Claude Configuration
 */
export interface AnthropicConfig extends BaseLLMConfig {
  provider: "anthropic";
  apiKey: string;
  model: string; // e.g., "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"
}

/**
 * Custom OpenAI-compatible Configuration
 */
export interface CustomConfig extends BaseLLMConfig {
  provider: "custom";
  apiKey?: string;
  baseUrl: string; // Custom endpoint
  model: string;
}

/**
 * Union type of all configurations
 */
export type LLMConfig =
  | OpenAIConfig
  | OllamaConfig
  | LMStudioConfig
  | AnthropicConfig
  | CustomConfig;

/**
 * Token usage information
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

/**
 * LLM Response (normalized across all providers)
 */
export interface LLMResponse {
  content: string;
  usage?: TokenUsage;
  rawResponse?: unknown;
}

/**
 * JSON Schema for structured outputs
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
 * Abstract LLM Provider Interface
 */
export interface ILLMProvider {
  readonly config: LLMConfig;

  /**
   * Make a completion request
   */
  complete(prompt: string, systemPrompt?: string): Promise<LLMResponse>;

  /**
   * Make a completion request with structured output (JSON schema)
   */
  completeWithSchema(
    prompt: string,
    schema: JSONSchema,
    systemPrompt?: string
  ): Promise<LLMResponse>;

  /**
   * Calculate cost for this provider
   */
  calculateCost(usage: TokenUsage): number;

  /**
   * Test connection to provider
   */
  testConnection(): Promise<boolean>;
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider implements ILLMProvider {
  constructor(public readonly config: OpenAIConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const response: AxiosResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful assistant.",
          },
          { role: "user", content: prompt },
        ],
        temperature: this.config.temperature ?? 0.2,
        max_tokens: this.config.maxTokens ?? 16000,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data as OpenAICompletionResponse;
    const usage: TokenUsage = {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      estimatedCost: 0,
    };
    usage.estimatedCost = this.calculateCost(usage);

    return {
      content: data.choices[0]?.message?.content || "",
      usage,
      rawResponse: data,
    };
  }

  async completeWithSchema(
    prompt: string,
    schema: JSONSchema,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    const response: AxiosResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: this.config.model,
        messages: [
          {
            role: "system",
            content:
              systemPrompt ||
              "You are a financial transaction categorization assistant. Extract transaction details accurately and consistently.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: schema,
        },
        temperature: this.config.temperature ?? 0.2,
        max_tokens: this.config.maxTokens ?? 16000,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data as OpenAICompletionResponse;
    const usage: TokenUsage = {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      estimatedCost: 0,
    };
    usage.estimatedCost = this.calculateCost(usage);

    return {
      content: data.choices[0]?.message?.content || "",
      usage,
      rawResponse: data,
    };
  }

  calculateCost(usage: TokenUsage): number {
    // GPT-4o-mini pricing
    const INPUT_COST = 0.15 / 1_000_000; // $0.15 per 1M tokens
    const OUTPUT_COST = 0.6 / 1_000_000; // $0.60 per 1M tokens
    return (
      usage.promptTokens * INPUT_COST + usage.completionTokens * OUTPUT_COST
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.complete("Hello", "Respond with 'OK'");
      return true;
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      return false;
    }
  }
}

/**
 * Ollama Provider Implementation
 */
export class OllamaProvider implements ILLMProvider {
  constructor(public readonly config: OllamaConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const response: AxiosResponse = await axios.post(
      `${this.config.baseUrl}/api/chat`,
      {
        model: this.config.model,
        messages: [
          ...(systemPrompt
            ? [{ role: "system", content: systemPrompt }]
            : []),
          { role: "user", content: prompt },
        ],
        stream: false,
        options: {
          temperature: this.config.temperature ?? 0.2,
          num_predict: this.config.maxTokens ?? 16000,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      content: response.data.message?.content || "",
      rawResponse: response.data,
    };
  }

  async completeWithSchema(
    prompt: string,
    schema: JSONSchema,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    // Ollama doesn't have native structured output support
    // So we add JSON schema to the prompt
    const enhancedPrompt = `${prompt}

You MUST respond with valid JSON that matches this exact schema:
${JSON.stringify(schema.schema, null, 2)}

Respond ONLY with the JSON object, no additional text.`;

    return this.complete(enhancedPrompt, systemPrompt);
  }

  calculateCost(usage: TokenUsage): number {
    // Local model - no cost
    void usage; // Suppress unused parameter warning
    return 0;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error("Ollama connection test failed:", error);
      return false;
    }
  }
}

/**
 * LM Studio Provider Implementation (OpenAI-compatible)
 */
export class LMStudioProvider implements ILLMProvider {
  constructor(public readonly config: LMStudioConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const response: AxiosResponse = await axios.post(
      `${this.config.baseUrl}/chat/completions`,
      {
        model: this.config.model,
        messages: [
          ...(systemPrompt
            ? [{ role: "system", content: systemPrompt }]
            : []),
          { role: "user", content: prompt },
        ],
        temperature: this.config.temperature ?? 0.2,
        max_tokens: this.config.maxTokens ?? 16000,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      content: response.data.choices[0]?.message?.content || "",
      rawResponse: response.data,
    };
  }

  async completeWithSchema(
    prompt: string,
    schema: JSONSchema,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    // LM Studio supports OpenAI-compatible structured outputs (depending on version)
    // Try with response_format first, fall back to prompt engineering
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: systemPrompt || "You are a helpful assistant.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: this.config.temperature ?? 0.2,
          max_tokens: this.config.maxTokens ?? 16000,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        content: response.data.choices[0]?.message?.content || "",
        rawResponse: response.data,
      };
    } catch {
      // Fall back to prompt engineering
      const enhancedPrompt = `${prompt}

You MUST respond with valid JSON that matches this exact schema:
${JSON.stringify(schema.schema, null, 2)}

Respond ONLY with the JSON object, no additional text.`;

      return this.complete(enhancedPrompt, systemPrompt);
    }
  }

  calculateCost(usage: TokenUsage): number {
    // Local model - no cost
    void usage; // Suppress unused parameter warning
    return 0;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/models`);
      return response.status === 200;
    } catch (error) {
      console.error("LM Studio connection test failed:", error);
      return false;
    }
  }
}

/**
 * Anthropic Claude Provider Implementation
 */
export class AnthropicProvider implements ILLMProvider {
  constructor(public readonly config: AnthropicConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const response: AxiosResponse = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: this.config.model,
        max_tokens: this.config.maxTokens ?? 4096,
        temperature: this.config.temperature ?? 0.2,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    const usage: TokenUsage = {
      promptTokens: response.data.usage?.input_tokens || 0,
      completionTokens: response.data.usage?.output_tokens || 0,
      totalTokens:
        (response.data.usage?.input_tokens || 0) +
        (response.data.usage?.output_tokens || 0),
      estimatedCost: 0,
    };
    usage.estimatedCost = this.calculateCost(usage);

    return {
      content: response.data.content[0]?.text || "",
      usage,
      rawResponse: response.data,
    };
  }

  async completeWithSchema(
    prompt: string,
    schema: JSONSchema,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    // Anthropic doesn't have native structured output yet
    // Use prompt engineering
    const enhancedPrompt = `${prompt}

You MUST respond with valid JSON that matches this exact schema:
${JSON.stringify(schema.schema, null, 2)}

Respond ONLY with the JSON object, no additional text.`;

    return this.complete(enhancedPrompt, systemPrompt);
  }

  calculateCost(usage: TokenUsage): number {
    // Claude 3.5 Sonnet pricing (adjust for other models as needed)
    const INPUT_COST = 3.0 / 1_000_000; // $3.00 per 1M tokens
    const OUTPUT_COST = 15.0 / 1_000_000; // $15.00 per 1M tokens
    return (
      usage.promptTokens * INPUT_COST + usage.completionTokens * OUTPUT_COST
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.complete("Hello", "Respond with 'OK'");
      return true;
    } catch (error) {
      console.error("Anthropic connection test failed:", error);
      return false;
    }
  }
}

/**
 * Custom OpenAI-compatible Provider Implementation
 */
export class CustomProvider implements ILLMProvider {
  constructor(public readonly config: CustomConfig) {}

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    const response: AxiosResponse = await axios.post(
      `${this.config.baseUrl}/chat/completions`,
      {
        model: this.config.model,
        messages: [
          ...(systemPrompt
            ? [{ role: "system", content: systemPrompt }]
            : []),
          { role: "user", content: prompt },
        ],
        temperature: this.config.temperature ?? 0.2,
        max_tokens: this.config.maxTokens ?? 16000,
      },
      { headers }
    );

    return {
      content: response.data.choices[0]?.message?.content || "",
      rawResponse: response.data,
    };
  }

  async completeWithSchema(
    prompt: string,
    schema: JSONSchema,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    const enhancedPrompt = `${prompt}

You MUST respond with valid JSON that matches this exact schema:
${JSON.stringify(schema.schema, null, 2)}

Respond ONLY with the JSON object, no additional text.`;

    return this.complete(enhancedPrompt, systemPrompt);
  }

  calculateCost(): number {
    // Unknown pricing - return 0
    return 0;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.complete("Hello", "Respond with 'OK'");
      return true;
    } catch (error) {
      console.error("Custom provider connection test failed:", error);
      return false;
    }
  }
}

/**
 * Provider Factory
 */
export class LLMProviderFactory {
  static create(config: LLMConfig): ILLMProvider {
    switch (config.provider) {
      case "openai":
        return new OpenAIProvider(config);
      case "ollama":
        return new OllamaProvider(config);
      case "lmstudio":
        return new LMStudioProvider(config);
      case "anthropic":
        return new AnthropicProvider(config);
      case "custom":
        return new CustomProvider(config);
      default:
        throw new Error(`Unsupported provider: ${(config as LLMConfig).provider}`);
    }
  }

  /**
   * Create provider from environment variables
   */
  static createFromEnv(): ILLMProvider {
    const providerType = (process.env.LLM_PROVIDER || "openai") as LLMProviderType;

    switch (providerType) {
      case "openai": {
        const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing OPENAI_KEY environment variable");
        }
        return new OpenAIProvider({
          provider: "openai",
          apiKey,
          model: process.env.LLM_MODEL || "gpt-4o-mini",
          temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.2"),
          maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "16000", 10),
        });
      }

      case "ollama":
        return new OllamaProvider({
          provider: "ollama",
          baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          model: process.env.LLM_MODEL || "llama3.2",
          temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.2"),
          maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "16000", 10),
        });

      case "lmstudio":
        return new LMStudioProvider({
          provider: "lmstudio",
          baseUrl: process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1",
          model: process.env.LLM_MODEL || "local-model",
          temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.2"),
          maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "16000", 10),
        });

      case "anthropic": {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error("Missing ANTHROPIC_API_KEY environment variable");
        }
        return new AnthropicProvider({
          provider: "anthropic",
          apiKey,
          model: process.env.LLM_MODEL || "claude-3-5-sonnet-20241022",
          temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.2"),
          maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "4096", 10),
        });
      }

      case "custom": {
        const baseUrl = process.env.CUSTOM_LLM_BASE_URL;
        if (!baseUrl) {
          throw new Error("Missing CUSTOM_LLM_BASE_URL environment variable");
        }
        return new CustomProvider({
          provider: "custom",
          baseUrl,
          apiKey: process.env.CUSTOM_LLM_API_KEY,
          model: process.env.LLM_MODEL || "default",
          temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.2"),
          maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "16000", 10),
        });
      }

      default:
        throw new Error(`Unsupported LLM_PROVIDER: ${providerType}`);
    }
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

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
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    throw error;
  }
}
