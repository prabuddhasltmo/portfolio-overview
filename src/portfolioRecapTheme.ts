import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tealBlue?: {
      light: string;
      main: string;
      medium: string;
      dark: string;
    };
    neutral?: {
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
    ui?: {
      iconBlue: string;
      bgHover: string;
      border: string;
      divider: string;
      textQuaternary: string;
      textPrimary: string;
      popoverShadow: string;
      tableHeaderBg: string;
      tableHeaderText: string;
      tableRowBorder: string;
      menuIcon: string;
    };
    green?: {
      dark: string;
      light: string;
    };
    blue?: string;
  }

  interface PaletteOptions {
    tealBlue?: {
      light: string;
      main: string;
      medium: string;
      dark: string;
    };
    neutral?: Record<string, string>;
    ui?: Record<string, string>;
    green?: { dark: string; light: string };
    blue?: string;
  }
}

const portfolioRecapTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#007bff' },
    secondary: { main: '#003399' },
    success: { main: '#16a34a', light: '#dcfce7', dark: '#15803d' },
    error: { main: '#dc2626', light: '#fee2e2', dark: '#b91c1c' },
    warning: { main: '#f59e0b', light: '#fef3c7', dark: '#d97706' },
    info: { main: '#0288d1' },
    text: {
      primary: '#29323A',
      secondary: '#52595F',
    },
    background: { default: '#F8F8FF' },
    blue: '#116FDD',
    tealBlue: {
      light: '#F3F8FD',
      main: '#0E7E88',
      medium: '#AFEAF1',
      dark: '#003E44',
    },
    neutral: {
      50: '#F6F7F9',
      100: '#F0F2F6',
      200: '#E1E7EE',
      300: '#9CA3AF',
      400: '#6B7280',
      500: '#52595F',
      600: '#4B5563',
      700: '#374151',
      800: '#29323A',
      900: '#111827',
    },
    ui: {
      iconBlue: '#0070E8',
      bgHover: '#F5F5F5',
      border: '#E1E7EE',
      divider: '#F0F2F6',
      textQuaternary: '#47505B',
      textPrimary: '#20272F',
      popoverShadow:
        '0px -0.5px 2px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(15, 17, 19, 0.15)',
      tableHeaderBg: '#F7F8FA',
      tableHeaderText: '#555',
      tableRowBorder: '#f0f0f0',
      menuIcon: '#68717E',
    },
    green: {
      dark: '#3D805C',
      light: '#4ADE80',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    body1: { fontSize: '16px', fontWeight: 400 },
    body2: { fontSize: '14px', lineHeight: 2, fontWeight: 400 },
    h3: { fontSize: '40px', fontWeight: 500 },
    h4: { fontSize: '28px', fontWeight: 400 },
    h5: { fontSize: '20px', fontWeight: 400 },
  },
});

export default portfolioRecapTheme;
