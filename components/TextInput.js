import React from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet } from 'react-native';

export function TextInput({ label, placeholder, value, onChangeText, secureTextEntry = false, editable = true }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={editable}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#1f2937' },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    fontSize: 14, 
    color: '#111827'
  }
});
