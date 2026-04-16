import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { sendOtp, verifyOtp } from '../../lib/api';
import { MOCK_OTP } from '../../lib/constants';
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
        // data: { token, user }
        await login(data.token, data.user);
        // Auth redirect is handled by root _layout watching isAuthenticated
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white px-6 pt-20">
          {/* ---- Header ---- */}
          <Text className="text-2xl font-bold text-text mb-2">
            Enter verification code
          </Text>
          <Text className="text-base text-text-secondary mb-8">
            Sent to +91 {maskedPhone}
          </Text>

          {/* ---- OTP boxes ---- */}
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
            <Text className="text-sm text-error mt-3 text-center">
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
              <Text className="text-sm text-text-secondary">
                Resend OTP in {cooldown}s
              </Text>
            ) : (
              <Text
                onPress={handleResend}
                className="text-sm font-semibold text-primary"
              >
                Resend OTP
              </Text>
            )}
          </View>

          {/* ---- Dev hint ---- */}
          {__DEV__ && (
            <Text className="text-xs text-text-secondary text-center mt-4 opacity-60">
              Dev OTP: {MOCK_OTP}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
