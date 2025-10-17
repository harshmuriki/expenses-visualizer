"use client";

import React from "react";
import {
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiZap,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { SpendingInsight, SpendingPrediction } from "@/lib/aiAnalytics";
import { useTheme } from "@/lib/theme-context";

interface InsightsPanelProps {
  insights: SpendingInsight[];
  predictions?: SpendingPrediction[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  predictions,
}) => {
  const { themeName } = useTheme();
  const isLightTheme = themeName === 'cherryBlossom' || themeName === 'nordic';

  const getIcon = (type: SpendingInsight["type"]) => {
    switch (type) {
      case "warning":
        return <FiAlertTriangle className="h-5 w-5" />;
      case "info":
        return <FiInfo className="h-5 w-5" />;
      case "success":
        return <FiCheckCircle className="h-5 w-5" />;
      case "tip":
        return <FiZap className="h-5 w-5" />;
      default:
        return <FiInfo className="h-5 w-5" />;
    }
  };

  const getColorClasses = (type: SpendingInsight["type"]) => {
    // Use dark text for light themes
    const textColor = isLightTheme ? "text-text-primary" : "";

    switch (type) {
      case "warning":
        return `border-amber-500/40 bg-amber-500/10 ${isLightTheme ? "text-amber-900" : "text-amber-200"}`;
      case "info":
        return `border-secondary-500/40 bg-secondary-500/10 ${isLightTheme ? "text-secondary-900" : "text-secondary-200"}`;
      case "success":
        return `border-accent-500/40 bg-accent-500/10 ${isLightTheme ? "text-accent-900" : "text-accent-200"}`;
      case "tip":
        return `border-primary-500/40 bg-primary-500/10 ${isLightTheme ? "text-primary-900" : "text-primary-200"}`;
      default:
        return `border-border-secondary/40 bg-slate-500/10 ${textColor || "text-text-primary"}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <section className="rounded-2xl border border-border-secondary bg-background-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <FiZap className="h-5 w-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${getColorClasses(
                  insight.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(insight.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="mt-1 text-sm opacity-90">
                      {insight.description}
                    </p>
                    {insight.amount && (
                      <p className="mt-2 text-xs font-mono opacity-75">
                        Amount: ${insight.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border-secondary/60 bg-background-secondary/50 p-6 text-center">
            <FiInfo className="mx-auto mb-2 h-8 w-8 text-text-tertiary" />
            <p className="text-sm text-text-tertiary">
              No insights available yet. Upload more transaction data to get
              personalized recommendations.
            </p>
          </div>
        )}
      </section>

      {/* Predictions Section */}
      {predictions && predictions.length > 0 && (
        <section className="rounded-2xl border border-border-secondary bg-background-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <FiTrendingUp className="h-5 w-5 text-secondary-500" />
            <h3 className="text-lg font-semibold text-text-primary">
              Spending Predictions
            </h3>
          </div>

          <div className="space-y-3">
            {predictions.slice(0, 5).map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-border-secondary/60 bg-background-secondary/50 p-4"
              >
                <div className="flex items-center gap-3">
                  {prediction.trend === "increasing" ? (
                    <FiTrendingUp className="h-5 w-5 text-red-500" />
                  ) : prediction.trend === "decreasing" ? (
                    <FiTrendingDown className="h-5 w-5 text-accent-500" />
                  ) : (
                    <div className="h-5 w-5 text-text-tertiary">→</div>
                  )}
                  <div>
                    <p className="font-medium text-text-primary">
                      {prediction.category}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {prediction.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">
                    ${prediction.predictedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs capitalize text-text-tertiary">
                    {prediction.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-background-secondary/50 p-3">
            <p className="text-xs text-text-tertiary">
              💡 Predictions are based on your current spending patterns and
              historical trends. Actual spending may vary.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default InsightsPanel;
