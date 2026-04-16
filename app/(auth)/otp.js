import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { sendOtp, verifyOtp } from '../../lib/api';
import { MOCK_OTP, COLORS } from '../../lib/constants';
import { useAuthStore } from '../../lib/store/authStore';
import Button from '../../components/ui/Button';
import OtpInput from '../../components/ui/OtpInput';

// ---------------------------------------------------------------------------
// Resend cooldown (seconds)
// ---------------------------------------------------------------------------
const RESEND_COOLDOWN = 30;

// ---------------------------------------------------------------------------
// OTP verification screen — Delivery Partner
// ---------------------------------------------------------------------------

export default function OtpScreen() {
  const { phone } = useLocalSearchParams();
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  // ---- Resend cooldown timer ----
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ---- Mask phone for display ----
  const maskedPhone = phone
    ? phone.slice(0, 2) + '****' + phone.slice(6)
    : '';

  // ---- Submit ----
  const handleVerify = useCallback(
    async (code) => {
      if (loading) return;
      setLoading(true);
      setError('');

      try {
        const data = await verifyOtp({
          phone,
          otp: code || otp,
          role: 'delivery',
        });
        await login(data.token, data.user);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Invalid OTP. Please try again.';
        setError(msg);
        setOtp('');
      } finally {
        setLoading(false);
      }
    },
    [phone, otp, loading, login],
  );

  // ---- Resend ----
  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      await sendOtp(phone);
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 bg-background"
        >
          <View className="flex-1 px-6 pt-4">
            {/* ---- Back button ---- */}
            <Animated.View entering={FadeIn.duration(400)}>
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-surface items-center justify-center mb-8"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </Animated.View>

            {/* ---- Header ---- */}
            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
              <Text className="text-2xl text-text font-bold mb-2" style={{ fontFamily: 'Inter_700Bold' }}>
                Enter verification code
              </Text>
              <Text className="text-base text-text-secondary mb-8" style={{ fontFamily: 'Inter_400Regular' }}>
                Sent to +91 {maskedPhone}
              </Text>
            </Animated.View>

            {/* ---- OTP boxes ---- */}
            <Animated.View entering={FadeInDown.duration(500).delay(250)}>
              <OtpInput
                length={6}
                value={otp}
                onChange={(code) => {
                  setOtp(code);
                  if (error) setError('');
                }}
                onComplete={handleVerify}
                error={!!error}
              />

              {/* ---- Error message ---- */}
              {error ? (
                <Text
                  className="text-sm text-error mt-3 text-center"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {error}
                </Text>
              ) : null}

              {/* ---- Verify button ---- */}
              <View className="mt-8">
                <Button
                  title="Verify"
                  onPress={() => handleVerify(otp)}
                  loading={loading}
                  disabled={otp.length < 6}
                />
              </View>

              {/* ---- Resend link ---- */}
              <View className="mt-6 items-center">
                {cooldown > 0 ? (
                  <Text
                    className="text-sm text-text-secondary"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Resend OTP in {cooldown}s
                  </Text>
                ) : (
                  <Text
                    onPress={handleResend}
                    className="text-sm text-primary font-semibold"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Resend OTP
                  </Text>
                )}
              </View>

              {/* ---- Dev hint ---- */}
              {__DEV__ && (
                <Text
                  className="text-xs text-text-muted text-center mt-4"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Dev OTP: {MOCK_OTP}
                </Text>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
