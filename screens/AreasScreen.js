import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Share } from 'react-native';
import { useFocusEffect as useNavFocus } from '@react-navigation/native';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';
import { Button } from '../components/Button';

export default function AreasScreen({ navigation }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [storesCounts, setStoresCounts] = useState({});

  useEffect(() => {
    LocalAuth.isAdmin().then(setIsAdmin);
  }, []);

  useNavFocus(
    React.useCallback(() => {
      loadAreas();
    }, [])
  );

  const loadAreas = async () => {
    setLoading(true);
    try {
      const data = await InventoryDB.getAreas();
      const allStores = await InventoryDB.getAllStores();
      const counts = {};
      allStores.forEach(store => {
        counts[store.area_id] = (counts[store.area_id] || 0) + 1;
      });
      setStoresCounts(counts);
      setAreas(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await InventoryDB.deleteArea(id);
    loadAreas();
  };

  const handleEdit = (area) => {
    navigation.navigate('AreaForm', {
      areaId: area.id,
      name: area.name,
      description: area.description || ''
    });
  };

  const handleShare = async (area) => {
    await Share.share({ title: 'Compartir área', message: `Área: ${area.name}\nDescripción: ${area.description || 'Sin descripción'}` });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Áreas</Text>
      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : areas.length === 0 ? (
        <Text style={styles.emptyText}>No hay áreas. Crea una para empezar.</Text>
      ) : (
        <FlatList
          data={areas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable style={styles.cardContent} onPress={() => navigation.navigate('AreaDetail', { areaId: item.id })}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.description || 'Sin descripción'}</Text>
                <Text style={styles.cardMeta}>Locales: {storesCounts[item.id] || 0}</Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable onPress={() => handleShare(item)} style={styles.inlineButton}>
                  <Text style={styles.inlineText}>Compartir</Text>
                </Pressable>

                {isAdmin && (
                  <Pressable onPress={() => handleEdit(item)} style={styles.inlineButton}>
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
          )}
          scrollEnabled={true}
        />
      )}
      {isAdmin && <Button onPress={() => navigation.navigate('AreaForm')} style={styles.addBtn}>+ Crear Área</Button>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  loadingText: { textAlign: 'center', color: '#475569', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#475569', marginTop: 20 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDesc: { fontSize: 12, color: '#64748b', marginTop: 4 },
  cardMeta: { fontSize: 12, color: '#475569', marginTop: 6, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  inlineButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#e2e8f0' },
  inlineButtonDanger: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fee2e2', marginLeft: 8 },
  inlineText: { color: '#1f2937', fontWeight: '700', fontSize: 12 },
  addBtn: { marginTop: 16 }
});
