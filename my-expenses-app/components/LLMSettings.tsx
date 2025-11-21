"use client";

import React, { useState, useEffect } from "react";
import {
  LLMConfig,
  LLMProviderType,
  LLMProviderFactory,
} from "@/lib/llmProvider";
import { useTheme } from "@/lib/theme-context";
import { FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

interface LLMSettingsProps {
  onSave?: (config: LLMConfig) => void;
  onClose?: () => void;
}

export const LLMSettings: React.FC<LLMSettingsProps> = ({
  onSave,
  onClose,
}) => {
  const { theme, themeName, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"llm" | "theme">("theme");
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

  const themes = [
    {
      name: "materialLight",
      label: "Material Light",
      description: "Tonal surfaces with violet highlights",
      colors: ["#6750a4", "#67a991", "#403954"],
    },
    {
      name: "materialDark",
      label: "Material Dark",
      description: "Rich contrast with softly glowing accents",
      colors: ["#d0bcff", "#4f776c", "#181420"],
    },
    {
      name: "materialDynamic",
      label: "Material Dynamic",
      description: "Wallpaper-inspired green and amber",
      colors: ["#3d9f55", "#f1a02e", "#3e90f5"],
    },
  ];

  const InputField = ({ label, type = "text", value, onChange, placeholder, info }: any) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg transition focus:outline-none focus:ring-2"
        style={{
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.primary,
          color: theme.text.primary,
          border: `1px solid ${theme.border.primary}`
        }}
      />
      {info && (
        <p className="text-xs" style={{ color: theme.text.tertiary }}>
          {info}
        </p>
      )}
    </div>
  );

  return (
    <div
      className="rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
      style={{
        backgroundColor: theme.background.card,
        border: `1px solid ${theme.border.secondary}`
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.secondary
        }}
      >
        <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
          Settings
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition hover:opacity-70"
          style={{ color: theme.text.secondary }}
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: theme.border.secondary }}
      >
        <button
          onClick={() => setActiveTab("theme")}
          className={`flex-1 px-6 py-3 font-medium transition ${
            activeTab === "theme" ? "border-b-2" : ""
          }`}
          style={{
            color: activeTab === "theme" ? theme.primary[500] : theme.text.secondary,
            borderColor: activeTab === "theme" ? theme.primary[500] : "transparent",
          }}
        >
          Theme
        </button>
        <button
          onClick={() => setActiveTab("llm")}
          className={`flex-1 px-6 py-3 font-medium transition ${
            activeTab === "llm" ? "border-b-2" : ""
          }`}
          style={{
            color: activeTab === "llm" ? theme.primary[500] : theme.text.secondary,
            borderColor: activeTab === "llm" ? theme.primary[500] : "transparent",
          }}
        >
          LLM Provider
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {activeTab === "theme" ? (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Choose your preferred color theme for the application
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name as any)}
                  className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    themeName === t.name ? "ring-2" : ""
                  }`}
                  style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: themeName === t.name ? theme.primary[500] : theme.border.primary,
                    ringColor: theme.primary[500]
                  }}
                >
                  {themeName === t.name && (
                    <div
                      className="absolute top-2 right-2 rounded-full p-1"
                      style={{ backgroundColor: theme.primary[500] }}
                    >
                      <FiCheck className="text-white" size={16} />
                    </div>
                  )}
                  <div className="flex gap-2 mb-3">
                    {t.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-lg"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold text-left" style={{ color: theme.text.primary }}>
                    {t.label}
                  </h3>
                  <p className="text-xs text-left mt-1" style={{ color: theme.text.tertiary }}>
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
                Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LLMProviderType)}
                className="w-full px-4 py-2.5 rounded-lg transition focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.primary,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.primary}`
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="lmstudio">LM Studio (Local)</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="custom">Custom (OpenAI-compatible)</option>
              </select>
            </div>

            {(provider === "openai" || provider === "anthropic") && (
              <InputField
                label="API Key"
                value={apiKey}
                onChange={(e: any) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                info={
                  provider === "openai"
                    ? "Get your API key from platform.openai.com"
                    : "Get your API key from console.anthropic.com"
                }
              />
            )}

            {(provider === "ollama" || provider === "lmstudio" || provider === "custom") && (
              <InputField
                label="Base URL"
                value={baseUrl}
                onChange={(e: any) => setBaseUrl(e.target.value)}
                placeholder={
                  provider === "ollama"
                    ? "http://localhost:11434"
                    : provider === "lmstudio"
                    ? "http://localhost:1234/v1"
                    : "https://your-api.com/v1"
                }
                info={
                  provider === "ollama"
                    ? "Default: http://localhost:11434"
                    : provider === "lmstudio"
                    ? "Default: http://localhost:1234/v1"
                    : "Your custom API endpoint"
                }
              />
            )}

            {provider === "custom" && (
              <InputField
                label="API Key (Optional)"
                value={apiKey}
                onChange={(e: any) => setApiKey(e.target.value)}
                placeholder="Optional API key"
              />
            )}

            <InputField
              label="Model"
              value={model}
              onChange={(e: any) => setModel(e.target.value)}
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

            <InputField
              label={`Temperature (${temperature})`}
              type="number"
              value={temperature}
              onChange={(e: any) => setTemperature(parseFloat(e.target.value))}
              info="Lower = more deterministic, Higher = more creative (0-2)"
            />

            <InputField
              label="Max Tokens"
              type="number"
              value={maxTokens}
              onChange={(e: any) => setMaxTokens(parseInt(e.target.value, 10))}
              info="Maximum tokens for model response"
            />

            {testResult && (
              <div
                className={`p-4 rounded-lg flex items-center gap-2 ${
                  testResult.success ? "bg-green-500/10" : "bg-red-500/10"
                }`}
                style={{
                  color: testResult.success ? "#10b981" : "#ef4444",
                  border: `1px solid ${testResult.success ? "#10b98133" : "#ef444433"}`
                }}
              >
                {testResult.success ? <FiCheck size={20} /> : <FiAlertCircle size={20} />}
                <span className="text-sm font-medium">{testResult.message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#10b981", color: "white" }}
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition hover:opacity-90"
                style={{ backgroundColor: theme.primary[500], color: theme.text.inverse }}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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

export function saveLLMConfig(config: LLMConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("llm_config", JSON.stringify(config));
  }
}
