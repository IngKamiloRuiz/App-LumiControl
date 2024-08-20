import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MunicipioContext = createContext();

export const MunicipioProvider = ({ children }) => {
  const [municipio, setMunicipio] = useState('Garzón');

  useEffect(() => {
    const loadMunicipio = async () => {
      try {
        const storedMunicipio = await AsyncStorage.getItem('municipio');
        if (storedMunicipio) {
          setMunicipio(storedMunicipio);
        }
      } catch (error) {
        console.error('Failed to load municipio from AsyncStorage:', error);
      }
    };
    loadMunicipio();
  }, []);

  useEffect(() => {
    const saveMunicipio = async () => {
      try {
        await AsyncStorage.setItem('municipio', municipio);
      } catch (error) {
        console.error('Failed to save municipio to AsyncStorage:', error);
      }
    };
    saveMunicipio();
  }, [municipio]);

  return (
    <MunicipioContext.Provider value={{ municipio, setMunicipio }}>
      {children}
    </MunicipioContext.Provider>
  );
};

export const useMunicipio = () => useContext(MunicipioContext);