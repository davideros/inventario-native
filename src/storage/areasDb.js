import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export const AREAS_KEY = 'inventory_areas_v1';

export async function loadAreas() {
  try {
    const raw = await AsyncStorage.getItem(AREAS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveAreas(areas) {
  await AsyncStorage.setItem(AREAS_KEY, JSON.stringify(areas));
}

export function normalizeArea(area) {
  return {
    id: area?.id || String(Date.now()),
    name: String(area?.name || '').trim(),
    color: area?.color || '#3b82f6',
  };
}

export async function exportAreasToJsonFile(areas) {
  const payload = { version: 1, exportedAt: new Date().toISOString(), areas };
  const fileName = `areas-${Date.now()}.json`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(
    fileUri,
    JSON.stringify(payload, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 }
  );

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Exportar áreas',
  });

  return fileUri;
}

export async function importAreasFromJsonFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return [];

  const fileUri = result.assets?.[0]?.uri;
  if (!fileUri) return [];

  const content = await FileSystem.readAsStringAsync(fileUri);
  const parsed = JSON.parse(content);

  const list = Array.isArray(parsed?.areas)
    ? parsed.areas
    : Array.isArray(parsed)
      ? parsed
      : [];

  return list.map(normalizeArea);
}