import React from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

import { COLORS } from '../lib/constants';

/**
 * Big prominent online/offline toggle for the delivery dashboard.
 *
 * Online: primary green background, white text, radio-outline icon
 * Offline: neutral background, textSecondary text, radio-button-off-outline
 * Smooth color transition animation between states.
 */
export default function OnlineToggle({ isOnline, onToggle, loading = false }) {
  const progress = useDerivedValue(() =>
    withTiming(isOnline ? 1 : 0, { duration: 400 }),
  );

  const animatedCardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#F1F5F9', COLORS.primary],
    ),
  }));

  return (
    <Animated.View
      style={animatedCardStyle}
      className="rounded-xl p-6 mx-4 mt-4 shadow-md"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-4">
          <Ionicons
            name={isOnline ? 'radio-outline' : 'radio-button-off-outline'}
            size={28}
            color={isOnline ? '#FFFFFF' : COLORS.textMuted}
            style={{ marginRight: 12 }}
          />
          <View>
            <Text
              className={`text-xl font-bold ${isOnline ? 'text-white' : 'text-text-secondary'}`}
              style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }}
            >
              {isOnline ? "You're Online" : "You're Offline"}
            </Text>
            <Text
              className={`text-sm mt-1 ${isOnline ? 'text-white/80' : 'text-text-muted'}`}
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {isOnline
                ? 'You will receive new orders'
                : 'Toggle to start receiving orders'}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={isOnline ? '#FFFFFF' : COLORS.primary}
          />
        ) : (
          <Switch
            value={isOnline}
            onValueChange={onToggle}
            trackColor={{ false: '#CBD5E1', true: '#FFFFFF40' }}
            thumbColor={isOnline ? '#FFFFFF' : '#94A3B8'}
            style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
          />
        )}
      </View>
    </Animated.View>
  );
}
