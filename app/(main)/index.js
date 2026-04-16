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
      // Fetch assigned orders (active ones)
      const activeRes = await getDeliveryOrders({
        status: 'OUT_FOR_DELIVERY',
        limit: 1,
      });

      // If no out-for-delivery, check packed
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

      // Count delivered today (placeholder — backend may not filter by date yet)
      const deliveredRes = await getDeliveryOrders({
        status: 'DELIVERED',
        limit: 100,
      });
      setTodayCount(deliveredRes.orders?.length || 0);
    } catch {
      // Silently fail — dashboard will show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ---- Auto-refresh every 30 seconds ----
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // ---- Pull to refresh ----
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [fetchDashboard]);

  // ---- Toggle online/offline ----
  const handleToggle = async (value) => {
    setToggling(true);
    try {
      const res = await updateDeliveryMe({ isOnline: value });
      setIsOnline(value);
      updatePartner(res.partner);
    } catch {
      // Revert on failure
      setIsOnline(!value);
    } finally {
      setToggling(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* ---- Header ---- */}
      <View className="bg-primary px-6 pb-4 pt-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">
              KiranaGo
            </Text>
            <Text className="text-sm text-white/70">Delivery Partner</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(main)/profile')}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

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
        {/* ---- Online toggle ---- */}
        <OnlineToggle
          isOnline={isOnline}
          onToggle={handleToggle}
          loading={toggling}
        />

        {/* ---- Stats card ---- */}
        <View className="mx-4 mt-4 flex-row">
          <View className="flex-1 bg-surface rounded-xl p-4 mr-2">
            <Text className="text-sm text-text-secondary">Delivered Today</Text>
            <Text className="text-3xl font-bold text-primary mt-1">
              {todayCount}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 ml-2">
            <Text className="text-sm text-text-secondary">Status</Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-primary' : 'bg-text-secondary'}`}
              />
              <Text className="text-lg font-bold text-text">
                {isOnline ? 'Active' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* ---- Current order card ---- */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-text mb-3">
            Current Order
          </Text>

          {loading ? (
            <View className="bg-surface rounded-xl p-6 items-center">
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : currentOrder ? (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(main)/order/${currentOrder.id}`)
              }
              activeOpacity={0.7}
              className="bg-primary-light rounded-xl p-4 border border-primary/20"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-text">
                  Order #{currentOrder.id?.slice(-6).toUpperCase()}
                </Text>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-primary">
                    {STATUS_LABELS[currentOrder.status] || currentOrder.status}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-text-secondary mb-1">
                {currentOrder.items?.length || 0} item(s)
              </Text>
              {currentOrder.address && (
                <Text
                  className="text-sm text-text-secondary"
                  numberOfLines={1}
                >
                  {currentOrder.address.street || currentOrder.address.label || 'Delivery address'}
                </Text>
              )}
              <View className="flex-row items-center mt-3">
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                <Text className="text-sm font-semibold text-primary ml-1">
                  View Details
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="bg-surface rounded-xl p-6 items-center">
              <Ionicons
                name="bicycle-outline"
                size={40}
                color="#9CA3AF"
              />
              <Text className="text-base text-text-secondary mt-2">
                No active orders
              </Text>
              <Text className="text-sm text-text-secondary mt-1">
                {isOnline
                  ? 'New orders will appear here'
                  : 'Go online to receive orders'}
              </Text>
            </View>
          )}
        </View>

        {/* ---- Quick actions ---- */}
        <View className="mx-4 mt-6 mb-8">
          <Text className="text-lg font-bold text-text mb-3">
            Quick Actions
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => router.push('/(main)/orders')}
              className="flex-1 bg-surface rounded-xl p-4 mr-2 items-center"
            >
              <Ionicons name="list" size={24} color={COLORS.primary} />
              <Text className="text-sm font-semibold text-text mt-2">
                All Orders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(main)/profile')}
              className="flex-1 bg-surface rounded-xl p-4 ml-2 items-center"
            >
              <Ionicons name="person" size={24} color={COLORS.primary} />
              <Text className="text-sm font-semibold text-text mt-2">
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
