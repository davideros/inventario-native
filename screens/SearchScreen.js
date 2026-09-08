import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, FlatList, Pressable, TextInput, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as InventoryDB from '../lib/inventoryDB';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const nav = useNavigation();
  const [query, setQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [areaResults, setAreaResults] = useState([]);
  const [storeResults, setStoreResults] = useState([]);

  useEffect(() => {
    let mounted = true;
    const runSearch = async () => {
      const q = (query || '').trim();
      if (!q) {
        if (mounted) {
          setProductResults([]);
          setAreaResults([]);
          setStoreResults([]);
        }
        return;
      }
      const prods = await InventoryDB.searchProducts(q);
      const allAreas = await InventoryDB.getAreas();
      const allStores = await InventoryDB.getAllStores();
      const areas = allAreas.filter(a => (a.name||'').toLowerCase().includes(q.toLowerCase()));
      const stores = allStores.filter(s => (s.name||'').toLowerCase().includes(q.toLowerCase()));
      const areaById = Object.fromEntries(allAreas.map(a => [a.id, a.name]));
      const storeById = Object.fromEntries(allStores.map(s => [s.id, s.name]));
      const prodsEnriched = prods.map(p => ({
        ...p,
        storeName: storeById[p.store_id] || '',
        areaName: areaById[ allStores.find(st => st.id === p.store_id)?.area_id ] || ''
      }));
      if (mounted) {
        setProductResults(prodsEnriched);
        setAreaResults(areas);
        setStoreResults(stores);
      }
    };
    runSearch();
    return () => { mounted = false; };
  }, [query]);

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }]}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Búsqueda</Text>
        <TextInput
          placeholder="Buscar productos, áreas o locales..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          autoFocus
        />

        <FlatList
          data={productResults}
          keyExtractor={item => `p-${item.id}`}
          ListHeaderComponent={productResults.length > 0 ? <Text style={styles.sectionTitle}>Productos</Text> : null}
          renderItem={({ item }) => (
            <Pressable style={styles.itemRow} onPress={() => nav.navigate('ProductDetail', { productId: item.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.storeName ? `Local: ${item.storeName}` : ''}{item.areaName ? ` • Área: ${item.areaName}` : ''}</Text>
              </View>
            </Pressable>
          )}
        />

        <FlatList
          data={storeResults}
          keyExtractor={item => `s-${item.id}`}
          ListHeaderComponent={storeResults.length > 0 ? <Text style={styles.sectionTitle}>Locales</Text> : null}
          renderItem={({ item }) => (
            <Pressable style={styles.itemRow} onPress={() => nav.navigate('StoreDetail', { storeId: item.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.address || ''}</Text>
              </View>
            </Pressable>
          )}
        />

        <FlatList
          data={areaResults}
          keyExtractor={item => `a-${item.id}`}
          ListHeaderComponent={areaResults.length > 0 ? <Text style={styles.sectionTitle}>Áreas</Text> : null}
          renderItem={({ item }) => (
            <Pressable style={styles.itemRow} onPress={() => nav.navigate('AreaDetail', { areaId: item.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.description || ''}</Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 12 },
  screenTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  searchInput: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  itemRow: { paddingVertical: 10, paddingHorizontal: 8, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e6edf3' },
  itemTitle: { fontSize: 14, fontWeight: '700' },
  itemMeta: { fontSize: 12, color: '#64748b', marginTop: 4 }
});