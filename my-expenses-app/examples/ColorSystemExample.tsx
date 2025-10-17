// Example of how to use the centralized color system
"use client";

import React from 'react';
import { useTheme } from '@/lib/theme-context';
import { useColors, getColorCombinations } from '@/lib/color-utils';

const ColorSystemExample: React.FC = () => {
  const { themeName, setTheme, availableThemes } = useTheme();
  const colors = useColors();
  const combinations = getColorCombinations(colors);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">
        Color System Example
      </h1>
      
      {/* Theme Switcher */}
      <div className="bg-background-card p-4 rounded-lg border border-border-primary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Current Theme: {themeName}
        </h2>
        <div className="flex space-x-2">
          {availableThemes.map(theme => (
            <button
              key={theme}
              onClick={() => setTheme(theme)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                themeName === theme
                  ? 'bg-primary-500 text-white'
                  : 'bg-background-tertiary text-text-primary hover:bg-background-secondary'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Colors */}
        <div className="bg-background-card p-4 rounded-lg border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Primary Colors
          </h3>
          <div className="space-y-2">
            {Object.entries(colors.primary).map(([shade, color]) => (
              <div key={shade} className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded border border-border-secondary"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-secondary text-sm">
                  {shade}: {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Colors */}
        <div className="bg-background-card p-4 rounded-lg border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Secondary Colors
          </h3>
          <div className="space-y-2">
            {Object.entries(colors.secondary).map(([shade, color]) => (
              <div key={shade} className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded border border-border-secondary"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-secondary text-sm">
                  {shade}: {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="bg-background-card p-4 rounded-lg border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Accent Colors
          </h3>
          <div className="space-y-2">
            {Object.entries(colors.accent).map(([shade, color]) => (
              <div key={shade} className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded border border-border-secondary"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-secondary text-sm">
                  {shade}: {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button Examples */}
      <div className="bg-background-card p-4 rounded-lg border border-border-primary">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Button Examples
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              background: combinations.button.primary.background,
              color: combinations.button.primary.text,
            }}
          >
            Primary Button
          </button>
          
          <button
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 border"
            style={{
              background: combinations.button.secondary.background,
              color: combinations.button.secondary.text,
              borderColor: combinations.button.secondary.border,
            }}
          >
            Secondary Button
          </button>
          
          <button
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              background: combinations.accent.solid,
              color: colors.text.primary,
            }}
          >
            Accent Button
          </button>
        </div>
      </div>

      {/* Status Examples */}
      <div className="bg-background-card p-4 rounded-lg border border-border-primary">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Status Examples
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="p-3 rounded-lg border"
            style={{
              background: combinations.status.success.background,
              color: combinations.status.success.text,
              borderColor: combinations.status.success.border,
            }}
          >
            Success Message
          </div>
          
          <div
            className="p-3 rounded-lg border"
            style={{
              background: combinations.status.warning.background,
              color: combinations.status.warning.text,
              borderColor: combinations.status.warning.border,
            }}
          >
            Warning Message
          </div>
          
          <div
            className="p-3 rounded-lg border"
            style={{
              background: combinations.status.error.background,
              color: combinations.status.error.text,
              borderColor: combinations.status.error.border,
            }}
          >
            Error Message
          </div>
          
          <div
            className="p-3 rounded-lg border"
            style={{
              background: combinations.status.info.background,
              color: combinations.status.info.text,
              borderColor: combinations.status.info.border,
            }}
          >
            Info Message
          </div>
        </div>
      </div>

      {/* Glass Morphism Example */}
      <div className="bg-background-card p-4 rounded-lg border border-border-primary">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Glass Morphism Example
        </h3>
        <div
          className="p-6 rounded-xl border backdrop-blur-sm"
          style={{
            background: combinations.glass.background,
            borderColor: combinations.glass.border,
          }}
        >
          <p className="text-text-primary">
            This is a glass morphism card using the theme colors!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorSystemExample;
