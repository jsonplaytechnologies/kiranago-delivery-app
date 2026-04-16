import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white px-6 pt-16">
          {/* ---- Dark green header bar ---- */}
          <View className="bg-primary rounded-2xl py-8 px-6 mb-8 -mx-6 -mt-16">
            <View className="pt-16">
              <Text className="text-3xl font-bold text-white text-center">
                KiranaGo
              </Text>
              <Text className="text-base text-white/80 text-center mt-1">
                Delivery Partner
              </Text>
            </View>
          </View>

          {/* ---- Phone input ---- */}
          <Text className="text-xl font-bold text-text mb-1">
            Login to deliver
          </Text>
          <Text className="text-sm text-text-secondary mb-6">
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
            <Text className="text-xs text-text-secondary text-center mt-4 opacity-60">
              Dev OTP: {MOCK_OTP}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
