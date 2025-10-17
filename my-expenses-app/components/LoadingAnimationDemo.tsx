"use client";

import React, { useState } from "react";
import "../styles/loading-animations.css";

const LoadingAnimationDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const startDemo = () => {
    setIsProcessing(true);
    setCurrentStep(0);

    // Simulate the processing steps
    const steps = [
      { step: 1, message: "📤 Uploading files...", delay: 1000 },
      { step: 2, message: "🔄 Processing CSV files...", delay: 2000 },
      { step: 3, message: "🤖 AI analyzing transactions...", delay: 3000 },
      { step: 4, message: "✅ Processing completed!", delay: 1000 },
    ];

    let currentIndex = 0;
    const runStep = () => {
      if (currentIndex < steps.length) {
        setCurrentStep(steps[currentIndex].step);
        setTimeout(() => {
          currentIndex++;
          runStep();
        }, steps[currentIndex].delay);
      } else {
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep(0);
        }, 2000);
      }
    };

    runStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-text-primary text-center mb-6">
        Beautiful Loading Animation Demo
      </h2>

      {!isProcessing && (
        <button
          onClick={startDemo}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[colors.primary.500] to-[colors.secondary.500] hover:from-[colors.primary.600] hover:to-[colors.secondary.600] text-text-primary font-semibold shadow-lg transform hover:scale-105 transition duration-300"
        >
          🚀 Start Demo Animation
        </button>
      )}

      {isProcessing && (
        <div className="w-full space-y-6 p-6 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-border-primary/30 backdrop-blur-sm">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-700 ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-[colors.primary.500] to-[colors.secondary.500] text-text-primary shadow-lg animate-pulse-glow"
                      : "bg-background-tertiary text-text-tertiary"
                  } ${currentStep === step ? "animate-float" : ""} ${
                    currentStep > step ? "animate-step-complete" : ""
                  }`}
                >
                  {currentStep > step ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span
                      className={
                        currentStep === step ? "animate-gradient-text" : ""
                      }
                    >
                      {step}
                    </span>
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 transition-all duration-700 rounded-full ${
                      currentStep > step
                        ? "bg-gradient-to-r from-[colors.primary.500] to-[colors.secondary.500] animate-shimmer"
                        : "bg-background-tertiary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-xs font-medium">
            <span
              className={`transition-colors duration-500 ${
                currentStep >= 1
                  ? "text-[colors.primary.500] animate-gradient-text"
                  : "text-text-tertiary"
              }`}
            >
              Upload
            </span>
            <span
              className={`transition-colors duration-500 ${
                currentStep >= 2
                  ? "text-[colors.primary.500] animate-gradient-text"
                  : "text-text-tertiary"
              }`}
            >
              Processing
            </span>
            <span
              className={`transition-colors duration-500 ${
                currentStep >= 3
                  ? "text-[colors.primary.500] animate-gradient-text"
                  : "text-text-tertiary"
              }`}
            >
              AI Analysis
            </span>
            <span
              className={`transition-colors duration-500 ${
                currentStep >= 4
                  ? "text-[colors.primary.500] animate-gradient-text"
                  : "text-text-tertiary"
              }`}
            >
              Complete
            </span>
          </div>

          {/* Animated Processing Display */}
          <div className="relative">
            <div className="w-full h-3 bg-background-secondary rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[colors.primary.500] to-[colors.secondary.500] rounded-full transition-all duration-1000 ease-out animate-progress-glow animate-shimmer"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            {/* Floating particles animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[colors.secondary.500] rounded-full animate-particle-float opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-[colors.primary.500] rounded-full animate-pulse animate-float" />
              <div
                className="w-3 h-3 bg-[colors.secondary.500] rounded-full animate-pulse animate-float"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-3 h-3 bg-[colors.accent.500] rounded-full animate-pulse animate-float"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <p className="text-sm text-text-primary font-medium animate-gradient-text">
              {currentStep === 1 && "📤 Uploading files..."}
              {currentStep === 2 && "🔄 Processing CSV files..."}
              {currentStep === 3 && "🤖 AI analyzing transactions..."}
              {currentStep === 4 && "✅ Processing completed!"}
            </p>
            {currentStep === 3 && (
              <div className="space-y-2">
                <p className="text-xs text-text-tertiary animate-loading-dots">
                  AI is analyzing your transactions and categorizing them
                </p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-[colors.primary.500] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[colors.secondary.500] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-[colors.accent.500] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            )}
            {currentStep === 4 && (
              <div className="text-green-400 font-semibold animate-pulse">
                🎉 Processing Complete! Redirecting...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingAnimationDemo;
