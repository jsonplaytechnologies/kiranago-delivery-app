export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.45:4000';

export const COLORS = {
  primary: '#0D9F61',
  primaryLight: '#E6F7EF',
  primaryDark: '#087A4A',
  accent: '#FF6B35',
  accentLight: '#FFF0EB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const APP_NAME = 'KiranaGo Delivery';

// Shown to the user in dev for convenience (backend mock OTP)
export const MOCK_OTP = '123456';

// Order status flow for delivery partners
export const ORDER_STATUS = {
  PLACED: 'PLACED',
  PACKED: 'PACKED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Next status mapping for action buttons
export const NEXT_STATUS = {
  PLACED: 'PACKED',
  PACKED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

// Human-readable labels for action buttons
export const STATUS_ACTION_LABELS = {
  PLACED: 'Mark as Packed',
  PACKED: 'Out for Delivery',
  OUT_FOR_DELIVERY: 'Mark Delivered',
  DELIVERED: 'Completed',
};

// Human-readable labels for display
export const STATUS_LABELS = {
  PLACED: 'Placed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
