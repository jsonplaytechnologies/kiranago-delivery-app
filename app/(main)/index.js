import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '../../lib/store/authStore';
import { updateDeliveryMe, getDeliveryOrders } from '../../lib/api';
import { COLORS, STATUS_LABELS } from '../../lib/constants';
import OnlineToggle from '../../components/OnlineToggle';

// ---------------------------------------------------------------------------
// Dashboard — main screen for delivery partners
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const { user, partner, updatePartner } = useAuthStore();

  const [isOnline, setIsOnline] = useState(partner?.isOnline || false);
  const [toggling, setToggling] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- Fetch dashboard data ----
  const fetchDashboard = useCallback(async () => {
    try {
      const activeRes = await getDeliveryOrders({
        status: 'OUT_FOR_DELIVERY',
        limit: 1,
      });

      let order = activeRes.orders?.[0] || null;
      if (!order) {
        const packedRes = await getDeliveryOrders({
          status: 'PACKED',
          limit: 1,
        });
        order = packedRes.orders?.[0] || null;
      }
      if (!order) {
        const placedRes = await getDeliveryOrders({
          status: 'PLACED',
          limit: 1,
        });
        order = placedRes.orders?.[0] || null;
      }

      setCurrentOrder(order);

      const deliveredRes = await getDeliveryOrders({
        status: 'DELIVERED',
        limit: 100,
      });
      setTodayCount(deliveredRes.orders?.length || 0);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [fetchDashboard]);

  const handleToggle = async (value) => {
    setToggling(true);
    try {
      const res = await updateDeliveryMe({ isOnline: value });
      setIsOnline(value);
      updatePartner(res.partner);
    } catch {
      setIsOnline(!value);
    } finally {
      setToggling(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* ---- Header ---- */}
      <Animated.View entering={FadeIn.duration(400)} className="px-6 pb-4 pt-2 bg-background">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-2xl text-primary font-bold"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            KiranaGo Delivery
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/profile')}
            className="w-10 h-10 bg-primary-light rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ---- Online toggle (PROMINENT) ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <OnlineToggle
            isOnline={isOnline}
            onToggle={handleToggle}
            loading={toggling}
          />
        </Animated.View>

        {/* ---- Stats card ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mx-4 mt-4">
          <View className="bg-surface rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center">
              <Ionicons name="bicycle-outline" size={22} color={COLORS.primary} />
              <Text
                className="text-sm text-text-secondary ml-2"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                Today's Deliveries
              </Text>
            </View>
            <Text
              className="text-3xl text-primary mt-1"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              {todayCount}
            </Text>
          </View>
        </Animated.View>

        {/* ---- Current order card ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mx-4 mt-6">
          <Text
            className="text-lg text-text mb-3"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Current Order
          </Text>

          {loading ? (
            <View className="bg-surface rounded-xl p-6 items-center shadow-sm">
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : currentOrder ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(main)/order/${currentOrder.id}`)
                }
                activeOpacity={0.7}
                className="bg-surface rounded-xl p-4 shadow-sm border-l-4 border-primary"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className="text-base text-text"
                    style={{ fontFamily: 'Inter_700Bold' }}
                  >
                    Order #{currentOrder.id?.slice(-6).toUpperCase()}
                  </Text>
                  <View className="bg-primary-light px-3 py-1 rounded-full">
                    <Text
                      className="text-xs text-primary"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {STATUS_LABELS[currentOrder.status] || currentOrder.status}
                    </Text>
                  </View>
                </View>

                {currentOrder.address && (
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                    <Text
                      className="text-sm text-text-secondary ml-1 flex-1"
                      numberOfLines={1}
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {currentOrder.address.street || currentOrder.address.label || 'Delivery address'}
                    </Text>
                  </View>
                )}

                <Text
                  className="text-sm text-text-secondary"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {currentOrder.items?.length || 0} item(s)
                </Text>

                <View className="flex-row items-center mt-3">
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                  <Text
                    className="text-sm text-primary ml-1"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    View Details
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View className="bg-surface rounded-xl p-8 items-center shadow-sm">
              <Ionicons
                name="bicycle-outline"
                size={56}
                color={COLORS.textMuted}
              />
              <Text
                className="text-base text-text-secondary mt-3"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                No active orders
              </Text>
              <Text
                className="text-sm text-text-muted mt-1 text-center"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {isOnline
                  ? 'New orders will appear here'
                  : 'Go online to receive orders'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ---- Quick actions ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mx-4 mt-6 mb-8">
          <Text
            className="text-lg text-text mb-3"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Quick Actions
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => router.push('/(main)/orders')}
              className="flex-1 bg-surface rounded-xl p-4 mr-2 items-center shadow-sm"
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={24} color={COLORS.primary} />
              <Text
                className="text-sm text-text mt-2"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                All Orders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(main)/profile')}
              className="flex-1 bg-surface rounded-xl p-4 ml-2 items-center shadow-sm"
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              <Text
                className="text-sm text-text mt-2"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
