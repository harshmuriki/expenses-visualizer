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

interface InsightsPanelProps {
  insights: SpendingInsight[];
  predictions?: SpendingPrediction[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  predictions,
}) => {
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
    switch (type) {
      case "warning":
        return "border-amber-500/40 bg-amber-500/10 text-amber-200";
      case "info":
        return "border-[#91C4C3]/40 bg-[#91C4C3]/10 text-[#C8E5E4]";
      case "success":
        return "border-[#B4DEBD]/40 bg-[#B4DEBD]/10 text-[#D9EDDE]";
      case "tip":
        return "border-[#80A1BA]/40 bg-[#80A1BA]/10 text-[#C2D4E0]";
      default:
        return "border-slate-500/40 bg-slate-500/10 text-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <section className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
        <div className="mb-4 flex items-center gap-2">
          <FiZap className="h-5 w-5 text-[#80A1BA]" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
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
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 text-center">
            <FiInfo className="mx-auto mb-2 h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              No insights available yet. Upload more transaction data to get
              personalized recommendations.
            </p>
          </div>
        )}
      </section>

      {/* Predictions Section */}
      {predictions && predictions.length > 0 && (
        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
          <div className="mb-4 flex items-center gap-2">
            <FiTrendingUp className="h-5 w-5 text-[#91C4C3]" />
            <h3 className="text-lg font-semibold text-white">
              Spending Predictions
            </h3>
          </div>

          <div className="space-y-3">
            {predictions.slice(0, 5).map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-800/50 p-4"
              >
                <div className="flex items-center gap-3">
                  {prediction.trend === "increasing" ? (
                    <FiTrendingUp className="h-5 w-5 text-red-400" />
                  ) : prediction.trend === "decreasing" ? (
                    <FiTrendingDown className="h-5 w-5 text-[#B4DEBD]" />
                  ) : (
                    <div className="h-5 w-5 text-slate-400">→</div>
                  )}
                  <div>
                    <p className="font-medium text-slate-200">
                      {prediction.category}
                    </p>
                    <p className="text-xs text-slate-400">
                      {prediction.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    ${prediction.predictedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs capitalize text-slate-400">
                    {prediction.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-slate-800/50 p-3">
            <p className="text-xs text-slate-400">
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
