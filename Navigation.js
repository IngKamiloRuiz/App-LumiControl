import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import StorageScreen from "./screens/StorageScreen";
import InventoryScreen from "./screens/Inventory/InventoryScreen";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomTitle from "./components/navigation/Title";
import LoginScreen from "./screens/Login/Login";
import { useAuth } from './screens/Login/authContext';

const HomeStack = createNativeStackNavigator();
const StorageStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator initialRouteName="HomeScreen">
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={{ headerTitle: () => <CustomTitle /> }} />
      <HomeStack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventario' }} />
    </HomeStack.Navigator>
  );
}

function StorageStackScreen() {
  return (
    <StorageStack.Navigator initialRouteName="StorageScreen">
      <StorageStack.Screen name="StorageScreen" component={StorageScreen} options={{ title: 'Almacenamiento' }} />
    </StorageStack.Navigator>
  );
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: '#2289DC' }}>
      <Tab.Screen name="Home" component={HomeStackScreen} options={{
        headerShown: false,
        tabBarLabel: 'Inicio',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home-circle" size={size} color={color} />
        ),
      }} />
      <Tab.Screen name="Storage" component={StorageStackScreen} options={{
        headerShown: false,
        tabBarLabel: 'Almacenamiento',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="progress-upload" size={size} color={color} />
        ),
      }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MyTabs /> : <AuthStackScreen />;
}