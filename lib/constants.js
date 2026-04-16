export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.45:4000';

export const COLORS = {
  primary: '#2E7D32',
  'primary-dark': '#1B5E20',
  'primary-light': '#E8F5E9',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  'surface-dark': '#EEEEEE',
  text: '#1C1C1E',
  'text-secondary': '#6B7280',
  error: '#D32F2F',
  border: '#E5E5E5',
  warning: '#F57C00',
  success: '#2E7D32',
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
