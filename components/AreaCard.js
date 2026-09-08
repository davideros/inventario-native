import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function AreaCard({ area, colors, onEdit, onDelete, onShare }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.colorDot,
            { backgroundColor: area.color || '#3b82f6' },
          ]}
        />
        <Text style={[styles.title, { color: colors.text }]}>{area.name}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => onShare(area)}
        >
          <Text style={styles.buttonText}>Compartir</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: colors.warning }]}
          onPress={() => onEdit(area)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: colors.danger }]}
          onPress={() => onDelete(area.id)}
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});