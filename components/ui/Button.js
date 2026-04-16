import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

// ---------------------------------------------------------------------------
// Variant style maps (NativeWind className strings)
// ---------------------------------------------------------------------------

const CONTAINER_VARIANTS = {
  primary: 'bg-primary active:opacity-90',
  secondary: 'bg-surface active:opacity-90',
  outline: 'bg-white border-2 border-primary',
  danger: 'bg-error active:opacity-90',
};

const TEXT_VARIANTS = {
  primary: 'text-white',
  secondary: 'text-text',
  outline: 'text-primary',
  danger: 'text-white',
};

const INDICATOR_COLORS = {
  primary: '#FFFFFF',
  secondary: '#1C1C1E',
  outline: '#2E7D32',
  danger: '#FFFFFF',
};

// ---------------------------------------------------------------------------
// Button component
// ---------------------------------------------------------------------------

/**
 * Reusable button with primary / secondary / outline / danger variants.
 *
 * @param {object} props
 * @param {string}   props.title         - Button label
 * @param {function} props.onPress       - Press handler
 * @param {'primary'|'secondary'|'outline'|'danger'} [props.variant='primary']
 * @param {boolean}  [props.loading]     - Shows spinner, disables press
 * @param {boolean}  [props.disabled]    - Disables press + dims opacity
 * @param {string}   [props.className]   - Extra NativeWind classes on container
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`w-full items-center justify-center rounded-xl py-4 ${CONTAINER_VARIANTS[variant]} ${isDisabled ? 'opacity-60' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={INDICATOR_COLORS[variant]}
        />
      ) : (
        <Text
          className={`text-lg font-bold ${TEXT_VARIANTS[variant]}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
