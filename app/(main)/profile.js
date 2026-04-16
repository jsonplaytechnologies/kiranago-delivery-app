import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../lib/store/authStore';
import { updateDeliveryMe } from '../../lib/api';
import { COLORS } from '../../lib/constants';
import Button from '../../components/ui/Button';

// ---------------------------------------------------------------------------
// Profile screen
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const { user, partner, logout, updatePartner } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const isOnline = partner?.isOnline || false;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            // Go offline before logging out
            try {
              await updateDeliveryMe({ isOnline: false });
            } catch {
              // Best effort
            }
            await logout();
          },
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* ---- Profile header ---- */}
      <View className="items-center pt-8 pb-6 px-6">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Ionicons name="person" size={40} color={COLORS.primary} />
        </View>

        <Text className="text-xl font-bold text-text">
          {user?.name || 'Delivery Partner'}
        </Text>
        <Text className="text-sm text-text-secondary mt-1">
          +91 {user?.phone || '----------'}
        </Text>

        {/* ---- Online status indicator ---- */}
        <View className="flex-row items-center mt-3">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-primary' : 'bg-text-secondary'}`}
          />
          <Text
            className={`text-sm font-semibold ${isOnline ? 'text-primary' : 'text-text-secondary'}`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* ---- Info rows ---- */}
      <View className="mx-6 bg-surface rounded-xl overflow-hidden mb-6">
        <View className="flex-row items-center px-4 py-4 border-b border-border">
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-xs text-text-secondary">Phone</Text>
            <Text className="text-base text-text">
              +91 {user?.phone || '----------'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center px-4 py-4 border-b border-border">
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-xs text-text-secondary">Name</Text>
            <Text className="text-base text-text">
              {user?.name || 'Not set'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center px-4 py-4 border-b border-border">
          <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-xs text-text-secondary">Role</Text>
            <Text className="text-base text-text">Delivery Partner</Text>
          </View>
        </View>

        <View className="flex-row items-center px-4 py-4">
          <Ionicons name="pulse-outline" size={20} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-xs text-text-secondary">Status</Text>
            <Text className={`text-base ${isOnline ? 'text-primary font-semibold' : 'text-text'}`}>
              {isOnline ? 'Online — Receiving orders' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* ---- App info ---- */}
      <View className="mx-6 mb-4">
        <Text className="text-xs text-text-secondary text-center">
          KiranaGo Delivery v1.0.0
        </Text>
        <Text className="text-xs text-text-secondary text-center mt-0.5">
          By JsonPlay Technologies
        </Text>
      </View>

      {/* ---- Logout button ---- */}
      <View className="mx-6 mb-8">
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          loading={loggingOut}
        />
      </View>
    </ScrollView>
  );
}
