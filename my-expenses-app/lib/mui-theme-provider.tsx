"use client";

import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTheme } from './theme-context';
import { createMuiTheme } from './mui-theme';

interface MuiThemeProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that bridges the custom theme context with Material UI theme
 */
export const MuiThemeProviderWrapper: React.FC<MuiThemeProviderWrapperProps> = ({ children }) => {
  const { theme } = useTheme();
  
  const muiTheme = useMemo(() => {
    return createMuiTheme(theme);
  }, [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
