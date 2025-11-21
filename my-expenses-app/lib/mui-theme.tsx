"use client";

import { createTheme, Theme } from '@mui/material/styles';
import { ColorTheme } from './colors';

// Extend MUI theme to include accent color and additional background colors
declare module '@mui/material/styles' {
  interface Palette {
    accent: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    accent?: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  interface TypeBackground {
    secondary?: string;
    tertiary?: string;
  }
}

/**
 * Converts the custom ColorTheme to Material UI theme
 */
export const createMuiTheme = (colorTheme: ColorTheme): Theme => {
  // Determine if theme is dark based on background color
  const isDark = colorTheme.background.primary.startsWith('#') 
    ? parseInt(colorTheme.background.primary.slice(1, 3), 16) < 128
    : colorTheme.background.primary.includes('0d') || colorTheme.background.primary.includes('02');

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: colorTheme.primary[500],
        light: colorTheme.primary[300],
        dark: colorTheme.primary[700],
        contrastText: colorTheme.text.primary,
        50: colorTheme.primary[50],
        100: colorTheme.primary[100],
        200: colorTheme.primary[200],
        300: colorTheme.primary[300],
        400: colorTheme.primary[400],
        500: colorTheme.primary[500],
        600: colorTheme.primary[600],
        700: colorTheme.primary[700],
        800: colorTheme.primary[800],
        900: colorTheme.primary[900],
      },
      secondary: {
        main: colorTheme.secondary[500],
        light: colorTheme.secondary[300],
        dark: colorTheme.secondary[700],
        contrastText: colorTheme.text.primary,
        50: colorTheme.secondary[50],
        100: colorTheme.secondary[100],
        200: colorTheme.secondary[200],
        300: colorTheme.secondary[300],
        400: colorTheme.secondary[400],
        500: colorTheme.secondary[500],
        600: colorTheme.secondary[600],
        700: colorTheme.secondary[700],
        800: colorTheme.secondary[800],
        900: colorTheme.secondary[900],
      },
      error: {
        main: colorTheme.semantic.error,
        light: colorTheme.semantic.error + '80',
        dark: colorTheme.semantic.error,
        contrastText: colorTheme.text.primary,
      },
      warning: {
        main: colorTheme.semantic.warning,
        light: colorTheme.semantic.warning + '80',
        dark: colorTheme.semantic.warning,
        contrastText: colorTheme.text.primary,
      },
      info: {
        main: colorTheme.semantic.info,
        light: colorTheme.semantic.info + '80',
        dark: colorTheme.semantic.info,
        contrastText: colorTheme.text.primary,
      },
      success: {
        main: colorTheme.semantic.success,
        light: colorTheme.semantic.success + '80',
        dark: colorTheme.semantic.success,
        contrastText: colorTheme.text.primary,
      },
      background: {
        default: colorTheme.background.primary,
        paper: colorTheme.background.card || colorTheme.background.secondary,
        secondary: colorTheme.background.secondary,
        tertiary: colorTheme.background.tertiary,
      },
      text: {
        primary: colorTheme.text.primary,
        secondary: colorTheme.text.secondary,
        disabled: colorTheme.text.tertiary,
      },
      divider: colorTheme.border.secondary,
      accent: {
        main: colorTheme.accent[500],
        light: colorTheme.accent[300],
        dark: colorTheme.accent[700],
        contrastText: colorTheme.text.primary,
      },
    },
    typography: {
      fontFamily: 'var(--font-inter), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            background: `linear-gradient(120deg, ${colorTheme.primary[500]}, ${colorTheme.secondary[500]} 45%, ${colorTheme.accent[500]})`,
            color: colorTheme.text.primary,
            '&:hover': {
              background: `linear-gradient(120deg, ${colorTheme.primary[600]}, ${colorTheme.secondary[600]} 45%, ${colorTheme.accent[600]})`,
            },
          },
          outlined: {
            borderColor: colorTheme.border.primary,
            color: colorTheme.text.primary,
            backgroundColor: colorTheme.background.card,
            backdropFilter: 'blur(20px)',
            '&:hover': {
              borderColor: colorTheme.border.focus,
              backgroundColor: colorTheme.background.tertiary,
            },
          },
          text: {
            color: colorTheme.text.primary,
            '&:hover': {
              backgroundColor: colorTheme.background.secondary,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: colorTheme.background.card,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: `1px solid ${colorTheme.border.secondary}`,
            borderRadius: 24,
            boxShadow: `0 25px 80px ${colorTheme.background.primary}75`,
            transition: 'all 0.4s ease',
            '&:hover': {
              transform: 'translateY(-6px) scale(1.01)',
              borderColor: colorTheme.border.focus,
              boxShadow: `0 45px 80px ${colorTheme.background.primary}55`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            background: colorTheme.background.card,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          },
          elevation1: {
            boxShadow: `0 25px 80px ${colorTheme.background.primary}75`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              backgroundColor: colorTheme.background.secondary,
              backdropFilter: 'blur(20px)',
              '& fieldset': {
                borderColor: colorTheme.border.secondary,
              },
              '&:hover fieldset': {
                borderColor: colorTheme.border.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colorTheme.border.focus,
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: colorTheme.text.secondary,
              '&.Mui-focused': {
                color: colorTheme.border.focus,
              },
            },
            '& .MuiInputBase-input': {
              color: colorTheme.text.primary,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: colorTheme.text.primary,
            '&::placeholder': {
              color: colorTheme.text.tertiary,
              opacity: 0.7,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: colorTheme.background.secondary,
            backdropFilter: 'blur(20px)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colorTheme.border.secondary,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colorTheme.border.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colorTheme.border.focus,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: colorTheme.background.secondary,
            color: colorTheme.text.primary,
            border: `1px solid ${colorTheme.border.secondary}`,
            '&:hover': {
              backgroundColor: colorTheme.background.tertiary,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: colorTheme.background.card,
            backdropFilter: 'blur(45px) saturate(200%)',
            WebkitBackdropFilter: 'blur(45px) saturate(200%)',
            borderRadius: 32,
            border: `1px solid ${colorTheme.border.primary}`,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: `${colorTheme.background.primary}65`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: colorTheme.background.card,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: `1px solid ${colorTheme.border.secondary}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: colorTheme.background.card,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRight: `1px solid ${colorTheme.border.secondary}`,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: colorTheme.background.tertiary,
            },
            '&.Mui-selected': {
              backgroundColor: `${colorTheme.primary[500]}20`,
              color: colorTheme.primary[500],
              '&:hover': {
                backgroundColor: `${colorTheme.primary[500]}30`,
              },
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            '&:hover': {
              backgroundColor: colorTheme.background.tertiary,
            },
            '&.Mui-selected': {
              backgroundColor: `${colorTheme.primary[500]}20`,
              color: colorTheme.primary[500],
              '&:hover': {
                backgroundColor: `${colorTheme.primary[500]}30`,
              },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': {
              color: colorTheme.primary[500],
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: colorTheme.primary[500],
          },
        },
      },
    },
  });
};
