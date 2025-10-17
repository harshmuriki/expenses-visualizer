"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { ThemeName, themes } from "@/lib/colors";

interface ThemeSwitcherProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  showColorPreviews?: boolean;
  enableKeyboardShortcuts?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = "",
  showLabel = true,
  size = "md",
  showColorPreviews = true,
  enableKeyboardShortcuts = true,
}) => {
  const { themeName, setTheme, availableThemes, systemTheme, useSystemTheme, setUseSystemTheme } = useTheme();
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

  const themeDescriptions: Record<ThemeName, string> = {
    ocean: "Ocean-inspired theme with cyan and teal",
    cherryBlossom: "Soft pinks and elegant whites",
    nordic: "Cool blues and minimalist grays",
  };

  // Color preview swatches for each theme
  const getThemeColors = (theme: ThemeName) => {
    const themeObj = themes[theme];
    return [
      themeObj.primary[500],
      themeObj.secondary[500],
      themeObj.accent[500],
    ];
  };

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Keyboard shortcuts (Cmd/Ctrl + Shift + T to cycle themes)
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "t") {
        e.preventDefault();
        const currentIndex = availableThemes.indexOf(themeName);
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        setTheme(availableThemes[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [themeName, availableThemes, setTheme, enableKeyboardShortcuts]);

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
                    {showColorPreviews && (
                      <div className="flex gap-1">
                        {getThemeColors(theme).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-border-secondary"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{themeLabels[theme]}</div>
                      <div className="text-xs text-text-tertiary">
                        {themeDescriptions[theme]}
                      </div>
                    </div>
                  </div>
                  {themeName === theme && (
                    <div className="text-primary-500 text-lg">✓</div>
                  )}
                </div>
              </button>
            ))}

            {/* System Theme Toggle */}
            <div className="border-t border-border-secondary p-3 bg-background-secondary/30">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary-500 transition-colors">
                    Auto (System)
                  </span>
                  {systemTheme && (
                    <span className="text-xs text-text-tertiary">
                      {systemTheme === 'dark' ? '🌙' : '☀️'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={useSystemTheme}
                    onChange={(e) => setUseSystemTheme(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-background-tertiary rounded-full peer peer-checked:bg-primary-500 transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </label>
              <p className="text-xs text-text-tertiary mt-2">
                Automatically switch between light and dark themes based on your system preferences
              </p>
            </div>

            {enableKeyboardShortcuts && (
              <div className="px-3 py-2 bg-background-secondary/50 border-t border-border-secondary">
                <p className="text-xs text-text-tertiary text-center">
                  Tip: Press <kbd className="px-1.5 py-0.5 bg-background-tertiary rounded border border-border-secondary">Cmd/Ctrl + Shift + T</kbd> to cycle themes
                </p>
              </div>
            )}
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
