// Centralized Color Configuration System
// Change colors here to update the entire project

export interface ColorTheme {
  // Alignment to Material You system
  mode: "light" | "dark";

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

  // Accent/Tertiary Colors
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

// Material You light scheme derived from purple seed
export const materialLightTheme: ColorTheme = {
  mode: "light",
  primary: {
    50: "#f5edff",
    100: "#e9ddff",
    200: "#d7c7ff",
    300: "#c2b0ff",
    400: "#aa95fa",
    500: "#8f79ec",
    600: "#7b63d4",
    700: "#6750a4",
    800: "#533d82",
    900: "#3f2c63",
  },

  secondary: {
    50: "#f5f2f9",
    100: "#e7e1f1",
    200: "#cfc8dd",
    300: "#b7b0c9",
    400: "#9e95b2",
    500: "#857b9a",
    600: "#6d6382",
    700: "#564d6a",
    800: "#403954",
    900: "#2b263c",
  },

  accent: {
    50: "#f1faf7",
    100: "#dcefe9",
    200: "#beded5",
    300: "#a0cdbf",
    400: "#82bca9",
    500: "#67a991",
    600: "#4f9077",
    700: "#3a7560",
    800: "#2d5c4b",
    900: "#1f4336",
  },

  neutral: {
    50: "#fdf7ff",
    100: "#f4edf7",
    200: "#e6dee9",
    300: "#d8d0dc",
    400: "#c0b6c2",
    500: "#a69cac",
    600: "#8b8292",
    700: "#706878",
    800: "#554e5d",
    900: "#3c3543",
    950: "#241f29",
  },

  semantic: {
    success: "#4caf50",
    warning: "#f9a825",
    error: "#b3261e",
    info: "#1e88e5",
  },

  background: {
    primary: "#fdf7ff",
    secondary: "#f4edf7",
    tertiary: "#e9e1f1",
    glass: "rgba(245, 238, 255, 0.85)",
    card: "rgba(255, 255, 255, 0.95)",
  },

  text: {
    primary: "#1c1b1f",
    secondary: "#4a4458",
    tertiary: "#625b71",
    inverse: "#ffffff",
  },

  border: {
    primary: "rgba(86, 77, 106, 0.28)",
    secondary: "rgba(98, 91, 113, 0.16)",
    focus: "#6750a4",
    glass: "rgba(203, 189, 226, 0.55)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #6750a4 0%, #8f79ec 40%, #67a991 100%)",
    secondary: "linear-gradient(120deg, #2b263c 0%, #6d6382 50%, #e7e1f1 100%)",
    accent: "linear-gradient(135deg, #3a7560 0%, #67a991 50%, #8f79ec 100%)",
    background:
      "radial-gradient(circle at 20% 20%, rgba(143, 121, 236, 0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(103, 169, 145, 0.18), transparent 35%)",
  },

  categories: [
    "#6750a4",
    "#3a7560",
    "#8f79ec",
    "#4f9077",
    "#564d6a",
    "#82bca9",
    "#6d6382",
    "#aa95fa",
    "#403954",
    "#c2b0ff",
    "#1f4336",
    "#b7b0c9",
  ],
};

// Material You dark scheme derived from the same seed
export const materialDarkTheme: ColorTheme = {
  mode: "dark",
  primary: {
    50: "#e8ddff",
    100: "#d0bcff",
    200: "#b69cf4",
    300: "#9d82db",
    400: "#8a6cc8",
    500: "#7356b0",
    600: "#5c4198",
    700: "#46307b",
    800: "#311f5c",
    900: "#1f133d",
  },

  secondary: {
    50: "#e7def0",
    100: "#cbc2d5",
    200: "#b1a8ba",
    300: "#988fa2",
    400: "#81778a",
    500: "#6a6173",
    600: "#544b5c",
    700: "#3f3746",
    800: "#2b2531",
    900: "#181420",
  },

  accent: {
    50: "#d4efe5",
    100: "#b7d6cb",
    200: "#9bbeb3",
    300: "#80a69b",
    400: "#668e84",
    500: "#4f776c",
    600: "#3a6155",
    700: "#284b40",
    800: "#19362e",
    900: "#0c221d",
  },

  neutral: {
    50: "#e6e0e9",
    100: "#cbc5d0",
    200: "#b0a9b7",
    300: "#958ea0",
    400: "#7b7488",
    500: "#625b70",
    600: "#4b4558",
    700: "#363142",
    800: "#221f2c",
    900: "#120d1a",
    950: "#0c0812",
  },

  semantic: {
    success: "#81c995",
    warning: "#f6c445",
    error: "#f2b8b5",
    info: "#82c5ff",
  },

  background: {
    primary: "#141218",
    secondary: "#1d1b20",
    tertiary: "#221f26",
    glass: "rgba(32, 28, 38, 0.75)",
    card: "rgba(33, 30, 38, 0.85)",
  },

  text: {
    primary: "#e6e0e9",
    secondary: "#c9c3d5",
    tertiary: "#aea8ba",
    inverse: "#1c1b1f",
  },

  border: {
    primary: "rgba(230, 224, 233, 0.12)",
    secondary: "rgba(158, 149, 168, 0.18)",
    focus: "#d0bcff",
    glass: "rgba(126, 117, 144, 0.4)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #311f5c 0%, #7356b0 50%, #4f776c 100%)",
    secondary: "linear-gradient(120deg, #181420 0%, #3f3746 50%, #cbc2d5 100%)",
    accent: "linear-gradient(135deg, #19362e 0%, #4f776c 50%, #d0bcff 100%)",
    background:
      "radial-gradient(circle at 15% 20%, rgba(208, 188, 255, 0.12), transparent 45%), radial-gradient(circle at 80% 5%, rgba(79, 119, 108, 0.16), transparent 40%)",
  },

  categories: [
    "#d0bcff",
    "#4f776c",
    "#9d82db",
    "#b7b0c9",
    "#cbc2d5",
    "#80a69b",
    "#6a6173",
    "#311f5c",
    "#988fa2",
    "#3a6155",
    "#544b5c",
    "#e8ddff",
  ],
};

// Material You dynamic-inspired light scheme (fresh green/amber seed)
export const materialDynamicTheme: ColorTheme = {
  mode: "light",
  primary: {
    50: "#f6fff7",
    100: "#dffbe3",
    200: "#c2f3cb",
    300: "#a6e9b4",
    400: "#8adf9d",
    500: "#6fd487",
    600: "#55b96d",
    700: "#3d9f55",
    800: "#2a8340",
    900: "#1b642e",
  },

  secondary: {
    50: "#fff7e7",
    100: "#feebc7",
    200: "#fcdba1",
    300: "#f9c97a",
    400: "#f6b754",
    500: "#f1a02e",
    600: "#d28219",
    700: "#ad660f",
    800: "#874c09",
    900: "#603506",
  },

  accent: {
    50: "#e8f5ff",
    100: "#d5ecff",
    200: "#b7dbff",
    300: "#92c6ff",
    400: "#6aacff",
    500: "#3e90f5",
    600: "#2f75d8",
    700: "#235db7",
    800: "#194a95",
    900: "#103671",
  },

  neutral: {
    50: "#f6fbf7",
    100: "#e7f1e8",
    200: "#d6e3d8",
    300: "#c4d5c7",
    400: "#a9bbaa",
    500: "#8fa18f",
    600: "#748772",
    700: "#5a6e58",
    800: "#43543f",
    900: "#2c3b29",
    950: "#1c261b",
  },

  semantic: {
    success: "#2e7d32",
    warning: "#f57f17",
    error: "#c62828",
    info: "#1565c0",
  },

  background: {
    primary: "#f6fbf7",
    secondary: "#e7f1e8",
    tertiary: "#d6e3d8",
    glass: "rgba(230, 242, 235, 0.82)",
    card: "rgba(255, 255, 255, 0.95)",
  },

  text: {
    primary: "#1b1f18",
    secondary: "#36412e",
    tertiary: "#4a5d40",
    inverse: "#ffffff",
  },

  border: {
    primary: "rgba(58, 110, 88, 0.22)",
    secondary: "rgba(58, 110, 88, 0.14)",
    focus: "#3d9f55",
    glass: "rgba(144, 177, 152, 0.5)",
  },

  gradients: {
    primary: "linear-gradient(140deg, #3d9f55 0%, #f1a02e 55%, #3e90f5 100%)",
    secondary: "linear-gradient(120deg, #1b642e 0%, #6fd487 45%, #fcdba1 100%)",
    accent: "linear-gradient(135deg, #3e90f5 0%, #6fd487 45%, #f6b754 100%)",
    background:
      "radial-gradient(circle at 70% 10%, rgba(61, 159, 85, 0.14), transparent 45%), radial-gradient(circle at 20% 60%, rgba(62, 144, 245, 0.12), transparent 40%)",
  },

  categories: [
    "#3d9f55",
    "#f1a02e",
    "#3e90f5",
    "#6fd487",
    "#8fa18f",
    "#2a8340",
    "#f6b754",
    "#235db7",
    "#874c09",
    "#92c6ff",
    "#1c261b",
    "#c2f3cb",
  ],
};

// Available themes
export const themes = {
  materialLight: materialLightTheme,
  materialDark: materialDarkTheme,
  materialDynamic: materialDynamicTheme,
} as const;

export type ThemeName = keyof typeof themes;

// Current active theme (change this to switch themes)
export const currentTheme: ThemeName = "materialDark";

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
