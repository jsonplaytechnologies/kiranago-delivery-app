import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

/**
 * Reusable text input with label, prefix, and error support.
 * Uses Inter font and unified design system colors.
 */
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  prefix,
  maxLength,
  className = '',
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-error'
    : focused
      ? 'border-primary'
      : 'border-border';

  return (
    <View className={`w-full ${className}`}>
      {label ? (
        <Text
          className="text-sm text-text-secondary mb-1.5 ml-1"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row items-center border-2 rounded-xl overflow-hidden bg-surface ${borderColor}`}
      >
        {prefix ? (
          <View className="bg-background px-3.5 py-3.5 border-r-2 border-border justify-center">
            <Text
              className="text-base text-text font-semibold"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {prefix}
            </Text>
          </View>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="#94A3B8"
          className="flex-1 px-4 py-3.5 text-base text-text"
          style={{ fontFamily: 'Inter_400Regular' }}
          {...rest}
        />
      </View>

      {error ? (
        <Text
          className="text-sm text-error mt-1.5 ml-1"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
