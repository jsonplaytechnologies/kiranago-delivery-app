import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { getDeliveryOrders } from '../../lib/api';
import { COLORS, STATUS_LABELS, ORDER_STATUS } from '../../lib/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ---------------------------------------------------------------------------
// Status filter tabs
// ---------------------------------------------------------------------------

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: ORDER_STATUS.PLACED, label: 'Placed' },
  { key: ORDER_STATUS.PACKED, label: 'Packed' },
  { key: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'In Transit' },
  { key: ORDER_STATUS.DELIVERED, label: 'Delivered' },
];

// ---------------------------------------------------------------------------
// Status badge color helper
// ---------------------------------------------------------------------------

const getStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return { bg: 'bg-success/10', text: '#22C55E' };
    case 'OUT_FOR_DELIVERY':
      return { bg: 'bg-accent-light', text: '#FF6B35' };
    case 'PACKED':
      return { bg: 'bg-primary-light', text: '#0D9F61' };
    case 'CANCELLED':
      return { bg: 'bg-error/10', text: '#EF4444' };
    default:
      return { bg: 'bg-background', text: '#475569' };
  }
};

// ---------------------------------------------------------------------------
// Order card component
// ---------------------------------------------------------------------------

function OrderCard({ item, index }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const badge = getStatusBadge(item.status);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 60)}>
      <AnimatedTouchable
        onPress={() => router.push(`/(main)/order/${item.id}`)}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className="mx-4 mb-3 bg-surface rounded-lg p-4 shadow-sm"
      >
        {/* Top: order number + status badge */}
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="text-base text-text"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            #{item.id?.slice(-6).toUpperCase()}
          </Text>
          <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
            <Text
              className="text-xs"
              style={{ fontFamily: 'Inter_600SemiBold', color: badge.text }}
            >
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>

        {/* Middle: address + item count & total */}
        {item.address && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text
              className="text-sm text-text-secondary ml-1 flex-1"
              numberOfLines={1}
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {item.address.street || item.address.label || 'Delivery address'}
            </Text>
          </View>
        )}

        <Text
          className="text-sm text-text-secondary"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {item.items?.length || 0} item(s)
          {item.total ? ` | Rs. ${Number(item.total).toFixed(0)}` : ''}
        </Text>

        {/* Bottom: time ago */}
        <View className="flex-row items-center justify-between mt-3">
          <Text
            className="text-xs text-text-muted"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Orders list screen
// ---------------------------------------------------------------------------

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const params = { limit: 50, offset: 0 };
      if (filter !== 'ALL') {
        params.status = filter;
      }
      const res = await getDeliveryOrders(params);
      setOrders(res.orders || []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const renderOrder = ({ item, index }) => (
    <OrderCard item={item} index={index} />
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* ---- Header ---- */}
      <Animated.View entering={FadeIn.duration(400)} className="px-6 pt-2 pb-3 bg-background">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text
            className="text-xl text-text"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            My Orders
          </Text>
        </View>
      </Animated.View>

      {/* ---- Filter tabs ---- */}
      <Animated.View entering={FadeIn.duration(400).delay(100)} className="bg-background px-2 pb-3">
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-full mx-1 ${
                filter === item.key
                  ? 'bg-primary'
                  : 'bg-surface border border-border'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm ${
                  filter === item.key ? 'text-white' : 'text-text-secondary'
                }`}
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* ---- Orders list ---- */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
          <Text
            className="text-lg text-text-secondary mt-3 text-center"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            No orders found
          </Text>
          <Text
            className="text-sm text-text-muted mt-1 text-center"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {filter !== 'ALL'
              ? 'Try a different filter'
              : 'Orders assigned to you will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
