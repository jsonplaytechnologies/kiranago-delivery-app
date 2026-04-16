import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { sendOtp } from '../../lib/api';
import { MOCK_OTP } from '../../lib/constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// ---------------------------------------------------------------------------
// Phone number entry screen — Delivery Partner branding
// ---------------------------------------------------------------------------

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---- Validation ----
  const validate = () => {
    if (phone.length !== 10) {
      setError('Enter a 10-digit mobile number');
      return false;
    }
    if (!/^[6-9]/.test(phone)) {
      setError('Number must start with 6, 7, 8, or 9');
      return false;
    }
    setError('');
    return true;
  };

  // ---- Submit ----
  const handleContinue = async () => {
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await sendOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
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
          <View className="flex-1 px-6 pt-16">
            {/* ---- Brand header ---- */}
            <Animated.View entering={FadeIn.duration(600)} className="items-center mb-12">
              <Text className="text-4xl text-primary font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                KiranaGo
              </Text>
              <Text className="text-base text-text-secondary mt-1" style={{ fontFamily: 'Inter_500Medium' }}>
                Delivery Partner
              </Text>
            </Animated.View>

            {/* ---- Phone input section ---- */}
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Text className="text-xl text-text font-bold mb-1" style={{ fontFamily: 'Inter_700Bold' }}>
                Login to deliver
              </Text>
              <Text className="text-sm text-text-secondary mb-6" style={{ fontFamily: 'Inter_400Regular' }}>
                Enter your mobile number to get started
              </Text>

              <Input
                label="Mobile number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  if (error) setError('');
                }}
                placeholder="Enter 10-digit number"
                keyboardType="number-pad"
                maxLength={10}
                prefix="+91"
                error={error}
              />

              {/* ---- Continue button ---- */}
              <View className="mt-6">
                <Button
                  title="Continue"
                  onPress={handleContinue}
                  loading={loading}
                  disabled={phone.length < 10}
                />
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
