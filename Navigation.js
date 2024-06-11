import React from "react"
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import HomeScreen from "../lumicontrol/screens/HomeScreen"
import StorageScreen from "../lumicontrol/screens/StorageScreen"
import InventoryScreen from "../lumicontrol/screens/Inventory/InventoryScreen"
import { NavigationContainer } from "@react-navigation/native"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomTitle from "./components/navigation/Title"

const InventoryStackNavigator = createNativeStackNavigator();

  function StackHome () {
    return(
      <InventoryStackNavigator.Navigator
        initialRouteName="HomeScreen"
      >
        <InventoryStackNavigator.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            headerTitle: () => <CustomTitle />
          }}
        />
        <InventoryStackNavigator.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{ title: 'Inventario' }}
        />        
      </InventoryStackNavigator.Navigator>

    )
  }

  function StackStorage () {
    return(
      <InventoryStackNavigator.Navigator
        initialRouteName="HomeStorage"
      >
        <InventoryStackNavigator.Screen
          name="StorageScreen"
          component={StorageScreen}
          options={{
            headerTitle: () => <CustomTitle />
          }}
        />        
      </InventoryStackNavigator.Navigator>

    )
  }

  const Tab = createBottomTabNavigator()

  function MyTabs() {
    return(
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions= {{
                tabBarActiveTintColor: '#7171F4'
            }}
        >
            <Tab.Screen name="Home"
             component={StackHome}
             options={{
                headerShown: false,
                tabBarLabel: 'Inicio',
                tabBarIcon: ({color, size}) => (                 
                    <MaterialCommunityIcons name="home-circle" size={size} color={color} />
                )
             }}
             />
            <Tab.Screen name="Storage"
            component={StackStorage}
            options={{
                headerShown: false,
                tabBarLabel: 'Almacenamiento',                
                tabBarIcon: ({color, size}) => (                    
                    <MaterialCommunityIcons name="progress-upload" size={size} color={color} />
                ),     
             }}/>

        </Tab.Navigator>
    )
  }

  export default function Navigation(){
    return (
        <NavigationContainer>
            <MyTabs/>
        </NavigationContainer>
    )
  }