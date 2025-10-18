"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { ThemeName } from "@/lib/colors";

interface ThemeSwitcherProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = "",
  showLabel = true,
  size = "md",
}) => {
  const { themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  const themeLabels: Record<ThemeName, string> = {
    ocean: "🌊 Ocean",
    cherryBlossom: "🌸 Cherry Blossom",
    nordic: "❄️ Nordic",
  };

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Theme
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between
            ${sizeClasses[size]}
            bg-background-card border border-border-primary rounded-lg
            text-text-primary hover:bg-background-tertiary
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-border-focus
          `}
        >
          <span className="flex items-center space-x-2">
            <span>{themeLabels[themeName]}</span>
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background-card border border-border-primary rounded-lg shadow-2xl z-[9999] overflow-hidden max-h-96 overflow-y-auto">
            {availableThemes.map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`
                  w-full text-left px-3 py-3 hover:bg-background-tertiary
                  transition-all duration-200
                  ${
                    themeName === theme
                      ? "bg-primary-500/10 text-primary-500 border-l-4 border-primary-500"
                      : "text-text-primary border-l-4 border-transparent"
                  }
                `}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <div className="font-medium">{themeLabels[theme]}</div>
                    </div>
                  </div>
                  {themeName === theme && (
                    <div className="text-primary-500 text-lg">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;
