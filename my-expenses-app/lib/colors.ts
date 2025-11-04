// Centralized Color Configuration System
// Change colors here to update the entire project

export interface ColorTheme {
  // Primary Colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Secondary Colors
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Accent Colors
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Neutral Colors
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  // Semantic Colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Background Colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    glass: string;
    card: string;
  };

  // Text Colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // Border Colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
    glass: string;
  };

  // Gradient Colors
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };

  // Chart/Category Colors (for data visualization)
  categories: string[];
}

// Ocean Theme - Modern, sophisticated dark theme with excellent contrast
export const oceanTheme: ColorTheme = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // sky-500
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  secondary: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4", // cyan-500
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },

  accent: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6", // teal-500
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },

  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  semantic: {
    success: "#22c55e", // Brighter green for better visibility
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  background: {
    primary: "#0a0f1a", // Deeper, richer dark blue
    secondary: "#131b2e",
    tertiary: "#1e293b",
    glass: "rgba(19, 27, 46, 0.7)",
    card: "rgba(19, 27, 46, 0.6)",
  },

  text: {
    primary: "#ffffff", // Pure white for maximum contrast
    secondary: "#cbd5e1",
    tertiary: "#94a3b8",
    inverse: "#0a0f1a",
  },

  border: {
    primary: "#334155",
    secondary: "#1e293b",
    focus: "#0ea5e9",
    glass: "rgba(51, 65, 85, 0.4)",
  },

  gradients: {
    primary: "from-sky-500 to-cyan-500",
    secondary: "from-cyan-500 to-teal-500",
    accent: "from-teal-500 to-emerald-500",
    background: "from-slate-900 via-slate-800 to-slate-900",
  },

  categories: [
    "#3b82f6", // Blue - for major categories
    "#8b5cf6", // Purple - housing/utilities
    "#ec4899", // Pink - entertainment
    "#f59e0b", // Amber - food/dining
    "#10b981", // Emerald - income/savings
    "#06b6d4", // Cyan - transportation
    "#ef4444", // Red - bills/debt
    "#a855f7", // Violet - health
    "#14b8a6", // Teal - shopping
    "#f97316", // Orange - subscriptions
    "#22c55e", // Green - investments
    "#6366f1", // Indigo - misc
  ],
};

// Cherry Blossom Theme - Elegant light theme with soft, warm colors
export const cherryBlossomTheme: ColorTheme = {
  primary: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#ec4899", // pink-500
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },

  secondary: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e", // rose-500
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
  },

  accent: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // red-500
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  neutral: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09",
  },

  semantic: {
    success: "#059669", // Deeper green for better contrast on light
    warning: "#d97706", // Darker orange for accessibility
    error: "#dc2626", // Deeper red
    info: "#db2777", // Pink info for theme consistency
  },

  background: {
    primary: "#fefcfd", // Almost white with hint of pink
    secondary: "#fff1f2",
    tertiary: "#ffe4e6",
    glass: "rgba(255, 252, 253, 0.8)",
    card: "rgba(255, 255, 255, 0.9)",
  },

  text: {
    primary: "#1c1917", // Near black for maximum readability
    secondary: "#57534e",
    tertiary: "#78716c",
    inverse: "#ffffff",
  },

  border: {
    primary: "#e7e5e4",
    secondary: "#fecdd3",
    focus: "#ec4899",
    glass: "rgba(231, 229, 228, 0.6)",
  },

  gradients: {
    primary: "from-pink-500 to-rose-500",
    secondary: "from-rose-500 to-red-400",
    accent: "from-red-400 to-pink-400",
    background: "from-white via-rose-50 to-pink-50",
  },

  categories: [
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#eab308", // Yellow
    "#84cc16", // Lime
    "#10b981", // Emerald
    "#14b8a6", // Teal
    "#06b6d4", // Cyan
    "#8b5cf6", // Purple
    "#a855f7", // Violet
  ],
};

// Nordic Theme - Clean, minimal light theme with cool colors
export const nordicTheme: ColorTheme = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // sky-500
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b", // slate-500
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  accent: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // blue-500
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  semantic: {
    success: "#059669", // Deeper for better contrast
    warning: "#d97706", // Darker for accessibility
    error: "#dc2626", // Deeper red
    info: "#0284c7", // Sky blue for theme consistency
  },

  background: {
    primary: "#f8fafc", // Pure, clean slate
    secondary: "#f1f5f9",
    tertiary: "#e2e8f0",
    glass: "rgba(248, 250, 252, 0.8)",
    card: "rgba(255, 255, 255, 0.9)",
  },

  text: {
    primary: "#0f172a", // Deep slate for excellent readability
    secondary: "#334155",
    tertiary: "#64748b",
    inverse: "#ffffff",
  },

  border: {
    primary: "#e2e8f0",
    secondary: "#cbd5e1",
    focus: "#0ea5e9",
    glass: "rgba(226, 232, 240, 0.6)",
  },

  gradients: {
    primary: "from-sky-500 to-blue-500",
    secondary: "from-slate-400 to-slate-600",
    accent: "from-blue-500 to-cyan-500",
    background: "from-white via-slate-50 to-sky-50",
  },

  categories: [
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#64748b", // Slate
    "#0ea5e9", // Sky
    "#14b8a6", // Teal
    "#6366f1", // Indigo
    "#a855f7", // Violet
    "#0284c7", // Light blue
    "#475569", // Dark slate
    "#2563eb", // Royal blue
    "#0891b2", // Dark cyan
  ],
};

// Available themes
export const themes = {
  ocean: oceanTheme,
  cherryBlossom: cherryBlossomTheme,
  nordic: nordicTheme,
} as const;

export type ThemeName = keyof typeof themes;

// Current active theme (change this to switch themes)
export const currentTheme: ThemeName = "ocean";

// Get current theme colors
export const colors = themes[currentTheme];

// Utility functions for easy color access
export const getColor = (path: string): string | undefined => {
  const keys = path.split(".");
  let value: unknown = colors as unknown;

  for (const key of keys) {
    if (
      typeof value === "object" &&
      value !== null &&
      key in (value as Record<string, unknown>)
    ) {
      value = (value as Record<string, unknown>)[key];
    } else {
      value = undefined;
      break;
    }
  }

  return typeof value === "string" ? value : undefined;
};

// CSS custom properties generator
export const generateCSSVariables = (theme: ColorTheme) => {
  const cssVars: Record<string, string> = {};

  // Primary colors
  Object.entries(theme.primary).forEach(([key, value]) => {
    cssVars[`--color-primary-${key}`] = value;
  });

  // Secondary colors
  Object.entries(theme.secondary).forEach(([key, value]) => {
    cssVars[`--color-secondary-${key}`] = value;
  });

  // Accent colors
  Object.entries(theme.accent).forEach(([key, value]) => {
    cssVars[`--color-accent-${key}`] = value;
  });

  // Neutral colors
  Object.entries(theme.neutral).forEach(([key, value]) => {
    cssVars[`--color-neutral-${key}`] = value;
  });

  // Semantic colors
  Object.entries(theme.semantic).forEach(([key, value]) => {
    cssVars[`--color-semantic-${key}`] = value;
  });

  // Background colors
  Object.entries(theme.background).forEach(([key, value]) => {
    cssVars[`--color-background-${key}`] = value;
  });

  // Text colors
  Object.entries(theme.text).forEach(([key, value]) => {
    cssVars[`--color-text-${key}`] = value;
  });

  // Border colors
  Object.entries(theme.border).forEach(([key, value]) => {
    cssVars[`--color-border-${key}`] = value;
  });

  return cssVars;
};

// Export current theme colors for easy access
export default colors;

// Legacy COLORS export for backward compatibility
export const COLORS = {
  // Main color palette (array for backward compatibility)
  palette: [
    colors.primary[500],
    colors.secondary[500],
    colors.accent[500],
    colors.primary[300],
    colors.secondary[300],
    colors.accent[300],
    colors.primary[700],
    colors.secondary[700],
    colors.accent[700],
    colors.primary[400],
    colors.secondary[400],
    colors.accent[400],
  ],
  // Category colors for charts and data visualization
  categories: colors.categories,
  // Direct color access
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  accent: colors.accent[500],
};
