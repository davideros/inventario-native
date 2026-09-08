import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB, saveDB } from './inventoryDB';

const SESSION_KEY = 'inventory_session';

// --- Session ---
export async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get session:', e);
    return null;
  }
}

export async function setSession(role) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ role }));
  } catch (e) {
    console.error('Failed to set session:', e);
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export async function isAdmin() {
  const s = await getSession();
  return s?.role === 'admin';
}

export async function isGuest() {
  const s = await getSession();
  return s?.role === 'guest';
}

// --- Admin password stored in DB ---
async function getAdminPasswordFromDB() {
  const db = await getDB();
  return db.adminPassword || null;
}

async function saveAdminPasswordToDB(password) {
  const db = await getDB();
  db.adminPassword = password;
  await saveDB(db);
}

export async function getAdminPassword() {
  return await getAdminPasswordFromDB();
}

export async function setAdminPassword(password) {
  await saveAdminPasswordToDB(password);
}

export async function hasAdminPassword() {
  return !!(await getAdminPassword());
}

export async function verifyAdminPassword(password) {
  const stored = await getAdminPassword();
  if (!stored) return password.length >= 4;
  return stored === password;
}
