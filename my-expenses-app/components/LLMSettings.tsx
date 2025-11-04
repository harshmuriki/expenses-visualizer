"use client";

import React, { useState, useEffect } from "react";
import {
  LLMConfig,
  LLMProviderType,
  LLMProviderFactory,
} from "@/lib/llmProvider";

interface LLMSettingsProps {
  onSave?: (config: LLMConfig) => void;
  onClose?: () => void;
}

export const LLMSettings: React.FC<LLMSettingsProps> = ({
  onSave,
  onClose,
}) => {
  const [provider, setProvider] = useState<LLMProviderType>("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(16000);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load saved config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("llm_config");
    if (saved) {
      try {
        const config = JSON.parse(saved) as LLMConfig;
        setProvider(config.provider);
        setApiKey(config.apiKey || "");
        setBaseUrl(config.baseUrl || "");
        setModel(config.model);
        setTemperature(config.temperature || 0.2);
        setMaxTokens(config.maxTokens || 16000);
      } catch (e) {
        console.error("Failed to load LLM config:", e);
      }
    }
  }, []);

  // Set default values when provider changes
  useEffect(() => {
    switch (provider) {
      case "openai":
        setModel(model || "gpt-4o-mini");
        setBaseUrl("");
        setMaxTokens(16000);
        break;
      case "ollama":
        setModel(model || "llama3.2");
        setBaseUrl(baseUrl || "http://localhost:11434");
        setApiKey("");
        setMaxTokens(16000);
        break;
      case "lmstudio":
        setModel(model || "local-model");
        setBaseUrl(baseUrl || "http://localhost:1234/v1");
        setApiKey("");
        setMaxTokens(16000);
        break;
      case "anthropic":
        setModel(model || "claude-3-5-sonnet-20241022");
        setBaseUrl("");
        setMaxTokens(4096);
        break;
      case "custom":
        setModel(model || "default");
        setMaxTokens(16000);
        break;
    }
  }, [provider]);

  const buildConfig = (): LLMConfig => {
    const base = {
      provider,
      model,
      temperature,
      maxTokens,
    };

    switch (provider) {
      case "openai":
        return { ...base, provider: "openai", apiKey } as LLMConfig;
      case "ollama":
        return { ...base, provider: "ollama", baseUrl } as LLMConfig;
      case "lmstudio":
        return { ...base, provider: "lmstudio", baseUrl } as LLMConfig;
      case "anthropic":
        return { ...base, provider: "anthropic", apiKey } as LLMConfig;
      case "custom":
        return {
          ...base,
          provider: "custom",
          baseUrl,
          apiKey: apiKey || undefined,
        } as LLMConfig;
      default:
        throw new Error("Invalid provider");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const config = buildConfig();
      const provider = LLMProviderFactory.create(config);
      const success = await provider.testConnection();

      setTestResult({
        success,
        message: success
          ? "✅ Connection successful!"
          : "❌ Connection failed. Check your settings.",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const config = buildConfig();
    localStorage.setItem("llm_config", JSON.stringify(config));
    if (onSave) {
      onSave(config);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="llm-settings">
      <style jsx>{`
        .llm-settings {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin: 0 0 24px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        select,
        input[type="text"],
        input[type="number"] {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        select:focus,
        input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .info-text {
          margin-top: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-test {
          background: #10b981;
          color: white;
        }

        .btn-test:hover {
          background: #059669;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-result {
          margin-top: 12px;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .test-result.success {
          background: #d1fae5;
          color: #065f46;
        }

        .test-result.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .provider-info {
          margin-top: 24px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 13px;
          color: #4b5563;
        }

        .provider-info h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .provider-info ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .provider-info li {
          margin: 4px 0;
        }
      `}</style>

      <h2>LLM Provider Settings</h2>

      <div className="form-group">
        <label>Provider</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value as LLMProviderType)}>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama (Local)</option>
          <option value="lmstudio">LM Studio (Local)</option>
          <option value="anthropic">Anthropic Claude</option>
          <option value="custom">Custom (OpenAI-compatible)</option>
        </select>
      </div>

      {(provider === "openai" || provider === "anthropic") && (
        <div className="form-group">
          <label>API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
          <div className="info-text">
            {provider === "openai"
              ? "Get your API key from platform.openai.com"
              : "Get your API key from console.anthropic.com"}
          </div>
        </div>
      )}

      {(provider === "ollama" ||
        provider === "lmstudio" ||
        provider === "custom") && (
        <div className="form-group">
          <label>Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={
              provider === "ollama"
                ? "http://localhost:11434"
                : provider === "lmstudio"
                  ? "http://localhost:1234/v1"
                  : "https://your-api.com/v1"
            }
          />
          <div className="info-text">
            {provider === "ollama" && "Default: http://localhost:11434"}
            {provider === "lmstudio" && "Default: http://localhost:1234/v1"}
            {provider === "custom" && "Your custom API endpoint"}
          </div>
        </div>
      )}

      {provider === "custom" && (
        <div className="form-group">
          <label>API Key (Optional)</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Optional API key"
          />
        </div>
      )}

      <div className="form-group">
        <label>Model</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={
            provider === "openai"
              ? "gpt-4o-mini"
              : provider === "ollama"
                ? "llama3.2"
                : provider === "anthropic"
                  ? "claude-3-5-sonnet-20241022"
                  : "model-name"
          }
        />
        <div className="info-text">
          {provider === "openai" && "Examples: gpt-4o-mini, gpt-4, gpt-3.5-turbo"}
          {provider === "ollama" &&
            "Examples: llama3.2, mistral, codellama, gemma2"}
          {provider === "anthropic" &&
            "Examples: claude-3-5-sonnet-20241022, claude-3-haiku-20240307"}
        </div>
      </div>

      <div className="form-group">
        <label>Temperature ({temperature})</label>
        <input
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
        />
        <div className="info-text">
          Lower = more deterministic, Higher = more creative (0-2)
        </div>
      </div>

      <div className="form-group">
        <label>Max Tokens</label>
        <input
          type="number"
          min="100"
          max="100000"
          step="100"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
        />
        <div className="info-text">Maximum tokens for model response</div>
      </div>

      {testResult && (
        <div className={`test-result ${testResult.success ? "success" : "error"}`}>
          {testResult.message}
        </div>
      )}

      <div className="button-group">
        <button
          className="btn-test"
          onClick={handleTest}
          disabled={testing}
        >
          {testing ? "Testing..." : "Test Connection"}
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>

      <div className="provider-info">
        <h3>About {provider === "openai" ? "OpenAI" : provider === "ollama" ? "Ollama" : provider === "lmstudio" ? "LM Studio" : provider === "anthropic" ? "Anthropic" : "Custom Provider"}</h3>
        {provider === "openai" && (
          <>
            <p>OpenAI provides cloud-based AI models.</p>
            <ul>
              <li>Requires API key and internet connection</li>
              <li>Costs money per token used</li>
              <li>gpt-4o-mini: $0.15/1M input, $0.60/1M output tokens</li>
            </ul>
          </>
        )}
        {provider === "ollama" && (
          <>
            <p>
              Ollama runs AI models locally on your machine.
            </p>
            <ul>
              <li>Free and private - no data sent to external servers</li>
              <li>Requires Ollama installed: ollama.com</li>
              <li>Download models: <code>ollama pull llama3.2</code></li>
            </ul>
          </>
        )}
        {provider === "lmstudio" && (
          <>
            <p>LM Studio runs AI models locally with a user-friendly interface.</p>
            <ul>
              <li>Free and private - no data sent to external servers</li>
              <li>Requires LM Studio installed: lmstudio.ai</li>
              <li>Enable local server in LM Studio settings</li>
            </ul>
          </>
        )}
        {provider === "anthropic" && (
          <>
            <p>Anthropic Claude provides powerful AI models.</p>
            <ul>
              <li>Requires API key and internet connection</li>
              <li>Costs money per token used</li>
              <li>Claude 3.5 Sonnet: $3/1M input, $15/1M output tokens</li>
            </ul>
          </>
        )}
        {provider === "custom" && (
          <>
            <p>Connect to any OpenAI-compatible API endpoint.</p>
            <ul>
              <li>Works with various providers and self-hosted models</li>
              <li>Requires OpenAI-compatible API format</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Get current LLM config from localStorage or default
 */
export function getLLMConfig(): LLMConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem("llm_config");
  if (saved) {
    try {
      return JSON.parse(saved) as LLMConfig;
    } catch (e) {
      console.error("Failed to parse LLM config:", e);
    }
  }

  return null;
}

/**
 * Save LLM config to localStorage
 */
export function saveLLMConfig(config: LLMConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("llm_config", JSON.stringify(config));
  }
}
