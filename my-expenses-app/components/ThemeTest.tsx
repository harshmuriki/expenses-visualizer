"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";

const ThemeTest: React.FC = () => {
  const { themeName, setTheme, availableThemes } = useTheme();

  return (
    <div className="space-y-6">
      {/* Current Theme Display */}
      <div className="p-4 bg-background-secondary/50 border border-border-secondary rounded-xl">
        <h4 className="text-sm font-semibold text-text-primary mb-2">
          Current Theme
        </h4>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
          <span className="text-primary-500 font-bold capitalize">
            {themeName}
          </span>
        </div>
      </div>

      {/* Color Palette Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Color Palette
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary-500 text-white rounded-lg text-center">
            <div className="text-xs font-medium">Primary</div>
          </div>
          <div className="p-3 bg-secondary-500 text-white rounded-lg text-center">
            <div className="text-xs font-medium">Secondary</div>
          </div>
          <div className="p-3 bg-accent-500 text-white rounded-lg text-center">
            <div className="text-xs font-medium">Accent</div>
          </div>
          <div className="p-3 bg-gradient-primary text-white rounded-lg text-center">
            <div className="text-xs font-medium">Gradient</div>
          </div>
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Switch Theme
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => setTheme(theme)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                themeName === theme
                  ? "bg-primary-500 text-white shadow-lg"
                  : "bg-background-secondary text-text-primary hover:bg-background-tertiary border border-border-secondary"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-border-secondary">
        <div className="flex space-x-2">
          <button
            onClick={() => setTheme("materialDark")}
            className="px-3 py-1 text-xs bg-secondary-500 text-white rounded hover:bg-secondary-600 transition"
          >
            Reset to Material Dark
          </button>
          <button
            onClick={() => setTheme("materialLight")}
            className="px-3 py-1 text-xs bg-accent-500 text-white rounded hover:bg-accent-600 transition"
          >
            Test Material Light
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
