import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Share, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';
import { Button } from '../components/Button';

export default function AreaDetailScreen({ navigation, route }) {
  const { areaId } = route.params;
  const [stores, setStores] = useState([]);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allAreas, setAllAreas] = useState([]);
  const [moveModal, setMoveModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    LocalAuth.isAdmin().then(setIsAdmin);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const areaData = await InventoryDB.getArea(areaId);
      const storesData = await InventoryDB.getStores(areaId);
      const areas = await InventoryDB.getAreas();
      setArea(areaData);
      setStores(storesData);
      setAllAreas(areas.filter(a => a.id !== areaId));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (storeId) => {
    await InventoryDB.deleteStore(storeId);
    loadData();
  };

  const handleShareArea = async () => {
    if (!area) return;
    await Share.share({ title: 'Compartir área', message: `Área: ${area.name}\nDescripción: ${area.description || 'Sin descripción'}` });
  };

  const handleShareStore = async (store) => {
    await Share.share({ title: 'Compartir local', message: `Local: ${store.name}` });
  };

  const handleMoveStore = async (targetAreaId) => {
    if (!selectedStore) return;
    await InventoryDB.moveStore(selectedStore.id, targetAreaId);
    setMoveModal(false);
    setSelectedStore(null);
    loadData();
  };

  return (
    <View style={styles.container}>
      {area && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{area.name}</Text>
            <Pressable style={styles.shareButton} onPress={handleShareArea}>
              <Text style={styles.shareText}>Compartir</Text>
            </Pressable>
          </View>
          <Text style={styles.desc}>{area.description || 'Sin descripción'}</Text>
        </>
      )}

      <Text style={styles.subtitle}>Locales ({stores.length})</Text>

      {loading ? (
        <Text style={styles.emptyText}>Cargando...</Text>
      ) : stores.length === 0 ? (
        <Text style={styles.emptyText}>No hay locales en esta área.</Text>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable style={styles.cardContent} onPress={() => navigation.navigate('StoreDetail', { storeId: item.id })}>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable onPress={() => handleShareStore(item)} style={styles.inlineButton}>
                  <Text style={styles.inlineText}>Compartir</Text>
                </Pressable>
                {isAdmin && (
                  <>
                    <Pressable onPress={() => { setSelectedStore(item); setMoveModal(true); }} style={styles.inlineButton}>
                      <Text style={styles.inlineText}>Mover</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteStore(item.id)} style={styles.inlineButtonDanger}>
                      <Text style={styles.inlineText}>Eliminar</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}

      {isAdmin && <Button onPress={() => navigation.navigate('StoreForm', { areaId })} style={styles.addBtn}>+ Crear Local</Button>}

      <Modal visible={moveModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mover local a...</Text>
            <ScrollView>
              {allAreas.length === 0 ? (
                <Text style={styles.emptyText}>No hay otras áreas disponibles</Text>
              ) : (
                allAreas.map(area => (
                  <Pressable
                    key={area.id}
                    style={styles.areaOption}
                    onPress={() => handleMoveStore(area.id)}
                  >
                    <Text style={styles.areaOptionText}>{area.name}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
            <Button onPress={() => { setMoveModal(false); setSelectedStore(null); }} variant="secondary">
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#475569', marginTop: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  inlineButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#e2e8f0', marginLeft: 8 },
  inlineButtonDanger: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fee2e2', marginLeft: 8 },
  inlineText: { color: '#1f2937', fontWeight: '700', fontSize: 12 },
  shareButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#e2e8f0' },
  shareText: { fontSize: 12, color: '#1f2937', fontWeight: '700' },
  addBtn: { marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  areaOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  areaOptionText: { fontSize: 14, color: '#1f2937' }
});

