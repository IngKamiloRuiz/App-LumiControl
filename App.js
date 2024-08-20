import React from "react";
import Navigation from "./Navigation";
import { MunicipioProvider } from './screens/components/municipiesContext';
import Toast from 'react-native-toast-message';

export default function App() {
  return (    
    <MunicipioProvider>
      <Navigation/>
      <Toast />
    </MunicipioProvider>    
  );
}
