// Color utility functions for easy access to theme colors
import { useTheme } from "./theme-context";
import { ColorTheme } from "./colors";

// Hook to get current theme colors
export const useColors = () => {
  const { theme } = useTheme();
  return theme;
};

// Utility function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // If already rgba, extract rgb and apply new opacity
  if (color.startsWith("rgba")) {
    const rgb = color.match(/rgba?\(([^)]+)\)/)?.[1];
    if (rgb) {
      const [r, g, b] = rgb.split(",").map((c) => c.trim());
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  return color;
};

// Common color combinations
export const getColorCombinations = (theme: ColorTheme) => ({
  // Primary combinations
  primary: {
    solid: theme.primary[500],
    light: theme.primary[300],
    dark: theme.primary[700],
    background: withOpacity(theme.primary[500], 0.1),
    border: theme.primary[400],
  },

  // Secondary combinations
  secondary: {
    solid: theme.secondary[500],
    light: theme.secondary[300],
    dark: theme.secondary[700],
    background: withOpacity(theme.secondary[500], 0.1),
    border: theme.secondary[400],
  },

  // Accent combinations
  accent: {
    solid: theme.accent[500],
    light: theme.accent[300],
    dark: theme.accent[700],
    background: withOpacity(theme.accent[500], 0.1),
    border: theme.accent[400],
  },

  // Glass morphism colors
  glass: {
    background: theme.background.glass,
    border: theme.border.glass,
    backdrop: "backdrop-blur-sm",
  },

  // Card colors
  card: {
    background: theme.background.card,
    border: theme.border.primary,
    hover: theme.background.tertiary,
  },

  // Button colors
  button: {
    primary: {
      background: `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})`,
      hover: `linear-gradient(135deg, ${theme.primary[600]}, ${theme.secondary[600]})`,
      text: theme.text.primary,
    },
    secondary: {
      background: theme.background.card,
      hover: theme.background.tertiary,
      text: theme.text.primary,
      border: theme.border.primary,
    },
  },

  // Status colors
  status: {
    success: {
      background: withOpacity(theme.semantic.success, 0.1),
      text: theme.semantic.success,
      border: theme.semantic.success,
    },
    warning: {
      background: withOpacity(theme.semantic.warning, 0.1),
      text: theme.semantic.warning,
      border: theme.semantic.warning,
    },
    error: {
      background: withOpacity(theme.semantic.error, 0.1),
      text: theme.semantic.error,
      border: theme.semantic.error,
    },
    info: {
      background: withOpacity(theme.semantic.info, 0.1),
      text: theme.semantic.info,
      border: theme.semantic.info,
    },
  },
});

// Tailwind class generators
export const getTailwindClasses = (theme: ColorTheme) => ({
  // Background classes
  background: {
    primary: `bg-[${theme.background.primary}]`,
    secondary: `bg-[${theme.background.secondary}]`,
    tertiary: `bg-[${theme.background.tertiary}]`,
    glass: `bg-[${theme.background.glass}] backdrop-blur-sm`,
    card: `bg-[${theme.background.card}]`,
  },

  // Text classes
  text: {
    primary: `text-[${theme.text.primary}]`,
    secondary: `text-[${theme.text.secondary}]`,
    tertiary: `text-[${theme.text.tertiary}]`,
    inverse: `text-[${theme.text.inverse}]`,
  },

  // Border classes
  border: {
    primary: `border-[${theme.border.primary}]`,
    secondary: `border-[${theme.border.secondary}]`,
    focus: `border-[${theme.border.focus}]`,
    glass: `border-[${theme.border.glass}]`,
  },

  // Gradient classes
  gradient: {
    primary: `bg-gradient-to-r from-[${theme.primary[500]}] to-[${theme.secondary[500]}]`,
    secondary: `bg-gradient-to-r from-[${theme.secondary[500]}] to-[${theme.accent[500]}]`,
    accent: `bg-gradient-to-r from-[${theme.accent[500]}] to-[${theme.primary[500]}]`,
  },
});

const colorUtils = {
  useColors,
  withOpacity,
  getColorCombinations,
  getTailwindClasses,
};

export default colorUtils;
