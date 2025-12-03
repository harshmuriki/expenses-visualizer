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
    pending: string;
    completed: string;
    recurring: string;
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

// Ocean Theme - Cool blue glassmorphism palette
export const oceanTheme: ColorTheme = {
  primary: {
    50: "#eef7ff",
    100: "#d9ecff",
    200: "#b5d9ff",
    300: "#8ec4ff",
    400: "#63a8ff",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#172b72",
  },

  secondary: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },

  accent: {
    50: "#f4f4ff",
    100: "#e4e4ff",
    200: "#c7c9ff",
    300: "#a5a8ff",
    400: "#8b90ff",
    500: "#6d72ff",
    600: "#585ae6",
    700: "#4546bf",
    800: "#333495",
    900: "#232466",
  },

  neutral: {
    50: "#f5f7fb",
    100: "#e4e8f2",
    200: "#c5ccdc",
    300: "#a5aec6",
    400: "#828cab",
    500: "#626c8a",
    600: "#4b536d",
    700: "#353c4f",
    800: "#1d2232",
    900: "#0d111e",
    950: "#05060d",
  },

  semantic: {
    success: "#22d3a6",
    warning: "#fbbf24",
    error: "#fb7185",
    info: "#38bdf8",
    pending: "#f59e0b",
    completed: "#10b981",
    recurring: "#3b82f6",
  },

  background: {
    primary: "#020617",
    secondary: "#030b1f",
    tertiary: "#07142e",
    glass: "rgba(5, 12, 31, 0.78)",
    card: "rgba(7, 18, 40, 0.65)",
  },

  text: {
    primary: "#f8fbff",
    secondary: "#c7d7ff",
    tertiary: "#95a4cc",
    inverse: "#040713",
  },

  border: {
    primary: "rgba(99, 178, 255, 0.35)",
    secondary: "rgba(255, 255, 255, 0.08)",
    focus: "#38bdf8",
    glass: "rgba(120, 180, 255, 0.4)",
  },

  gradients: {
    primary: "linear-gradient(130deg, #3b82f6 0%, #06b6d4 45%, #22d3ee 100%)",
    secondary: "linear-gradient(140deg, #2563eb 0%, #6d72ff 100%)",
    accent: "linear-gradient(125deg, #0ea5e9, #22d3ee, #34d399)",
    background:
      "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(6, 182, 212, 0.25), transparent 45%)",
  },

  categories: [
    "#60a5fa",
    "#38bdf8",
    "#0ea5e9",
    "#22d3ee",
    "#34d399",
    "#2dd4bf",
    "#7dd3fc",
    "#93c5fd",
    "#818cf8",
    "#a5b4fc",
    "#c084fc",
    "#67e8f9",
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
    pending: "#ea580c", // Orange for pending state
    completed: "#059669", // Green for completed
    recurring: "#0284c7", // Cyan for recurring patterns
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
    pending: "#ea580c", // Orange for pending state
    completed: "#059669", // Green for completed
    recurring: "#0284c7", // Sky blue for recurring patterns
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

// ============================================================================
// UTILITY FUNCTIONS FOR EASY COLOR ACCESS
// ============================================================================

/**
 * Get color for status badges (pending, completed, recurring)
 * Returns an object with color classes for background, text, and border
 */
export const getStatusColors = (
  status: "pending" | "completed" | "recurring" | "success" | "warning" | "error" | "info",
  theme: ColorTheme
) => {
  const colorMap = {
    pending: {
      bg: theme.semantic.pending,
      text: theme.semantic.pending,
      border: theme.semantic.pending,
    },
    completed: {
      bg: theme.semantic.completed,
      text: theme.semantic.completed,
      border: theme.semantic.completed,
    },
    recurring: {
      bg: theme.semantic.recurring,
      text: theme.semantic.recurring,
      border: theme.semantic.recurring,
    },
    success: {
      bg: theme.semantic.success,
      text: theme.semantic.success,
      border: theme.semantic.success,
    },
    warning: {
      bg: theme.semantic.warning,
      text: theme.semantic.warning,
      border: theme.semantic.warning,
    },
    error: {
      bg: theme.semantic.error,
      text: theme.semantic.error,
      border: theme.semantic.error,
    },
    info: {
      bg: theme.semantic.info,
      text: theme.semantic.info,
      border: theme.semantic.info,
    },
  };

  return colorMap[status];
};

/**
 * Get color for insight panels based on type
 * Returns colors optimized for light/dark themes
 */
export const getInsightColors = (
  type: "warning" | "info" | "success" | "tip",
  isLightTheme: boolean
) => {
  const lightColors = {
    warning: {
      border: "rgba(217, 119, 6, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.05))",
      text: "#78350f", // amber-900
      icon: "#d97706", // amber-600
      iconBg: "rgba(217, 119, 6, 0.15)",
    },
    info: {
      border: "rgba(2, 132, 199, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(2, 132, 199, 0.1), rgba(2, 132, 199, 0.05))",
      text: "#075985", // sky-900
      icon: "#0284c7", // sky-600
      iconBg: "rgba(2, 132, 199, 0.15)",
    },
    success: {
      border: "rgba(5, 150, 105, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.05))",
      text: "#064e3b", // emerald-900
      icon: "#059669", // emerald-600
      iconBg: "rgba(5, 150, 105, 0.15)",
    },
    tip: {
      border: "rgba(139, 92, 246, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))",
      text: "#4c1d95", // violet-900
      icon: "#8b5cf6", // violet-500
      iconBg: "rgba(139, 92, 246, 0.15)",
    },
  };

  const darkColors = {
    warning: {
      border: "rgba(251, 191, 36, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))",
      text: "#fef3c7", // amber-100
      icon: "#fbbf24", // amber-400
      iconBg: "rgba(251, 191, 36, 0.15)",
    },
    info: {
      border: "rgba(59, 130, 246, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))",
      text: "#dbeafe", // blue-100
      icon: "#3b82f6", // blue-500
      iconBg: "rgba(59, 130, 246, 0.15)",
    },
    success: {
      border: "rgba(16, 185, 129, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",
      text: "#d1fae5", // emerald-100
      icon: "#10b981", // emerald-500
      iconBg: "rgba(16, 185, 129, 0.15)",
    },
    tip: {
      border: "rgba(139, 92, 246, 0.3)",
      bg: "linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))",
      text: "#ede9fe", // violet-100
      icon: "#8b5cf6", // violet-500
      iconBg: "rgba(139, 92, 246, 0.15)",
    },
  };

  return isLightTheme ? lightColors[type] : darkColors[type];
};

/**
 * Convert hex color to rgba with opacity
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Lighten or darken a color
 */
export const adjustColorBrightness = (
  hex: string,
  percent: number
): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r = Math.min(255, Math.max(0, Math.floor(r * (1 + percent / 100))));
  g = Math.min(255, Math.max(0, Math.floor(g * (1 + percent / 100))));
  b = Math.min(255, Math.max(0, Math.floor(b * (1 + percent / 100))));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
