import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

/**
 * OTP input with individual digit boxes.
 *
 * A single hidden <TextInput> captures all keyboard input.
 * Visible "boxes" mirror each character of the hidden input's value.
 */
export default function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  error = false,
}) {
  const inputRef = useRef(null);

  const handleChange = (text) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(digits);

    if (digits.length === length && onComplete) {
      onComplete(digits);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View className="w-full">
      {/* Hidden input that receives all keyboard events */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        caretHidden
        style={{
          position: 'absolute',
          opacity: 0,
          height: 1,
          width: 1,
        }}
      />

      {/* Visible digit boxes */}
      <Pressable onPress={focusInput}>
        <View className="flex-row justify-between">
          {Array.from({ length }, (_, i) => {
            const digit = value[i] || '';
            const isActive = i === value.length && !error;
            const boxBorder = error
              ? 'border-error'
              : isActive
                ? 'border-primary'
                : digit
                  ? 'border-text'
                  : 'border-border';

            return (
              <View
                key={i}
                className={`w-12 h-14 border-2 rounded-lg items-center justify-center ${boxBorder}`}
              >
                <Text className="text-xl font-bold text-text">
                  {digit}
                </Text>
              </View>
            );
          })}
        </View>
      </Pressable>
    </View>
  );
}
