import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import * as InventoryDB from '../lib/inventoryDB';
import * as LocalAuth from '../lib/localAuth';
import { Button } from '../components/Button';

export default function AreaFormScreen({ navigation, route }) {
  const { areaId } = route.params || {};
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');

  useEffect(() => {
    LocalAuth.isAdmin().then((admin) => {
      if (!admin) {
        Alert.alert('Acceso restringido', 'Solo el administrador puede modificar áreas.', [{ text: 'Aceptar', onPress: () => navigation.goBack() }]);
      } else if (areaId) {
        loadArea();
      }
    });
  }, [navigation, areaId]);

  const loadArea = async () => {
    const area = await InventoryDB.getArea(areaId);
    if (area) {
      setName(area.name || '');
      setDescription(area.description || '');
    }
  };

  const addField = () => {
    if (!fieldName.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del campo personalizado.');
      return;
    }
    setCustomFields([...customFields, { id: Math.random().toString(), name: fieldName, type: fieldType }]);
    setFieldName('');
    setFieldType('text');
  };

  const removeField = (id) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('El nombre del área es requerido');
      return;
    }
    const data = { name, description };
    if (areaId) {
      await InventoryDB.updateArea(areaId, data);
    } else {
      await InventoryDB.createArea(data);
    }
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{areaId ? 'Editar Área' : 'Nueva Área'}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del área"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.sectionTitle}>Campos Personalizados</Text>

        <Text style={styles.label}>Nombre del Campo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Color, Serie, Marca"
          value={fieldName}
          onChangeText={setFieldName}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Tipo del Campo</Text>
        <View style={styles.typeSelector}>
          {['text', 'number', 'boolean', 'date'].map(type => (
            <Pressable
              key={type}
              onPress={() => setFieldType(type)}
              style={[styles.typeTag, fieldType === type && styles.typeTagActive]}
            >
              <Text style={[styles.typeText, fieldType === type && styles.typeTextActive]}>
                {type === 'text' ? 'Texto' : type === 'number' ? 'Número' : type === 'boolean' ? 'Verdadero/Falso' : 'Fecha'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button onPress={addField} variant="secondary" style={styles.addFieldBtn}>
          + Agregar Campo
        </Button>

        {customFields.length > 0 && (
          <View style={styles.fieldsList}>
            <Text style={styles.fieldsLabel}>Campos agregados:</Text>
            {customFields.map((field) => (
              <View key={field.id} style={styles.fieldItem}>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldItemName}>{field.name}</Text>
                  <Text style={styles.fieldItemType}>
                    {field.type === 'text' ? 'Texto' : field.type === 'number' ? 'Número' : field.type === 'boolean' ? 'Verdadero/Falso' : 'Fecha'}
                  </Text>
                </View>
                <Pressable onPress={() => removeField(field.id)}>
                  <Text style={styles.deleteFieldBtn}>Eliminar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Button onPress={handleSave}>Guardar</Button>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>Cancelar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  form: { gap: 14 },
  label: { fontSize: 14, color: '#334155', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, backgroundColor: '#fff', color: '#0f172a' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  typeTag: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f1f5f9', marginRight: 8, marginBottom: 8 },
  typeTagActive: { backgroundColor: '#4f46e5' },
  typeText: { fontSize: 12, color: '#475569' },
  typeTextActive: { color: '#fff', fontWeight: '600' },
  addFieldBtn: { marginBottom: 12 },
  fieldsList: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  fieldsLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, color: '#334155' },
  fieldItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  fieldInfo: { flex: 1 },
  fieldItemName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  fieldItemType: { fontSize: 12, color: '#64748b', marginTop: 4 },
  deleteFieldBtn: { color: '#dc2626', fontWeight: '600', fontSize: 12 },
  cancelBtn: { textAlign: 'center', color: '#64748b', marginTop: 12, fontWeight: '600' }
});
