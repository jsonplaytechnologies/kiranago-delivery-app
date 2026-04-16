import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getDeliveryOrders } from '../../lib/api';
import { COLORS, STATUS_LABELS, ORDER_STATUS } from '../../lib/constants';

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
// Orders list screen
// ---------------------------------------------------------------------------

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---- Fetch orders ----
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

  // ---- Pull to refresh ----
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  // ---- Status color helper ----
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-primary/10 text-primary';
      case 'OUT_FOR_DELIVERY':
        return 'bg-warning/10 text-warning';
      case 'PACKED':
        return 'bg-blue-100 text-blue-600';
      case 'CANCELLED':
        return 'bg-error/10 text-error';
      default:
        return 'bg-surface text-text-secondary';
    }
  };

  // ---- Render order item ----
  const renderOrder = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(main)/order/${item.id}`)}
      activeOpacity={0.7}
      className="mx-4 mb-3 bg-white rounded-xl p-4 border border-border"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-bold text-text">
          #{item.id?.slice(-6).toUpperCase()}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
          <Text className={`text-xs font-semibold ${getStatusColor(item.status).split(' ')[1]}`}>
            {STATUS_LABELS[item.status] || item.status}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-text-secondary">
        {item.items?.length || 0} item(s)
        {item.total ? ` | Rs. ${Number(item.total).toFixed(0)}` : ''}
      </Text>

      {item.address && (
        <Text className="text-sm text-text-secondary mt-1" numberOfLines={1}>
          {item.address.street || item.address.label || 'Delivery address'}
        </Text>
      )}

      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-xs text-text-secondary">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-surface-dark">
      {/* ---- Filter tabs ---- */}
      <View className="bg-white px-2 py-3">
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-full mx-1 ${
                filter === item.key ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  filter === item.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ---- Orders list ---- */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
          <Text className="text-lg text-text-secondary mt-3 text-center">
            No orders found
          </Text>
          <Text className="text-sm text-text-secondary mt-1 text-center">
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
    </View>
  );
}
