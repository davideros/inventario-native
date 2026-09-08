import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';
import { Button } from '../components/Button';

export default function ProductFormScreen({ navigation, route }) {
  const { productId, storeId, readOnly: routeReadOnly } = route.params || {};
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [description, setDescription] = useState('');
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    LocalAuth.isAdmin().then((admin) => {
      const isReadOnly = !admin || routeReadOnly;
      setReadOnly(isReadOnly);
      if (!admin && !productId) {
        Alert.alert('Acceso restringido', 'No tienes permiso para crear productos.', [{ text: 'Aceptar', onPress: () => navigation.goBack() }]);
      }
    });
  }, [navigation, productId, routeReadOnly]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    const product = await InventoryDB.getProduct(productId);
    if (product) {
      setName(product.name || '');
      setCode(product.code || '');
      setQuantity((product.quantity || 0).toString());
      setDescription(product.description || '');
    }
  };

  const handleSave = async () => {
    if (readOnly) {
      navigation.goBack();
      return;
    }
    if (!name.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }
    const data = { name, code, quantity: parseInt(quantity) || 0, description };
    if (productId) {
      await InventoryDB.updateProduct(productId, data);
    } else {
      await InventoryDB.createProduct({ ...data, store_id: storeId });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{productId ? (readOnly ? 'Ver producto' : 'Editar Producto') : 'Nuevo Producto'}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
          editable={!readOnly}
        />

        <Text style={styles.label}>Código</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: SKU-001"
          value={code}
          onChangeText={setCode}
          placeholderTextColor="#9ca3af"
          editable={!readOnly}
        />

        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
          editable={!readOnly}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#9ca3af"
          editable={!readOnly}
        />

        {!readOnly ? (
          <Button onPress={handleSave}>Guardar</Button>
        ) : (
          <Button onPress={handleSave} variant='secondary'>Volver</Button>
        )}
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
  form: { gap: 12 },
  label: { fontSize: 14, color: '#334155', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, backgroundColor: '#fff', color: '#0f172a' },
  cancelBtn: { textAlign: 'center', color: '#64748b', marginTop: 12, fontWeight: '600' }
});
