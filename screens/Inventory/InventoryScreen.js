import React, { useState } from "react";
import {View, Text, StyleSheet, ScrollView, ActivityIndicator} from "react-native";
import { Input } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { Button } from '@rneui/themed';
import * as Location from 'expo-location';

const InventoryScreen = () => {
    const [selectedValue, setSelectedValue] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const renderInputs = () => {
        let inputs = [];
        for (let i = 0; i < selectedValue; i++) {
          inputs.push(
            <View>
                <Text style={styles.label}>Luminaria {i + 1}</Text>
                <Input
                key={`Serial-${i + 1}`}
                placeholder={`Serial`}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                />
                <Input
                key={`Collarin-${i + 1}`}
                placeholder={`Collarin`}
                containerStyle={styles.dynamicInputContainer}
                inputStyle={styles.input}
                />
            </View>
          );
        }
        return inputs;
      };

    const getLocation = async () => {
        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
            setErrorMsg('Permiso para acceder a la ubicación denegado');
            setIsLoading(false);
            return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
            setLocation(location);
        } catch (error) {
            setErrorMsg('Error al obtener la ubicación');
        } finally {
            setIsLoading(false);
        }
    };
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Input
          placeholder="Barrio"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <Input
          placeholder="Altura poste"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <View style={styles.inputContainer}>
            <Button key="geolocalizacion" title="Obtener Geolocalización" onPress={getLocation} style={styles.label}/>
            {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
            {location && (
                <Text style={styles.locationText}>
                Latitud: {location.coords.latitude}, Longitud: {location.coords.longitude}
                </Text>
            )}
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        <Text style={styles.label}>Cantidad de Luminarias</Text>
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
          <Picker.Item label="1" value={1} />
          <Picker.Item label="2" value={2} />
          <Picker.Item label="3" value={3} />
          <Picker.Item label="4" value={4} />
        </Picker>

        {renderInputs()}

      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: 'white',
      borderRadius: 5,
      borderColor: '#ccc',
      borderWidth: 1,
    },
    label: {
      fontSize: 18,
      marginBottom: 10,
      color: '#333',
    },
    picker: {
      height: 50,
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 5,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 20,
    },
    dynamicInputContainer: {
      marginBottom: 15,
    },
  });

export default InventoryScreen;