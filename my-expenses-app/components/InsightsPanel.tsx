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
import { getInsightColors, hexToRgba } from "@/lib/colors";

interface InsightsPanelProps {
  insights: SpendingInsight[];
  predictions?: SpendingPrediction[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  predictions,
}) => {
  const { themeName, theme } = useTheme();
  // Light themes (cherryBlossom, nordic) need darker text colors for better contrast
  // Dark themes (ocean) use lighter text colors
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

  const getColorStyles = (type: SpendingInsight["type"]) => {
    return getInsightColors(type, isLightTheme);
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <section className="glass-card rounded-2xl p-6 shadow-xl border border-glass-border-strong overflow-hidden relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />
        
        <div className="relative mb-4 flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary-500/25 to-secondary-500/25 backdrop-blur-md border border-primary-500/40 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
            <FiZap className="h-5 w-5 text-primary-300 relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary tracking-tight">AI Insights</h3>
            <p className="text-[10px] text-text-tertiary/80 font-medium uppercase tracking-wider">Powered by intelligent analysis</p>
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="relative space-y-3">
            {insights.map((insight, index) => {
              const colorStyles = getColorStyles(insight.type);
              return (
                <div
                  key={index}
                  className="group relative glass-card rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl overflow-hidden"
                  style={{
                    border: `1px solid ${colorStyles.border}`,
                    background: colorStyles.bg,
                  }}
                >
                  {/* Animated gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />

                  <div className="relative flex items-start gap-4">
                    <div
                      className="flex-shrink-0 p-2.5 rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
                      style={{
                        background: colorStyles.iconBg,
                        border: `1px solid ${colorStyles.border}`,
                      }}
                    >
                      <div style={{ color: colorStyles.icon }}>{getIcon(insight.type)}</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h4
                        className="font-bold text-base tracking-tight leading-tight"
                        style={{ color: colorStyles.text }}
                      >
                        {insight.title}
                      </h4>
                      <p
                        className="text-sm leading-relaxed opacity-80"
                        style={{ color: colorStyles.text }}
                      >
                        {insight.description}
                      </p>
                      {insight.amount && (
                        <div className="mt-2 pt-2 border-t border-current/15">
                          <p
                            className="text-base font-bold tracking-tight"
                            style={{ color: colorStyles.text }}
                          >
                            ${insight.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative glass-card rounded-xl border border-border-secondary/40 p-8 text-center">
            <div className="inline-flex p-3 rounded-xl bg-background-tertiary/20 mb-3 border border-border-secondary/30 backdrop-blur-sm">
              <FiInfo className="h-6 w-6 text-text-tertiary" />
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
        <section className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-accent-500/20 backdrop-blur-sm border border-secondary-500/30">
              <FiTrendingUp className="h-6 w-6 text-secondary-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                Spending Predictions
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">Forecasted trends</p>
            </div>
          </div>

          <div className="space-y-4">
            {predictions.slice(0, 5).map((prediction, index) => {
              const trendColor =
                prediction.trend === "increasing"
                  ? theme.semantic.error
                  : prediction.trend === "decreasing"
                  ? theme.semantic.success
                  : theme.text.tertiary;

              return (
                <div
                  key={index}
                  className="group glass-card flex items-center justify-between rounded-2xl border border-border-secondary/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-border-focus/50"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: hexToRgba(trendColor, 0.15),
                        border: `1px solid ${hexToRgba(trendColor, 0.3)}`,
                      }}
                    >
                      {prediction.trend === "increasing" ? (
                        <FiTrendingUp className="h-6 w-6" style={{ color: trendColor }} />
                      ) : prediction.trend === "decreasing" ? (
                        <FiTrendingDown className="h-6 w-6" style={{ color: trendColor }} />
                      ) : (
                        <div className="h-6 w-6 text-text-tertiary flex items-center justify-center text-lg">
                          →
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-base tracking-tight">
                        {prediction.category}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {prediction.confidence.toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary text-xl">
                      ${prediction.predictedAmount.toFixed(2)}
                    </p>
                    <p className="text-xs font-medium capitalize text-text-tertiary mt-1">
                      {prediction.trend}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 glass-card rounded-2xl border border-border-secondary/50 p-5">
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
