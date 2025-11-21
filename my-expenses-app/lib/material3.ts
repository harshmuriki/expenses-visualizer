/**
 * Material Design 3 (Material You) Design System
 * Inspired by Google Pixel's Material Theme
 *
 * This file provides the design tokens and utilities for Material 3 theming
 */

export type M3ColorScheme = 'light' | 'dark';

/**
 * Material 3 Tonal Palette
 * Each color has tones from 0 (black) to 100 (white)
 */
export interface M3TonalPalette {
  0: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  95: string;
  99: string;
  100: string;
}

/**
 * Material 3 Color Roles
 * Maps semantic color roles to tonal palette values
 */
export interface M3ColorRoles {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface & Background
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  background: string;
  onBackground: string;

  // Surface Containers (Elevation Levels)
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Outline & Borders
  outline: string;
  outlineVariant: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Scrim & Shadow
  scrim: string;
  shadow: string;
}

/**
 * Blue Pixel Theme (Default - inspired by Pixel's Material You)
 */
export const bluePixelPalette = {
  primary: {
    0: '#000000',
    10: '#001849',
    20: '#002c71',
    30: '#00429a',
    40: '#0059c4',
    50: '#2374f0',
    60: '#5e8fff',
    70: '#8aaaff',
    80: '#b2c5ff',
    90: '#d9e2ff',
    95: '#edf0ff',
    99: '#fdfbff',
    100: '#ffffff',
  },
  secondary: {
    0: '#000000',
    10: '#181d2b',
    20: '#2d3240',
    30: '#444856',
    40: '#5c606e',
    50: '#747887',
    60: '#8e92a1',
    70: '#a8acbb',
    80: '#c3c7d6',
    90: '#dfe3f2',
    95: '#edf0ff',
    99: '#fdfbff',
    100: '#ffffff',
  },
  tertiary: {
    0: '#000000',
    10: '#2d0052',
    20: '#470076',
    30: '#61009d',
    40: '#7c00c6',
    50: '#9933ea',
    60: '#b35eff',
    70: '#cb85ff',
    80: '#e2adff',
    90: '#f4d9ff',
    95: '#fbedff',
    99: '#fffbff',
    100: '#ffffff',
  },
  neutral: {
    0: '#000000',
    10: '#1a1b1f',
    20: '#2f3033',
    30: '#454749',
    40: '#5d5e61',
    50: '#76777a',
    60: '#909094',
    70: '#aaabaF',
    80: '#c6c6ca',
    90: '#e2e2e6',
    95: '#f0f0f4',
    99: '#fdfbff',
    100: '#ffffff',
  },
  error: {
    0: '#000000',
    10: '#410002',
    20: '#690005',
    30: '#93000a',
    40: '#ba1a1a',
    50: '#de3730',
    60: '#ff5449',
    70: '#ff897d',
    80: '#ffb4ab',
    90: '#ffdad6',
    95: '#ffedea',
    99: '#fffbff',
    100: '#ffffff',
  },
};

/**
 * Generate M3 Color Roles from Tonal Palettes (Dark Scheme)
 */
export const generateDarkColorRoles = (palettes: typeof bluePixelPalette): M3ColorRoles => ({
  // Primary
  primary: palettes.primary[80],
  onPrimary: palettes.primary[20],
  primaryContainer: palettes.primary[30],
  onPrimaryContainer: palettes.primary[90],

  // Secondary
  secondary: palettes.secondary[80],
  onSecondary: palettes.secondary[20],
  secondaryContainer: palettes.secondary[30],
  onSecondaryContainer: palettes.secondary[90],

  // Tertiary
  tertiary: palettes.tertiary[80],
  onTertiary: palettes.tertiary[20],
  tertiaryContainer: palettes.tertiary[30],
  onTertiaryContainer: palettes.tertiary[90],

  // Error
  error: palettes.error[80],
  onError: palettes.error[20],
  errorContainer: palettes.error[30],
  onErrorContainer: palettes.error[90],

  // Surface & Background
  surface: palettes.neutral[10],
  onSurface: palettes.neutral[90],
  surfaceVariant: palettes.secondary[30],
  onSurfaceVariant: palettes.secondary[80],
  background: palettes.neutral[10],
  onBackground: palettes.neutral[90],

  // Surface Containers (Elevation Tiers)
  surfaceContainerLowest: palettes.neutral[0],
  surfaceContainerLow: palettes.neutral[10],
  surfaceContainer: palettes.neutral[20],
  surfaceContainerHigh: palettes.neutral[30],
  surfaceContainerHighest: palettes.neutral[40],

  // Outline & Borders
  outline: palettes.secondary[60],
  outlineVariant: palettes.secondary[30],

  // Inverse
  inverseSurface: palettes.neutral[90],
  inverseOnSurface: palettes.neutral[20],
  inversePrimary: palettes.primary[40],

  // Scrim & Shadow
  scrim: palettes.neutral[0],
  shadow: palettes.neutral[0],
});

/**
 * Generate M3 Color Roles from Tonal Palettes (Light Scheme)
 */
export const generateLightColorRoles = (palettes: typeof bluePixelPalette): M3ColorRoles => ({
  // Primary
  primary: palettes.primary[40],
  onPrimary: palettes.primary[100],
  primaryContainer: palettes.primary[90],
  onPrimaryContainer: palettes.primary[10],

  // Secondary
  secondary: palettes.secondary[40],
  onSecondary: palettes.secondary[100],
  secondaryContainer: palettes.secondary[90],
  onSecondaryContainer: palettes.secondary[10],

  // Tertiary
  tertiary: palettes.tertiary[40],
  onTertiary: palettes.tertiary[100],
  tertiaryContainer: palettes.tertiary[90],
  onTertiaryContainer: palettes.tertiary[10],

  // Error
  error: palettes.error[40],
  onError: palettes.error[100],
  errorContainer: palettes.error[90],
  onErrorContainer: palettes.error[10],

  // Surface & Background
  surface: palettes.neutral[99],
  onSurface: palettes.neutral[10],
  surfaceVariant: palettes.secondary[90],
  onSurfaceVariant: palettes.secondary[30],
  background: palettes.neutral[99],
  onBackground: palettes.neutral[10],

  // Surface Containers (Elevation Tiers)
  surfaceContainerLowest: palettes.neutral[100],
  surfaceContainerLow: palettes.neutral[95],
  surfaceContainer: palettes.neutral[90],
  surfaceContainerHigh: palettes.neutral[80],
  surfaceContainerHighest: palettes.neutral[70],

  // Outline & Borders
  outline: palettes.secondary[50],
  outlineVariant: palettes.secondary[80],

  // Inverse
  inverseSurface: palettes.neutral[20],
  inverseOnSurface: palettes.neutral[95],
  inversePrimary: palettes.primary[80],

  // Scrim & Shadow
  scrim: palettes.neutral[0],
  shadow: palettes.neutral[0],
});

/**
 * Material 3 Elevation System
 * Returns box-shadow based on elevation level
 */
export const getM3Elevation = (level: 0 | 1 | 2 | 3 | 4 | 5, scheme: M3ColorScheme = 'dark'): string => {
  const elevations = {
    0: 'none',
    1: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
    2: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
    3: '0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    4: '0 6px 10px 4px rgba(0, 0, 0, 0.15), 0 2px 3px 0 rgba(0, 0, 0, 0.3)',
    5: '0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px 0 rgba(0, 0, 0, 0.3)',
  };

  return elevations[level];
};

/**
 * Material 3 State Layer Opacity
 * Returns opacity values for interactive states
 */
export const m3StateLayerOpacity = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.12,
  dragged: 0.16,
};

/**
 * Material 3 Shape System
 * Border radius values matching Material 3 guidelines
 */
export const m3Shape = {
  none: '0px',
  extraSmall: '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
  extraLarge: '28px',
  full: '9999px',
};

/**
 * Material 3 Motion Easing
 * Easing curves for animations
 */
export const m3Easing = {
  // Emphasized - For attention-grabbing transitions
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',

  // Standard - For typical transitions
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
  standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',

  // Legacy - For compatibility
  legacy: 'cubic-bezier(0.4, 0, 0.6, 1)',
  legacyDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  legacyAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
};

/**
 * Material 3 Motion Duration
 * Standard duration values in milliseconds
 */
export const m3Duration = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
  extraLong1: 700,
  extraLong2: 800,
  extraLong3: 900,
  extraLong4: 1000,
};

/**
 * Export pre-configured themes
 */
export const m3Themes = {
  bluePixel: {
    dark: generateDarkColorRoles(bluePixelPalette),
    light: generateLightColorRoles(bluePixelPalette),
  },
};

/**
 * Utility: Convert M3 color roles to CSS custom properties
 */
export const m3ColorsToCSSVars = (colors: M3ColorRoles): Record<string, string> => {
  const vars: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    vars[`--md-sys-color-${cssVarName}`] = value;
  });

  return vars;
};
