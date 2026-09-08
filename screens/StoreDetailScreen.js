import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Pressable, FlatList, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';
import * as XLSX from "xlsx";

export default function StoreDetailScreen({ navigation, route }) {
  const { storeId } = route.params;
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    LocalAuth.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await InventoryDB.getStore(storeId);
      const prods = await InventoryDB.getProducts(storeId);
      setStore(s);
      setProducts(prods || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await InventoryDB.deleteProduct(productId);
      await loadData();
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  const handleShareStore = async () => {
    try {
      const content = `Local: ${store?.name || ''}\nDirección: ${store?.address || ''}`;
      if (await Sharing.isAvailableAsync()) {
        const path = `${await InventoryDB.getStorageDir()}share_store_${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Compartir', content);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  const handleShareProduct = async (product) => {
    try {
      const content = `Producto: ${product.name}\nCantidad: ${product.quantity || 0}\nDescripción: ${product.description || ''}`;
      if (await Sharing.isAvailableAsync()) {
        const path = `${await InventoryDB.getStorageDir()}share_product_${product.id}.txt`;
        await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Compartir', content);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo compartir producto');
    }
  };

  const handleEditStore = () => {
    if (!store) return;
    navigation.navigate('StoreForm', {
      storeId: store.id,
      name: store.name,
      address: store.address || '',
      areaId: store.area_id || null
    });
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) return prev.filter(id => id !== productId);
      return [...prev, productId];
    });
  };

  const toggleSelectMode = () => {
    if (selectMode) {
      setSelectMode(false);
      setSelectedProducts([]);
    } else {
      setSelectMode(true);
      setSelectedProducts([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const exportSelectedAsXLSX = async () => {
    try {
      const sel = products.filter(p => selectedProducts.includes(p.id));
      if (sel.length === 0) {
        Alert.alert('Seleccione', 'No hay productos seleccionados');
        return;
      }
      const rows = sel.map(p => ({
        Nombre: p.name || '',
        Código: p.code || '',
        Cantidad: p.quantity != null ? p.quantity : '',
        Descripción: p.description || ''
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const path = `${await InventoryDB.getStorageDir()}products_selected_${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(path, wbout, { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Exportado', `Archivo guardado en: ${path}`);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Fallo al exportar XLSX');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{store?.name || 'Local'}</Text>

          <View style={styles.headerActions}>
            <Pressable style={[styles.smallButton, { marginRight: 6 }]} onPress={handleShareStore}>
              <Text style={styles.smallText}>Compartir</Text>
            </Pressable>

            {isAdmin && (
              <Pressable style={[styles.smallButton, { marginRight: 6 }]} onPress={handleEditStore}>
                <Text style={styles.smallText}>Editar</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.smallButton, selectMode ? styles.smallButtonActive : null]}
              onPress={toggleSelectMode}
            >
              <Text style={[styles.smallText, selectMode ? styles.smallTextActive : null]}>
                {selectMode ? 'Cancelar' : 'Seleccionar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toolbarRow}>
          {selectMode && (
            <View style={styles.selectTools}>
              <Pressable style={styles.inlineButton} onPress={toggleSelectAll}>
                <Text style={styles.inlineText}>
                  {selectedProducts.length === products.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.inlineButton}
                onPress={exportSelectedAsXLSX}
                disabled={selectedProducts.length === 0}
              >
                <Text style={styles.inlineText}>Exportar seleccionados (XLSX)</Text>
              </Pressable>
            </View>
          )}
        </View>

        {loading ? (
          <Text style={styles.emptyText}>Cargando...</Text>
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos.</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const selected = selectedProducts.includes(item.id);
              return (
                <View style={[styles.card, selected ? styles.cardSelected : null]}>
                  {selectMode && (
                    <Pressable
                      style={[styles.checkbox, selected ? styles.checkboxActive : null]}
                      onPress={() => toggleProductSelection(item.id)}
                    >
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                  )}

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.code || ''}</Text>
                    <Text style={styles.cardQty}>Cantidad: {item.quantity || 0}</Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable onPress={() => handleShareProduct(item)} style={styles.inlineButton}>
                      <Text style={styles.inlineText}>Compartir</Text>
                    </Pressable>

                    {isAdmin && (
                      <Pressable onPress={() => navigation.navigate('ProductForm', { productId: item.id })} style={styles.inlineButton}>
                        <Text style={styles.inlineText}>Editar</Text>
                      </Pressable>
                    )}

                    {isAdmin && (
                      <Pressable onPress={() => handleDelete(item.id)} style={styles.inlineButtonDanger}>
                        <Text style={styles.inlineText}>Eliminar</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  smallButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#e2e8f0' },
  smallButtonActive: { backgroundColor: '#4f46e5' },
  smallText: { fontSize: 12, color: '#1f2937', fontWeight: '700' },
  smallTextActive: { color: '#fff' },

  toolbarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  selectTools: { marginLeft: 8, flexDirection: 'row', alignItems: 'center' },

  emptyText: { textAlign: 'center', color: '#475569', marginTop: 20 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center' },
  cardSelected: { backgroundColor: '#f3f4f6' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  checkmark: { color: '#fff', fontWeight: 'bold' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, color: '#64748b' },
  cardQty: { fontSize: 12, color: '#475569', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  inlineButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#e2e8f0', marginLeft: 8 },
  inlineButtonDanger: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fee2e2', marginLeft: 8 },
  inlineText: { color: '#1f2937', fontWeight: '700', fontSize: 12 },
});