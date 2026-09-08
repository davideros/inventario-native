import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WelcomeScreen from '../screens/WelcomeScreen';
import AreasScreen from '../screens/AreasScreen';
import AreaFormScreen from '../screens/AreaFormScreen';
import AreaDetailScreen from '../screens/AreaDetailScreen';
import StoreDetailScreen from '../screens/StoreDetailScreen';
import StoreFormScreen from '../screens/StoreFormScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AreasStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTintColor: '#1f2937',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="AreasList"
        component={AreasScreen}
        options={{ title: 'Áreas', headerBackVisible: false }}
      />
      <Stack.Screen
        name="AreaForm"
        component={AreaFormScreen}
        options={{ title: 'Nueva Área' }}
      />
      <Stack.Screen
        name="AreaDetail"
        component={AreaDetailScreen}
        options={{ title: 'Área' }}
      />
      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{ title: 'Local' }}
      />
      <Stack.Screen
        name="StoreForm"
        component={StoreFormScreen}
        options={{ title: 'Nuevo Local' }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: 'Producto' }}
      />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
      }}
    >
      <Tab.Screen
        name="AreasTab"
        component={AreasStackNavigator}
        options={{
          tabBarLabel: 'Áreas',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📍</Text>,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Configuración',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Home" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}

