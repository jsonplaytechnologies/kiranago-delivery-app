import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { getDeliveryOrder, updateOrderStatus } from '../../../lib/api';
import {
  COLORS,
  STATUS_LABELS,
  NEXT_STATUS,
} from '../../../lib/constants';
import OrderActionButton from '../../../components/OrderActionButton';

// ---------------------------------------------------------------------------
// Status badge color helper
// ---------------------------------------------------------------------------

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'DELIVERED':
      return { bg: 'bg-success/10', textColor: '#22C55E' };
    case 'OUT_FOR_DELIVERY':
      return { bg: 'bg-accent-light', textColor: '#FF6B35' };
    case 'PACKED':
      return { bg: 'bg-primary-light', textColor: '#0D9F61' };
    case 'CANCELLED':
      return { bg: 'bg-error/10', textColor: '#EF4444' };
    default:
      return { bg: 'bg-background', textColor: '#475569' };
  }
};

// ---------------------------------------------------------------------------
// Order detail screen
// ---------------------------------------------------------------------------

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await getDeliveryOrder(id);
      setOrder(res.order);
    } catch {
      Alert.alert('Error', 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async (nextStatus) => {
    if (!nextStatus || updating) return;

    setUpdating(true);
    try {
      const res = await updateOrderStatus(id, nextStatus);
      setOrder(res.order);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to update order status.';
      Alert.alert('Error', msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6" edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
        <Text
          className="text-lg text-text-secondary mt-3 text-center"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          Order not found
        </Text>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusBadgeStyle(order.status);
  const shortId = order.id?.slice(-6).toUpperCase();

  // Calculate subtotal from items
  const subtotal = order.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  ) || 0;
  const total = Number(order.total || 0);
  const deliveryFee = total > subtotal ? total - subtotal : 0;

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
            Order #{shortId}
          </Text>
          <View className="flex-1" />
          <View className={`px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
            <Text
              className="text-sm"
              style={{ fontFamily: 'Inter_600SemiBold', color: statusStyle.textColor }}
            >
              {STATUS_LABELS[order.status] || order.status}
            </Text>
          </View>
        </View>
        {order.createdAt && (
          <Text
            className="text-sm text-text-muted mt-1 ml-[52px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Placed on{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </Animated.View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ---- Address card ---- */}
        {order.address && (
          <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mx-4 mb-4">
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
                <Text
                  className="text-base text-text ml-2"
                  style={{ fontFamily: 'Inter_700Bold' }}
                >
                  Delivery Address
                </Text>
              </View>
              {order.address.label && (
                <Text
                  className="text-sm text-text mb-1"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {order.address.label}
                </Text>
              )}
              <Text
                className="text-sm text-text-secondary"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {[
                  order.address.street,
                  order.address.area,
                  order.address.city,
                  order.address.pincode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              {order.address.phone && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="call-outline" size={14} color={COLORS.textSecondary} />
                  <Text
                    className="text-sm text-text-secondary ml-1"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {order.address.phone}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* ---- Items card ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mx-4 mb-4">
          <View className="bg-surface rounded-lg p-4 shadow-sm">
            <Text
              className="text-base text-text mb-3"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              Items ({order.items?.length || 0})
            </Text>
            {order.items?.map((item, index) => (
              <View
                key={item.id || index}
                className={`flex-row items-center justify-between py-3 ${
                  index < order.items.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View className="flex-1 mr-4">
                  <Text
                    className="text-sm text-text"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {item.product?.name || item.name || 'Item'}
                  </Text>
                  <Text
                    className="text-xs text-text-muted"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {item.quantity} x Rs. {Number(item.price || 0).toFixed(0)}
                  </Text>
                </View>
                <Text
                  className="text-sm text-text"
                  style={{ fontFamily: 'Inter_700Bold' }}
                >
                  Rs. {Number((item.price || 0) * (item.quantity || 0)).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ---- Price card ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mx-4 mb-4">
          <View className="bg-surface rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-sm text-text-secondary"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Subtotal
              </Text>
              <Text
                className="text-sm text-text"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                Rs. {subtotal.toFixed(0)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-sm text-text-secondary"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Delivery Fee
              </Text>
              <Text
                className="text-sm text-text"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                Rs. {deliveryFee.toFixed(0)}
              </Text>
            </View>
            <View className="border-t border-border mt-1 pt-3">
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-base text-text"
                  style={{ fontFamily: 'Inter_700Bold' }}
                >
                  Total
                </Text>
                <Text
                  className="text-xl text-primary"
                  style={{ fontFamily: 'Inter_700Bold' }}
                >
                  Rs. {total.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ---- Status timeline ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mx-4 mb-4">
          <View className="bg-surface rounded-lg p-4 shadow-sm">
            <Text
              className="text-base text-text mb-3"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              Status Timeline
            </Text>
            {['PLACED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(
              (step, index) => {
                const statusOrder = [
                  'PLACED',
                  'PACKED',
                  'OUT_FOR_DELIVERY',
                  'DELIVERED',
                ];
                const currentIndex = statusOrder.indexOf(order.status);
                const stepIndex = index;
                const isCompleted = stepIndex <= currentIndex;
                const isCurrent = stepIndex === currentIndex;

                return (
                  <View key={step} className="flex-row items-start mb-3">
                    <View className="items-center mr-3">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          isCompleted ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        ) : (
                          <View className="w-2 h-2 rounded-full bg-text-muted" />
                        )}
                      </View>
                      {index < 3 && (
                        <View
                          className={`w-0.5 h-6 ${
                            stepIndex < currentIndex ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                    </View>
                    <Text
                      className={`text-sm pt-0.5 ${
                        isCurrent
                          ? 'text-primary'
                          : isCompleted
                            ? 'text-text'
                            : 'text-text-muted'
                      }`}
                      style={{
                        fontFamily: isCurrent
                          ? 'Inter_700Bold'
                          : isCompleted
                            ? 'Inter_600SemiBold'
                            : 'Inter_400Regular',
                      }}
                    >
                      {STATUS_LABELS[step]}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ---- Action button (sticky bottom, safe area padded) ---- */}
      <SafeAreaView
        edges={['bottom']}
        className="bg-surface border-t border-border px-6 pt-4 pb-2"
      >
        <OrderActionButton
          status={order.status}
          onPress={handleStatusUpdate}
          loading={updating}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}
