import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getDeliveryOrder, updateOrderStatus } from '../../../lib/api';
import {
  COLORS,
  STATUS_LABELS,
  NEXT_STATUS,
} from '../../../lib/constants';
import OrderActionButton from '../../../components/OrderActionButton';

// ---------------------------------------------------------------------------
// Order detail screen
// ---------------------------------------------------------------------------

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ---- Fetch order ----
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

  // ---- Update order status ----
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

  // ---- Status color helper ----
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: 'bg-primary/10', text: 'text-primary' };
      case 'OUT_FOR_DELIVERY':
        return { bg: 'bg-warning/10', text: 'text-warning' };
      case 'PACKED':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'CANCELLED':
        return { bg: 'bg-error/10', text: 'text-error' };
      default:
        return { bg: 'bg-surface', text: 'text-text-secondary' };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-lg text-text-secondary mt-3 text-center">
          Order not found
        </Text>
      </View>
    );
  }

  const statusStyle = getStatusBadgeStyle(order.status);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ---- Order header ---- */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-text">
              Order #{order.id?.slice(-6).toUpperCase()}
            </Text>
            <View className={`px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
              <Text className={`text-sm font-semibold ${statusStyle.text}`}>
                {STATUS_LABELS[order.status] || order.status}
              </Text>
            </View>
          </View>

          {order.createdAt && (
            <Text className="text-sm text-text-secondary mt-1">
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
        </View>

        {/* ---- Delivery address ---- */}
        {order.address && (
          <View className="mx-6 mb-4 bg-surface rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text className="text-base font-bold text-text ml-2">
                Delivery Address
              </Text>
            </View>
            {order.address.label && (
              <Text className="text-sm font-semibold text-text mb-1">
                {order.address.label}
              </Text>
            )}
            <Text className="text-sm text-text-secondary">
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
              <Text className="text-sm text-text-secondary mt-1">
                Phone: {order.address.phone}
              </Text>
            )}
          </View>
        )}

        {/* ---- Order items ---- */}
        <View className="mx-6 mb-4">
          <Text className="text-base font-bold text-text mb-3">
            Items ({order.items?.length || 0})
          </Text>
          {order.items?.map((item, index) => (
            <View
              key={item.id || index}
              className="flex-row items-center justify-between py-3 border-b border-border"
            >
              <View className="flex-1 mr-4">
                <Text className="text-sm font-semibold text-text">
                  {item.product?.name || item.name || 'Item'}
                </Text>
                <Text className="text-xs text-text-secondary">
                  Qty: {item.quantity}
                  {item.product?.unit ? ` x ${item.product.unit}` : ''}
                </Text>
              </View>
              <Text className="text-sm font-bold text-text">
                Rs. {Number(item.price * item.quantity || 0).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        {/* ---- Order total ---- */}
        <View className="mx-6 mb-4 bg-surface rounded-xl p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-text">Total</Text>
            <Text className="text-xl font-bold text-primary">
              Rs. {Number(order.total || 0).toFixed(0)}
            </Text>
          </View>
        </View>

        {/* ---- Status progress ---- */}
        <View className="mx-6 mb-4">
          <Text className="text-base font-bold text-text mb-3">
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
                        <View className="w-2 h-2 rounded-full bg-text-secondary" />
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
                        ? 'font-bold text-primary'
                        : isCompleted
                          ? 'font-semibold text-text'
                          : 'text-text-secondary'
                    }`}
                  >
                    {STATUS_LABELS[step]}
                  </Text>
                </View>
              );
            },
          )}
        </View>
      </ScrollView>

      {/* ---- Action button (sticky bottom) ---- */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 pb-8">
        <OrderActionButton
          status={order.status}
          onPress={handleStatusUpdate}
          loading={updating}
        />
      </View>
    </View>
  );
}
