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
      <section
        className="rounded-2xl p-6 overflow-hidden relative"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          boxShadow: 'var(--md-sys-elevation-level2)'
        }}
      >
        <div className="relative mb-4 flex items-center gap-3">
          <div
            className="relative p-2.5 rounded-xl"
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              border: '1px solid var(--md-sys-color-primary)',
              boxShadow: 'var(--md-sys-elevation-level1)'
            }}
          >
            <FiZap className="h-5 w-5" style={{ color: 'var(--md-sys-color-on-primary-container)' }} />
          </div>
          <div>
            <h3 className="md-typescale-title-large font-bold tracking-tight" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              AI Insights
            </h3>
            <p className="md-typescale-label-small font-medium uppercase tracking-wider" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Powered by intelligent analysis
            </p>
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="relative space-y-3">
            {insights.map((insight, index) => {
              const colors = getColorClasses(insight.type);
              return (
                <div
                  key={index}
                  className={`group relative rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all duration-300 hover:scale-[1.01] overflow-hidden`}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                    boxShadow: 'var(--md-sys-elevation-level1)'
                  }}
                >
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 p-2.5 rounded-lg ${colors.iconBg} border ${colors.border} transition-all duration-300 group-hover:scale-105 group-hover:rotate-3`}
                    >
                      <div className={colors.icon}>{getIcon(insight.type)}</div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h4 className={`font-bold md-typescale-title-medium ${colors.text} tracking-tight leading-tight`}>
                        {insight.title}
                      </h4>
                      <p className={`md-typescale-body-medium leading-relaxed ${colors.text} opacity-80`}>
                        {insight.description}
                      </p>
                      {insight.amount && (
                        <div className="mt-2 pt-2 border-t border-current/15">
                          <p className={`md-typescale-title-large font-bold ${colors.text} tracking-tight`}>
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
          <div
            className="relative rounded-xl p-8 text-center"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)'
            }}
          >
            <div
              className="inline-flex p-3 rounded-xl mb-3"
              style={{
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                border: '1px solid var(--md-sys-color-outline-variant)'
              }}
            >
              <FiInfo className="h-6 w-6" style={{ color: 'var(--md-sys-color-on-secondary-container)' }} />
            </div>
            <p className="md-typescale-body-medium leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              No insights available yet. Upload more transaction data to get
              personalized AI-powered recommendations.
            </p>
          </div>
        )}
      </section>

      {/* Predictions Section */}
      {predictions && predictions.length > 0 && (
        <section
          className="rounded-3xl p-8"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            boxShadow: 'var(--md-sys-elevation-level2)'
          }}
        >
          <div className="mb-6 flex items-center gap-4">
            <div
              className="p-3 rounded-2xl"
              style={{
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                border: '1px solid var(--md-sys-color-secondary)'
              }}
            >
              <FiTrendingUp className="h-6 w-6" style={{ color: 'var(--md-sys-color-on-secondary-container)' }} />
            </div>
            <div>
              <h3 className="md-typescale-headline-small font-bold tracking-tight" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                Spending Predictions
              </h3>
              <p className="md-typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Forecasted trends
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {predictions.slice(0, 5).map((prediction, index) => (
              <div
                key={index}
                className="group flex items-center justify-between rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  border: '1px solid var(--md-sys-color-outline-variant)',
                  boxShadow: 'var(--md-sys-elevation-level1)'
                }}
              >
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                    prediction.trend === "increasing"
                      ? "bg-red-500/15 border border-red-500/30"
                      : prediction.trend === "decreasing"
                      ? "bg-emerald-500/15 border border-emerald-500/30"
                      : "bg-slate-500/15 border border-slate-500/30"
                  }`}>
                    {prediction.trend === "increasing" ? (
                      <FiTrendingUp className="h-6 w-6 text-red-400" />
                    ) : prediction.trend === "decreasing" ? (
                      <FiTrendingDown className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <div className="h-6 w-6 text-text-tertiary flex items-center justify-center text-lg">→</div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold md-typescale-title-medium tracking-tight" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                      {prediction.category}
                    </p>
                    <p className="md-typescale-body-small mt-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {prediction.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold md-typescale-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    ${prediction.predictedAmount.toFixed(2)}
                  </p>
                  <p className="md-typescale-body-small font-medium capitalize mt-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {prediction.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)'
            }}
          >
            <p className="md-typescale-body-small leading-relaxed" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
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
