/**
 * KiranaGo Design System — Single source of truth
 * Used by tailwind.config.js, components, and navigation theming.
 *
 * Brand: Fresh, fast, trustworthy grocery delivery.
 * Typography: Inter (all weights via @expo-google-fonts/inter)
 */

export const colors = {
  primary: {
    DEFAULT: '#0D9F61',
    light: '#E6F7EF',
    dark: '#087A4A',
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#0D9F61',
    600: '#087A4A',
    700: '#065F39',
  },
  accent: {
    DEFAULT: '#FF6B35',
    light: '#FFF0EB',
    dark: '#E55A28',
    50: '#FFF7ED',
    100: '#FFEDD5',
    500: '#FF6B35',
    600: '#E55A28',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  border: '#E2E8F0',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
