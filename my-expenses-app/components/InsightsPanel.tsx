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
    switch (type) {
      case "warning":
        return {
          border: "border-amber-500/30",
          bg: "bg-gradient-to-br from-amber-500/10 to-amber-500/5",
          text: isLightTheme ? "text-amber-900" : "text-amber-100",
          icon: "text-amber-500",
          iconBg: "bg-amber-500/15",
        };
      case "info":
        return {
          border: "border-blue-500/30",
          bg: "bg-gradient-to-br from-blue-500/10 to-blue-500/5",
          text: isLightTheme ? "text-blue-900" : "text-blue-100",
          icon: "text-blue-500",
          iconBg: "bg-blue-500/15",
        };
      case "success":
        return {
          border: "border-emerald-500/30",
          bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5",
          text: isLightTheme ? "text-emerald-900" : "text-emerald-100",
          icon: "text-emerald-500",
          iconBg: "bg-emerald-500/15",
        };
      case "tip":
        return {
          border: "border-violet-500/30",
          bg: "bg-gradient-to-br from-violet-500/10 to-violet-500/5",
          text: isLightTheme ? "text-violet-900" : "text-violet-100",
          icon: "text-violet-500",
          iconBg: "bg-violet-500/15",
        };
      default:
        return {
          border: "border-border-secondary/30",
          bg: "bg-gradient-to-br from-slate-500/10 to-slate-500/5",
          text: "text-text-primary",
          icon: "text-text-secondary",
          iconBg: "bg-slate-500/15",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <section className="rounded-2xl border border-border-secondary bg-background-card backdrop-blur-sm p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/15">
            <FiZap className="h-5 w-5 text-primary-500" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">AI Insights</h3>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const colors = getColorClasses(insight.type);
              return (
                <div
                  key={index}
                  className={`group rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 p-2.5 rounded-lg ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <div className={colors.icon}>{getIcon(insight.type)}</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h4 className={`font-semibold text-base ${colors.text}`}>
                        {insight.title}
                      </h4>
                      <p className={`text-sm leading-relaxed ${colors.text} opacity-90`}>
                        {insight.description}
                      </p>
                      {insight.amount && (
                        <p className={`mt-2 text-sm font-semibold ${colors.text}`}>
                          ${insight.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border-secondary bg-background-secondary/30 backdrop-blur-sm p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-background-tertiary/50 mb-3">
              <FiInfo className="h-8 w-8 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
              No insights available yet. Upload more transaction data to get
              personalized AI-powered recommendations.
            </p>
          </div>
        )}
      </section>

      {/* Predictions Section */}
      {predictions && predictions.length > 0 && (
        <section className="rounded-2xl border border-border-secondary bg-background-card backdrop-blur-sm p-6 shadow-lg">
          <div className="mb-5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary-500/15">
              <FiTrendingUp className="h-5 w-5 text-secondary-500" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              Spending Predictions
            </h3>
          </div>

          <div className="space-y-3">
            {predictions.slice(0, 5).map((prediction, index) => (
              <div
                key={index}
                className="group flex items-center justify-between rounded-xl border border-border-secondary bg-background-secondary/30 backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-border-focus/30"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                    prediction.trend === "increasing"
                      ? "bg-red-500/15"
                      : prediction.trend === "decreasing"
                      ? "bg-emerald-500/15"
                      : "bg-slate-500/15"
                  }`}>
                    {prediction.trend === "increasing" ? (
                      <FiTrendingUp className="h-5 w-5 text-red-500" />
                    ) : prediction.trend === "decreasing" ? (
                      <FiTrendingDown className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <div className="h-5 w-5 text-text-tertiary flex items-center justify-center">→</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-base">
                      {prediction.category}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {prediction.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-text-primary text-lg">
                    ${prediction.predictedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs font-medium capitalize text-text-tertiary mt-0.5">
                    {prediction.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border-secondary/50 bg-background-secondary/30 backdrop-blur-sm p-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              💡 <span className="font-semibold">Note:</span> Predictions are based on your current spending patterns and
              historical trends. Actual spending may vary.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default InsightsPanel;
