import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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

  // Generate initials from user name
  const initials = (user?.name || 'D P')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
            Profile
          </Text>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 bg-background">
        {/* ---- Profile card ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mx-4 mt-4">
          <View className="bg-surface rounded-xl p-6 items-center shadow-sm">
            {/* Avatar */}
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
              <Text
                className="text-2xl text-white"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                {initials}
              </Text>
            </View>

            {/* Name */}
            <Text
              className="text-xl text-text"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              {user?.name || 'Delivery Partner'}
            </Text>

            {/* Phone */}
            <Text
              className="text-sm text-text-secondary mt-1"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              +91 {user?.phone || '----------'}
            </Text>

            {/* Delivery Partner badge */}
            <View className="bg-primary-light px-4 py-1.5 rounded-full mt-3">
              <Text
                className="text-sm text-primary"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Delivery Partner
              </Text>
            </View>

            {/* Online status indicator */}
            <View className="flex-row items-center mt-3">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-success' : 'bg-text-muted'}`}
              />
              <Text
                className={`text-sm ${isOnline ? 'text-success' : 'text-text-muted'}`}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ---- Menu items ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mx-4 mt-6">
          <View className="bg-surface rounded-xl overflow-hidden shadow-sm">
            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-border"
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <View className="ml-3 flex-1">
                <Text
                  className="text-xs text-text-muted"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Phone
                </Text>
                <Text
                  className="text-base text-text"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  +91 {user?.phone || '----------'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-border"
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <View className="ml-3 flex-1">
                <Text
                  className="text-xs text-text-muted"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Name
                </Text>
                <Text
                  className="text-base text-text"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {user?.name || 'Not set'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-4 py-4 border-b border-border"
              activeOpacity={0.7}
            >
              <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
              <View className="ml-3 flex-1">
                <Text
                  className="text-xs text-text-muted"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Role
                </Text>
                <Text
                  className="text-base text-text"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  Delivery Partner
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              activeOpacity={0.7}
            >
              <Ionicons name="pulse-outline" size={20} color={COLORS.primary} />
              <View className="ml-3 flex-1">
                <Text
                  className="text-xs text-text-muted"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Status
                </Text>
                <Text
                  className={`text-base ${isOnline ? 'text-success' : 'text-text'}`}
                  style={{ fontFamily: isOnline ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ---- Logout button ---- */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mx-4 mt-6">
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            loading={loggingOut}
            icon="log-out-outline"
          />
        </Animated.View>

        {/* ---- Footer ---- */}
        <Animated.View entering={FadeIn.duration(500).delay(400)} className="mt-8 mb-8 items-center">
          <Text
            className="text-xs text-text-muted text-center"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            KiranaGo by JsonPlay Technologies
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
