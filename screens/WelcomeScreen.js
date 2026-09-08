import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import * as LocalAuth from '../lib/localAuth';
import { Button } from '../components/Button';

export default function WelcomeScreen({ navigation }) {
  const [mode, setMode] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadState() {
      setIsFirstSetup(!(await LocalAuth.hasAdminPassword()));
    }
    loadState();
  }, []);

  const handleGuest = async () => {
    await LocalAuth.setSession('guest');
    navigation.navigate('Home');
  };

  const handleAdmin = async () => {
    setError('');
    if (isFirstSetup) {
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (password !== confirm) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      await LocalAuth.setAdminPassword(password);
    }
    const valid = await LocalAuth.verifyAdminPassword(password);
    if (!valid) {
      setError('Contraseña incorrecta.');
      return;
    }
    await LocalAuth.setSession('admin');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.brandIcon}>📦</Text>
        <Text style={styles.title}>Inventario</Text>
        <Text style={styles.subtitle}>Gestión local sin internet</Text>
      </View>

      {mode === null ? (
        <View style={styles.cards}>
          <Pressable style={styles.cardPrimary} onPress={() => setMode('admin')}>
            <Text style={styles.cardTitle}>Administrador</Text>
            <Text style={styles.cardText}>Acceso completo a la app</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={handleGuest}>
            <Text style={styles.cardTitle}>Invitado</Text>
            <Text style={styles.cardText}>Solo buscar y compartir productos</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <Pressable onPress={() => { setMode(null); setError(''); setPassword(''); setConfirm(''); }}>
            <Text style={styles.link}>← Volver</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>{isFirstSetup ? 'Crear contraseña de administrador' : 'Ingresar como administrador'}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {isFirstSetup && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite la contraseña"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}

          <Pressable onPress={() => setShowPassword(v => !v)}>
            <Text style={styles.toggle}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button onPress={handleAdmin}>{isFirstSetup ? 'Crear y entrar' : 'Entrar'}</Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  brand: { alignItems: 'center', marginBottom: 24 },
  brandIcon: { fontSize: 42, marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  cards: { width: '100%', maxWidth: 420 },
  card: { padding: 18, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  cardPrimary: { padding: 18, borderRadius: 18, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardText: { color: '#64748b', marginTop: 6 },
  form: { width: '100%', maxWidth: 420 },
  link: { color: '#334155', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, backgroundColor: '#fff', color: '#0f172a' },
  toggle: { color: '#475569', marginBottom: 12 },
  error: { color: '#b91c1c', backgroundColor: '#fecaca', padding: 10, borderRadius: 12, marginBottom: 12 },
});
