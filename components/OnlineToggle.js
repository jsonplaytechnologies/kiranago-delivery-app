import React from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';

import { COLORS } from '../lib/constants';

/**
 * Big prominent online/offline toggle for the delivery dashboard.
 *
 * Shows a large switch with "You're Online" / "You're Offline" text
 * and green/gray coloring.
 *
 * @param {object}   props
 * @param {boolean}  props.isOnline  - Current online status
 * @param {function} props.onToggle  - Called with the new boolean value
 * @param {boolean}  [props.loading] - Shows spinner while toggling
 */
export default function OnlineToggle({ isOnline, onToggle, loading = false }) {
  return (
    <View
      className={`rounded-2xl p-6 mx-4 mt-4 ${isOnline ? 'bg-primary-light' : 'bg-surface'}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text
            className={`text-2xl font-bold ${isOnline ? 'text-primary' : 'text-text-secondary'}`}
          >
            {isOnline ? "You're Online" : "You're Offline"}
          </Text>
          <Text className="text-sm text-text-secondary mt-1">
            {isOnline
              ? 'You will receive new orders'
              : 'Toggle to start receiving orders'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <Switch
            value={isOnline}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: '#81C784' }}
            thumbColor={isOnline ? COLORS.primary : '#9CA3AF'}
            style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }}
          />
        )}
      </View>
    </View>
  );
}
