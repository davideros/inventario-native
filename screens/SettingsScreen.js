import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Alert, FlatList, Pressable, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '../components/Button';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';

export default function SettingsScreen({ navigation }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [storageFiles, setStorageFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    LocalAuth.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
    refreshFiles();
  }, []);

  const refreshFiles = async () => {
    setLoadingFiles(true);
    try {
      const files = await InventoryDB.listStorageFiles();
      setStorageFiles(files || []);
    } catch (e) {
      setStorageFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleExport = async () => {
    try {
      const { path } = await InventoryDB.exportDatabase();
      if (path && (await FileSystem.getInfoAsync(path)).exists) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path);
        } else {
          Alert.alert('Exportado', `Archivo guardado en: ${path}`);
        }
      } else {
        Alert.alert('Error', 'No se pudo crear el archivo de exportación');
      }
      await refreshFiles();
    } catch (err) {
      Alert.alert('Error', err.message || 'Fallo al exportar');
    }
  };

  const handleImportWithPicker = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (res.type !== 'success') return;
      const content = await FileSystem.readAsStringAsync(res.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const parsed = JSON.parse(content);
      Alert.alert(
        'Importar base de datos',
        '¿Deseas reemplazar la base de datos actual con el archivo importado?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            onPress: async () => {
              try {
                await InventoryDB.importDatabase(parsed, { clearBefore: true });
                Alert.alert('Importado', 'Importación completada');
              } catch (e) {
                Alert.alert('Error', e.message || 'Fallo al importar');
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Fallo al importar');
    }
  };

  const handleImportFromStorage = async (filename) => {
    try {
      await InventoryDB.loadDBFromFile(filename);
      Alert.alert('Importado', `Archivo ${filename} importado correctamente`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Fallo al importar desde almacenamiento');
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof LocalAuth.logout === 'function') {
        await LocalAuth.logout();
      }

      // sube hasta el root navigator disponible
      let root = navigation;
      while (root && typeof root.getParent === 'function') {
        const parent = root.getParent();
        if (!parent) break;
        root = parent;
      }

      const targetRoute = { index: 0, routes: [{ name: 'Welcome' }] };

      if (root && typeof root.reset === 'function') {
        root.reset(targetRoute);
      } else if (typeof navigation.reset === 'function') {
        navigation.reset(targetRoute);
      } else {
        // fallback
        navigation.navigate('Welcome');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }]}>
      <View style={styles.container}>
        <Text style={styles.title}>Configuración</Text>

        <Button onPress={handleExport} style={styles.button}>Exportar base de datos (JSON)</Button>

        {isAdmin && (
          <Button onPress={handleImportWithPicker} variant="secondary" style={styles.button}>
            Importar base de datos (Seleccionar archivo)
          </Button>
        )}

        {!isAdmin && (
          <View style={styles.guestSection}>
            <Text style={styles.sectionTitle}>Invitado</Text>
            <Button onPress={handleImportWithPicker} variant="secondary" style={styles.button}>
              Importar base de datos (desde almacenamiento)
            </Button>
          </View>
        )}

        <Button onPress={handleLogout} variant="danger" style={[styles.button, { marginTop: 12 }]}>Cerrar sesión</Button>

        <Text style={styles.sectionTitle}>Archivos en almacenamiento</Text>
        {loadingFiles ? (
          <Text>Cargando archivos...</Text>
        ) : storageFiles.length === 0 ? (
          <Text style={styles.emptyText}>No se encontraron archivos en el almacenamiento interno de la app.</Text>
        ) : (
          <FlatList
            data={storageFiles}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.fileRow}>
                <Text style={styles.fileName}>{item}</Text>
                <View style={styles.fileActions}>
                  <Pressable style={styles.inlineButton} onPress={() => handleImportFromStorage(item)}>
                    <Text style={styles.inlineText}>Importar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.inlineButton}
                    onPress={async () => {
                      const dir = await InventoryDB.getStorageDir();
                      const path = `${dir}${item}`;
                      if (await FileSystem.getInfoAsync(path).then(s => s.exists).catch(() => false)) {
                        if (await Sharing.isAvailableAsync()) {
                          await Sharing.shareAsync(path);
                        } else {
                          Alert.alert('Archivo', path);
                        }
                      } else {
                        Alert.alert('Error', 'Archivo no existe');
                      }
                    }}
                  >
                    <Text style={styles.inlineText}>Compartir</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}

        <Button onPress={refreshFiles} style={[styles.button, { marginTop: 12 }]}>Actualizar lista de archivos</Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  button: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  guestSection: { padding: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#475569' },
  fileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#e6edf3' },
  fileName: { flex: 1, color: '#0f172a' },
  fileActions: { flexDirection: 'row', alignItems: 'center' },
  inlineButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#e2e8f0', marginLeft: 8 },
  inlineText: { color: '#0f172a', fontWeight: '700' }
});