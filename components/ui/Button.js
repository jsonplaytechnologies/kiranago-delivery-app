import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ---------------------------------------------------------------------------
// Variant style maps (NativeWind className strings)
// ---------------------------------------------------------------------------

const CONTAINER_VARIANTS = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-border',
  outline: 'bg-surface border-2 border-primary',
  danger: 'bg-error',
  accent: 'bg-accent',
  success: 'bg-success',
  disabled: 'bg-background',
};

const TEXT_VARIANTS = {
  primary: 'text-white',
  secondary: 'text-text',
  outline: 'text-primary',
  danger: 'text-white',
  accent: 'text-white',
  success: 'text-white',
  disabled: 'text-text-muted',
};

const INDICATOR_COLORS = {
  primary: '#FFFFFF',
  secondary: '#0F172A',
  outline: '#0D9F61',
  danger: '#FFFFFF',
  accent: '#FFFFFF',
  success: '#FFFFFF',
  disabled: '#94A3B8',
};

// ---------------------------------------------------------------------------
// Button component
// ---------------------------------------------------------------------------

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconSize = 20,
  className = '',
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isDisabled = disabled || loading;
  const effectiveVariant = isDisabled && variant !== 'disabled' ? variant : variant;

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`w-full flex-row items-center justify-center rounded-xl py-4 ${CONTAINER_VARIANTS[effectiveVariant]} ${isDisabled ? 'opacity-60' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={INDICATOR_COLORS[effectiveVariant]}
        />
      ) : (
        <View className="flex-row items-center">
          {icon ? (
            <Ionicons
              name={icon}
              size={iconSize}
              color={
                effectiveVariant === 'secondary' || effectiveVariant === 'outline'
                  ? '#0D9F61'
                  : effectiveVariant === 'disabled'
                    ? '#94A3B8'
                    : '#FFFFFF'
              }
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text
            className={`text-lg font-bold ${TEXT_VARIANTS[effectiveVariant]}`}
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            {title}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}
