import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export function Button({ onPress, children, variant = 'primary', disabled = false, style }) {
  const variantStyle = variant === 'primary' ? styles.primary : styles.secondary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#4f46e5' },
  secondary: { backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#d1d5db' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 14, fontWeight: '600' },
  primaryText: { color: '#fff' },
  secondaryText: { color: '#111827' }
});
