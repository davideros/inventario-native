import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';
import { Button } from '../components/Button';

export default function StoreFormScreen({ navigation, route }) {
  const { storeId, areaId } = route.params || {};
  const [name, setName] = useState('');

  useEffect(() => {
    LocalAuth.isAdmin().then((admin) => {
      if (!admin) {
        Alert.alert('Acceso restringido', 'Solo el administrador puede modificar locales.', [{ text: 'Aceptar', onPress: () => navigation.goBack() }]);
      }
    });
  }, [navigation]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('El nombre del local es requerido');
      return;
    }
    if (storeId) {
      await InventoryDB.updateStore(storeId, { name });
    } else {
      await InventoryDB.createStore({ name, area_id: areaId });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{storeId ? 'Editar Local' : 'Nuevo Local'}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre del Local</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Tienda Centro"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
          autoFocus
        />

        <Button onPress={handleSave}>Guardar</Button>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  form: { gap: 14 },
  label: { fontSize: 14, color: '#334155', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, backgroundColor: '#fff', color: '#0f172a' },
  cancelBtn: { textAlign: 'center', color: '#64748b', marginTop: 12, fontWeight: '600' }
});
