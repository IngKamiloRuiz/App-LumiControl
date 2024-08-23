import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { MunicipioProvider } from './screens/components/municipiesContext';
import Toast from 'react-native-toast-message';
import Navigation from "./Navigation";
import { AuthProvider, useAuth } from './screens/Login/authContext';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MunicipioProvider>
          <Navigation />
          <Toast />
        </MunicipioProvider>
      </NavigationContainer>
    </AuthProvider>
  );
}
