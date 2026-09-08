import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const DB_KEY = 'inventory_db';

export async function getDB() {
  try {
    const raw = await AsyncStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = { areas: [], stores: [], products: [], customFields: [], version: 2 };
      await AsyncStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const db = JSON.parse(raw);
    if (!db.stores) db.stores = [];
    if (!db.areas) db.areas = [];
    if (!db.products) db.products = [];
    if (!db.customFields) db.customFields = [];
    return db;
  } catch (e) {
    console.error('Failed to read DB:', e);
    return { areas: [], stores: [], products: [], customFields: [], version: 2 };
  }
}

export async function saveDB(db) {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save DB:', e);
    throw e;
  }
}

/* -------------------------
   EXPORT / IMPORT (JSON)
   ------------------------- */

export async function exportDatabase() {
  const db = await getDB();
  const content = JSON.stringify(db, null, 2);
  const filename = `inventory_export_${Date.now()}.json`;
  const dir = FileSystem.documentDirectory || '';
  const filePath = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(filePath, content, { encoding: FileSystem.EncodingType.UTF8 });
  return { path: filePath, filename };
}

export async function importDatabase(data = {}, options = { clearBefore: false }) {
  if (!data || typeof data !== 'object') throw new Error('Datos inválidos para importar');
  if (options.clearBefore) {
    await resetDB();
  }
  const current = await getDB();
  const db = {
    areas: Array.isArray(data.areas) ? data.areas : [],
    stores: Array.isArray(data.stores) ? data.stores : [],
    products: Array.isArray(data.products) ? data.products : [],
    customFields: Array.isArray(data.customFields) ? data.customFields : [],
    version: data.version || current.version || 2,
    adminPassword: data.adminPassword ?? current.adminPassword ?? null
  };
  await saveDB(db);
  return true;
}

export async function importDBFromJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('JSON inválido');
  }
  await importDatabase(parsed, { clearBefore: true });
}

/* -------------------------
   FILE SYSTEM HELPERS
   ------------------------- */

export async function saveDBToFile(filename) {
  const db = await getDB();
  const content = JSON.stringify(db, null, 2);
  const dir = FileSystem.documentDirectory || '';
  const filePath = `${dir}${filename}.json`;
  await FileSystem.writeAsStringAsync(filePath, content, { encoding: FileSystem.EncodingType.UTF8 });
  return filePath;
}

export async function saveCSVToFile(filename) {
  const csv = await exportDBAsCSV();
  const dir = FileSystem.documentDirectory || '';
  const filePath = `${dir}${filename}.csv`;
  await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
  return filePath;
}

export async function loadDBFromFile(uriOrFilename) {
  if (!uriOrFilename) throw new Error('Se requiere uri o nombre de archivo');
  let uri = uriOrFilename;
  const looksLikeFilename = !/^[a-zA-Z]+:\/\//.test(uri) && !uri.startsWith('/');
  if (looksLikeFilename) {
    const dir = FileSystem.documentDirectory || '';
    uri = `${dir}${uri}`;
  }
  const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
  await importDBFromJson(content);
  return true;
}

export async function listStorageFiles() {
  try {
    const dir = FileSystem.documentDirectory || '';
    if (!dir) return [];
    const files = await FileSystem.readDirectoryAsync(dir);
    return files.filter(name => name.endsWith('.json') || name.endsWith('.csv') || name.startsWith('inventory_export_'));
  } catch (e) {
    console.warn('listStorageFiles failed', e);
    return [];
  }
}

export async function getStorageDir() {
  return FileSystem.documentDirectory || '';
}

/* -------------------------
   CSV export helper
   ------------------------- */

export async function exportDBAsCSV() {
  const db = await getDB();
  const areaById = Object.fromEntries(db.areas.map(area => [area.id, area]));
  const storeById = Object.fromEntries(db.stores.map(store => [store.id, store]));

  const rows = [
    ['Tipo', 'Nombre', 'Código', 'Cantidad', 'Descripción', 'Área', 'Local', 'Campo personalizado', 'Valor', 'Entidad']
  ];

  db.areas.forEach(area => {
    rows.push([
      'Área',
      area.name || '',
      '',
      '',
      area.description || '',
      '',
      '',
      '',
      '',
      'area'
    ]);
  });

  db.stores.forEach(store => {
    rows.push([
      'Local',
      store.name || '',
      '',
      '',
      '',
      areaById[store.area_id]?.name || '',
      store.name || '',
      '',
      '',
      'store'
    ]);
  });

  db.products.forEach(product => {
    const store = storeById[product.store_id];
    rows.push([
      'Producto',
      product.name || '',
      product.code || '',
      product.quantity != null ? String(product.quantity) : '',
      product.description || '',
      store ? areaById[store.area_id]?.name || '' : '',
      store ? store.name || '' : '',
      '',
      '',
      'product'
    ]);
  });

  db.customFields.forEach(field => {
    rows.push([
      'Campo personalizado',
      field.name || '',
      '',
      '',
      '',
      '',
      '',
      field.value || '',
      field.entityType || '',
      field.entityId || ''
    ]);
  });

  return rows
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

/* -------------------------
   UTIL
   ------------------------- */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/* -------------------------
   AREAS / STORES / PRODUCTS
   (mantener funciones existentes)
   ------------------------- */

export async function getAreas() {
  const db = await getDB();
  return db.areas;
}

export async function getArea(id) {
  const db = await getDB();
  return db.areas.find(a => a.id === id) || null;
}

export async function createArea(data) {
  const db = await getDB();
  const area = { id: generateId(), ...data, created_at: new Date().toISOString() };
  db.areas.push(area);
  await saveDB(db);
  return area;
}

export async function updateArea(id, data) {
  const db = await getDB();
  const idx = db.areas.findIndex(a => a.id === id);
  if (idx === -1) return null;
  db.areas[idx] = { ...db.areas[idx], ...data };
  await saveDB(db);
  return db.areas[idx];
}

export async function deleteArea(id) {
  const db = await getDB();
  const storeIds = db.stores.filter(s => s.area_id === id).map(s => s.id);
  db.areas = db.areas.filter(a => a.id !== id);
  db.stores = db.stores.filter(s => s.area_id !== id);
  db.products = db.products.filter(p => !storeIds.includes(p.store_id));
  db.customFields = db.customFields.filter(f => f.area_id !== id);
  await saveDB(db);
}

export async function getStores(areaId) {
  const db = await getDB();
  return db.stores.filter(s => s.area_id === areaId);
}

export async function getAllStores() {
  const db = await getDB();
  return db.stores;
}

export async function getStore(id) {
  const db = await getDB();
  return db.stores.find(s => s.id === id) || null;
}

export async function createStore(data) {
  const db = await getDB();
  const store = { id: generateId(), ...data, created_at: new Date().toISOString() };
  db.stores.push(store);
  await saveDB(db);
  return store;
}

export async function updateStore(id, data) {
  const db = await getDB();
  const idx = db.stores.findIndex(s => s.id === id);
  if (idx === -1) return null;
  db.stores[idx] = { ...db.stores[idx], ...data };
  await saveDB(db);
  return db.stores[idx];
}

export async function moveStore(storeId, newAreaId) {
  const db = await getDB();
  const idx = db.stores.findIndex(s => s.id === storeId);
  if (idx === -1) return null;
  db.stores[idx] = { ...db.stores[idx], area_id: newAreaId };
  await saveDB(db);
  return db.stores[idx];
}

export async function moveProduct(productId, newStoreId) {
  const db = await getDB();
  const idx = db.products.findIndex(p => p.id === productId);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], store_id: newStoreId };
  await saveDB(db);
  return db.products[idx];
}

export async function deleteStore(id) {
  const db = await getDB();
  db.stores = db.stores.filter(s => s.id !== id);
  db.products = db.products.filter(p => p.store_id !== id);
  await saveDB(db);
}

export async function getProducts(storeId) {
  const db = await getDB();
  return db.products.filter(p => p.store_id === storeId);
}

export async function getProduct(id) {
  const db = await getDB();
  return db.products.find(p => p.id === id) || null;
}

export async function createProduct(data) {
  const db = await getDB();
  const product = { id: generateId(), ...data, created_at: new Date().toISOString() };
  db.products.push(product);
  await saveDB(db);
  return product;
}

export async function updateProduct(id, data) {
  const db = await getDB();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...data };
  await saveDB(db);
  return db.products[idx];
}

export async function deleteProduct(id) {
  const db = await getDB();
  db.products = db.products.filter(p => p.id !== id);
  await saveDB(db);
}

export async function searchProducts(query) {
  const db = await getDB();
  const lower = (query || '').toLowerCase();
  if (!lower) return db.products;
  return db.products.filter(p =>
    (p.name || '').toLowerCase().includes(lower) ||
    (p.code || '').toLowerCase().includes(lower) ||
    (p.description || '').toLowerCase().includes(lower)
  );
}

/* custom fields */
export async function getCustomFields() {
  const db = await getDB();
  return db.customFields;
}

export async function createCustomField(data) {
  const db = await getDB();
  const field = { id: generateId(), ...data, created_at: new Date().toISOString() };
  db.customFields.push(field);
  await saveDB(db);
  return field;
}

export async function deleteCustomField(id) {
  const db = await getDB();
  db.customFields = db.customFields.filter(field => field.id !== id);
  await saveDB(db);
}

/* reset DB */
export async function resetDB() {
  const db = await getDB();
  const resetData = {
    areas: [],
    stores: [],
    products: [],
    customFields: [],
    version: db.version || 2,
    adminPassword: db.adminPassword || null
  };
  await saveDB(resetData);
}